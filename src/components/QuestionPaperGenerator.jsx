import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// ============================================
// CONFIGURATION
// ============================================
const API_BASE_URL = 'http://localhost:8000/api';

// ============================================
// LATEX RENDERING UTILITIES (KaTeX-based)
// ============================================

/**
 * Check if text contains LaTeX delimiters
 * Detects: $...$ (inline), $$...$$ (display), \(...\) (inline), \[...\] (display)
 */
const hasLatexDelimiters = (text) => {
  if (!text || typeof text !== 'string') return false;
  // Match $...$ (but not $$), $$...$$, \(...\), \[...\]
  return /\$\$[\s\S]+?\$\$|\$(?!\$)[^$\n]+?\$|\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]/.test(text);
};

/**
 * Check if text contains LaTeX commands (without delimiters)
 * These are commands that should be wrapped in delimiters for KaTeX
 */
const hasLatexCommands = (text) => {
  if (!text || typeof text !== 'string') return false;
  return /\\(?:frac|sqrt|int|sum|prod|alpha|beta|gamma|delta|theta|pi|sigma|omega|phi|lambda|mu|epsilon|rho|tau|Delta|Sigma|Omega|Pi|times|div|pm|mp|cdot|leq|geq|neq|approx|equiv|infty|rightarrow|leftarrow|Rightarrow|Leftarrow|therefore|because|forall|exists|in|notin|subset|supset|cup|cap|emptyset|sin|cos|tan|cot|sec|csc|log|ln|lim|vec|hat|bar|dot|ddot|overline|underline|overbrace|underbrace|binom|tbinom|dbinom|text|textbf|mathrm|mathbf|mathit|mathbb|mathcal|left|right|big|Big|bigg|Bigg|quad|qquad|,|;|!|:|partial|nabla|angle|triangle|square|circ|bullet|star|ast|oplus|otimes|perp|parallel|cong|sim|simeq|propto|degree)\b/.test(text);
};

/**
 * Check if text already contains Unicode mathematical symbols
 * These should be preserved and not processed as LaTeX
 */
const hasUnicodeMath = (text) => {
  if (!text || typeof text !== 'string') return false;
  // Common Unicode math symbols
  return /[²³⁴⁵⁶⁷⁸⁹⁰¹⁺⁻⁼⁽⁾ⁿ₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎√∛∜∫∬∭∮∯∰∱∲∳∑∏∐αβγδεζηθικλμνξοπρςστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ∞±×÷≤≥≠≈≡≢≣→←↑↓↔↕⇒⇐⇑⇓⇔⇕∴∵∀∃∄∈∉∋∌⊂⊃⊄⊅⊆⊇⊈⊉∪∩∅∧∨⊕⊖⊗⊘⊙·•°′″‴‵‶‷∂∇△▽□◇○●◦∠∡∢⊥∥∦≮≯≰≱≲≳≶≷≺≻≼≽⊀⊁⊰⊱⋖⋗⋘⋙⋚⋛⋜⋝]/.test(text);
};

/**
 * Check if text is purely Unicode (no LaTeX needed)
 * This prevents processing already-formatted Unicode text as LaTeX
 */
const isPureUnicode = (text) => {
  if (!text || typeof text !== 'string') return false;
  // If has Unicode math but no LaTeX delimiters or commands, it's pure Unicode
  return hasUnicodeMath(text) && !hasLatexDelimiters(text) && !hasLatexCommands(text);
};

/**
 * Check if text contains text-based math notation (without LaTeX delimiters)
 * Detects patterns like: x^2, 3^-1, (m+4)^2, x^2y, a^2 + b^2, 2^n, n^2
 * These use caret (^) for exponents in plain text format
 */
const hasTextMathNotation = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  // Pattern explanations:
  // \w+\^-?\d+ : variable/number followed by ^ and number (x^2, 3^-1)
  // \d+\^[a-zA-Z] : number followed by ^ and letter (2^n)
  // [a-zA-Z]\^[a-zA-Z] : letter ^ letter (a^n, n^2)
  // \([^)]+\)\^-?\w+ : parenthesized expression with exponent ((m+4)^2, (x+1)^6)
  
  const patterns = [
    /\w+\^-?\d+/,           // x^2, x^-1, 3^-1, 54x^3y
    /\d+\^[a-zA-Z]/,        // 2^n, 10^x
    /[a-zA-Z]\^[a-zA-Z]/,   // a^n, x^y, n^2
    /\([^)]+\)\^-?\w+/,     // (m+4)^2, (x-1)^6, (√2+1)^6
  ];
  
  return patterns.some(pattern => pattern.test(text));
};

/**
 * Convert text-based math notation to proper LaTeX
 * Transforms: x^2 -> $x^{2}$ for KaTeX rendering
 * Key: Only add braces INSIDE the $...$ delimiters, never expose raw braces
 */
const convertTextMathToLatex = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // Helper function to convert a math expression to LaTeX format
  const toLatex = (expr) => {
    let latex = expr;
    // Normalize number exponents: ^2 -> ^{2}, ^-1 -> ^{-1}, ^12 -> ^{12}
    latex = latex.replace(/\^(-?\d+)/g, '^{$1}');
    // Handle single letter exponents: ^n -> ^{n}, ^x -> ^{x}
    latex = latex.replace(/\^([a-zA-Z])(?![a-zA-Z0-9{])/g, '^{$1}');
    // Handle multiplication symbol
    latex = latex.replace(/×/g, ' \\times ');
    latex = latex.replace(/÷/g, ' \\div ');
    // Handle √ symbol - convert to \sqrt
    latex = latex.replace(/√/g, '\\sqrt');
    return latex;
  };
  
  let result = text;
  
  // Pattern 1: Parenthesized expressions with exponents - HIGHEST PRIORITY
  // Match: "(x+1)^6", "(√2+1)^6", "(x+1)^6+(x-1)^6", "(m - 4)(m + 4)"
  // EXCLUDE: MCQ options like "(a)", "(b)", "(c)", "(d)"
  // This pattern handles expressions like (...)^n or (...)^6 connected by + or -
  result = result.replace(
    /(\([^)]{2,}\)\^-?[a-zA-Z0-9]+(?:\s*[\+\-\*×]\s*\([^)]{2,}\)\^-?[a-zA-Z0-9]+)*)/g,
    (match) => {
      if (match.includes('$')) return match;
      return `$${toLatex(match)}$`;
    }
  );
  
  // Pattern 2: Single parenthesized expression with exponent (min 2 chars inside to exclude (a)^n)
  // Match: "(m + 4)^2", "(3^-1)^-1", "(√2+1)^6"
  result = result.replace(
    /(\([^)]{2,}\)\^-?[a-zA-Z0-9]+)/g,
    (match) => {
      if (match.includes('$')) return match;
      return `$${toLatex(match)}$`;
    }
  );
  
  // Pattern 3: Factored form without exponent - (a-b)(a+b) - min 2 chars inside each
  result = result.replace(
    /(\([^)]{2,}\)\s*\([^)]{2,}\))/g,
    (match) => {
      if (match.includes('$')) return match;
      return `$${toLatex(match)}$`;
    }
  );
  
  // Pattern 4: Polynomial expressions (terms with + or -)
  // Match: "x^2 + y^2", "x^2 + 12x - 45", "m^2 - 256", "x^2 + y^2-2ax"
  // A term can be: number, variable, or variable with exponent
  result = result.replace(
    /([a-zA-Z0-9]+\^-?[a-zA-Z0-9]+(?:\s*[\+\-]\s*[a-zA-Z0-9]+\^?-?[a-zA-Z0-9]*)+)/g,
    (match) => {
      if (match.includes('$')) return match;
      if (!match.includes('^')) return match;
      return `$${toLatex(match)}$`;
    }
  );
  
  // Pattern 5: Equation format with exponent - "a=b^2", "f(x)=..."
  result = result.replace(
    /([a-zA-Z])\s*=\s*([a-zA-Z0-9]+\^-?[a-zA-Z0-9]+)/g,
    (match, lhs, rhs) => {
      if (match.includes('$')) return match;
      return `$${lhs}=${toLatex(rhs)}$`;
    }
  );
  
  // Pattern 6: Number with letter exponent - "2^n", "10^x"
  result = result.replace(
    /(?<![a-zA-Z0-9$])(\d+\^[a-zA-Z])(?![a-zA-Z0-9])(?!\$)/g,
    (match) => `$${toLatex(match)}$`
  );
  
  // Pattern 7: Letter with number exponent - "n^2", "x^2", "b^2"
  result = result.replace(
    /(?<![a-zA-Z0-9$])([a-zA-Z]\^-?\d+)(?![a-zA-Z0-9])(?!\$)/g,
    (match) => `$${toLatex(match)}$`
  );
  
  // Pattern 8: Standalone number with number exponent (like 5^-1)
  result = result.replace(
    /(?<![a-zA-Z0-9$])(\d+\^-?\d+)(?![a-zA-Z0-9])(?!\$)/g,
    (match) => `$${toLatex(match)}$`
  );
  
  // Pattern 9: Complex variable terms with exponents
  // Match: "54x^3y", "81x^4y^2", "-20x^2yz", "27x^4y^2"
  result = result.replace(
    /(?<![a-zA-Z0-9$])(-?\d*[a-zA-Z]+(?:\^-?\d+[a-zA-Z]*)*)(?![a-zA-Z0-9])(?!\$)/g,
    (match, term) => {
      if (!match.includes('^')) return match;
      if (match.includes('$')) return match;
      return `$${toLatex(term)}$`;
    }
  );
  
  // Pattern 10: Handle MCQ options format - (a), (b), (c), (d) followed by math
  result = result.replace(
    /\(([a-d])\)\s*(\d*[a-zA-Z]*\^-?[a-zA-Z0-9]+[a-zA-Z0-9]*)/g,
    (match, option, expr) => {
      if (match.includes('$')) return match;
      if (!expr.includes('^')) return match;
      return `(${option}) $${toLatex(expr)}$`;
    }
  );
  
  // Clean up: Remove empty math blocks
  result = result.replace(/\$\s*\$/g, '');
  result = result.replace(/\$\$/g, '$');
  
  return result;
};

/**
 * Advanced text math processor
 * Handles complex expressions like polynomials, fractions written as text, etc.
 */
const processTextMathExpressions = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  let result = text;
  
  // Don't process if already has LaTeX delimiters
  if (hasLatexDelimiters(text)) return text;
  
  // Check if text has text-based math notation
  if (!hasTextMathNotation(text)) return text;
  
  // Helper function to convert expression to LaTeX (same as in convertTextMathToLatex)
  const toLatex = (expr) => {
    let latex = expr.replace(/\^(-?\d+)/g, '^{$1}');
    latex = latex.replace(/\^([a-zA-Z])(?![a-zA-Z{])/g, '^{$1}');
    latex = latex.replace(/×/g, ' \\times ');
    latex = latex.replace(/÷/g, ' \\div ');
    return latex;
  };
  
  // Pre-processing: Handle special question formats
  
  // Handle "Simplify:" pattern - wrap the expression after the colon
  result = result.replace(/Simplify:\s*([^\n]+)/gi, (match, expr) => {
    if (expr.includes('$')) return match;
    return `Simplify: $${toLatex(expr.trim())}$`;
  });
  
  // Handle "Factorise:" or "Factorize:" pattern  
  result = result.replace(/Factori[sz]e\s+([^\n]+?)(?=\s+by\s+|\s*$)/gi, (match, expr) => {
    if (expr.includes('$')) return match;
    return `Factorise $${toLatex(expr.trim())}$`;
  });
  
  // Handle "Multiply" pattern
  result = result.replace(/Multiply\s+([^\n]+?)\s+by\s+([^\n]+?)(?=\s+and|\s*$)/gi, (match, expr1, expr2) => {
    if (expr1.includes('$') || expr2.includes('$')) return match;
    return `Multiply $${toLatex(expr1.trim())}$ by $${toLatex(expr2.trim())}$`;
  });
  
  // Convert remaining text math to LaTeX format
  result = convertTextMathToLatex(result);
  
  return result;
};

/**
 * Safely render LaTeX using KaTeX
 * Returns HTML string or original text if KaTeX is not available
 */
const renderWithKatex = (latex, displayMode = false) => {
  try {
    if (typeof window !== 'undefined' && window.katex) {
      return window.katex.renderToString(latex, {
        throwOnError: false,
        displayMode: displayMode,
        strict: false,
        trust: true,
        macros: {
          "\\R": "\\mathbb{R}",
          "\\N": "\\mathbb{N}",
          "\\Z": "\\mathbb{Z}",
          "\\Q": "\\mathbb{Q}",
          "\\C": "\\mathbb{C}",
        }
      });
    }
    // Fallback if KaTeX not loaded
    return latex;
  } catch (error) {
    console.warn('KaTeX rendering error:', error);
    return `<span class="latex-error">${escapeHtml(latex)}</span>`;
  }
};

/**
 * Escape HTML special characters
 */
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Process text and render LaTeX expressions with KaTeX
 * Handles mixed content with both LaTeX and plain text
 */
const processLatexText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  // If pure Unicode, return as-is (escaped for safety)
  if (isPureUnicode(text)) {
    return escapeHtml(text);
  }
  
  let result = text;
  
  // Step 0: Pre-process text-based math notation (like x^2, 3^-1) BEFORE checking for delimiters
  // This converts text math to proper LaTeX format with delimiters
  if (!hasLatexDelimiters(text) && hasTextMathNotation(text)) {
    result = processTextMathExpressions(result);
  }
  
  // Step 1: Process display math $$...$$ (must be done before inline $...$)
  result = result.replace(/\$\$([\s\S]+?)\$\$/g, (match, latex) => {
    return renderWithKatex(latex.trim(), true);
  });
  
  // Step 2: Process display math \[...\]
  result = result.replace(/\\\[([\s\S]+?)\\\]/g, (match, latex) => {
    return renderWithKatex(latex.trim(), true);
  });
  
  // Step 3: Process inline math $...$ (not $$)
  result = result.replace(/\$(?!\$)([^$\n]+?)\$/g, (match, latex) => {
    return renderWithKatex(latex.trim(), false);
  });
  
  // Step 4: Process inline math \(...\)
  result = result.replace(/\\\(([\s\S]+?)\\\)/g, (match, latex) => {
    return renderWithKatex(latex.trim(), false);
  });
  
  // Step 5: If text has LaTeX commands but no delimiters, try to auto-wrap common patterns
  if (hasLatexCommands(result) && !hasLatexDelimiters(text)) {
    // Wrap the entire text as inline math if it contains LaTeX commands
    result = renderWithKatex(result, false);
  }
  
  return result;
};

/**
 * Fallback: Format math expression to Unicode (when KaTeX is not available)
 * This preserves the original Unicode conversion logic as a fallback
 */
const formatMathToUnicode = (expr) => {
  if (!expr) return '';
  
  let formatted = expr;
  
  // Fractions: \frac{a}{b} -> a/b
  formatted = formatted.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)');
  
  // Square root: \sqrt{x} -> √x
  formatted = formatted.replace(/\\sqrt\{([^}]*)\}/g, '√($1)');
  formatted = formatted.replace(/\\sqrt(\w)/g, '√$1');
  
  // Powers: x^{2} -> x²
  formatted = formatted.replace(/\^2(?![0-9])/g, '²');
  formatted = formatted.replace(/\^3(?![0-9])/g, '³');
  formatted = formatted.replace(/\^\{2\}/g, '²');
  formatted = formatted.replace(/\^\{3\}/g, '³');
  formatted = formatted.replace(/\^\{([^}]*)\}/g, '^($1)');
  formatted = formatted.replace(/\^(\w)/g, '^$1');
  
  // Subscripts: x_{1} -> x₁
  formatted = formatted.replace(/_\{([^}]*)\}/g, '[$1]');
  formatted = formatted.replace(/_(\w)/g, '[$1]');
  
  // Greek letters
  const greekMap = {
    '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ',
    '\\epsilon': 'ε', '\\zeta': 'ζ', '\\eta': 'η', '\\theta': 'θ',
    '\\iota': 'ι', '\\kappa': 'κ', '\\lambda': 'λ', '\\mu': 'μ',
    '\\nu': 'ν', '\\xi': 'ξ', '\\pi': 'π', '\\rho': 'ρ',
    '\\sigma': 'σ', '\\tau': 'τ', '\\upsilon': 'υ', '\\phi': 'φ',
    '\\chi': 'χ', '\\psi': 'ψ', '\\omega': 'ω',
    '\\Gamma': 'Γ', '\\Delta': 'Δ', '\\Theta': 'Θ', '\\Lambda': 'Λ',
    '\\Xi': 'Ξ', '\\Pi': 'Π', '\\Sigma': 'Σ', '\\Phi': 'Φ',
    '\\Psi': 'Ψ', '\\Omega': 'Ω'
  };
  for (const [latex, unicode] of Object.entries(greekMap)) {
    formatted = formatted.replace(new RegExp(latex.replace('\\', '\\\\'), 'g'), unicode);
  }
  
  // Math operators
  const operatorMap = {
    '\\times': '×', '\\div': '÷', '\\pm': '±', '\\mp': '∓',
    '\\cdot': '·', '\\leq': '≤', '\\geq': '≥', '\\neq': '≠',
    '\\approx': '≈', '\\equiv': '≡', '\\infty': '∞',
    '\\rightarrow': '→', '\\leftarrow': '←', '\\Rightarrow': '⇒',
    '\\Leftarrow': '⇐', '\\therefore': '∴', '\\because': '∵',
    '\\forall': '∀', '\\exists': '∃', '\\in': '∈', '\\notin': '∉',
    '\\subset': '⊂', '\\supset': '⊃', '\\cup': '∪', '\\cap': '∩',
    '\\emptyset': '∅', '\\partial': '∂', '\\nabla': '∇',
    '\\angle': '∠', '\\triangle': '△', '\\perp': '⊥', '\\parallel': '∥'
  };
  for (const [latex, unicode] of Object.entries(operatorMap)) {
    formatted = formatted.replace(new RegExp(latex.replace('\\', '\\\\'), 'g'), unicode);
  }
  
  // Trigonometric and other functions
  const funcMap = {
    '\\sin': 'sin', '\\cos': 'cos', '\\tan': 'tan',
    '\\cot': 'cot', '\\sec': 'sec', '\\csc': 'csc',
    '\\log': 'log', '\\ln': 'ln', '\\lim': 'lim',
    '\\int': '∫', '\\sum': 'Σ', '\\prod': 'Π'
  };
  for (const [latex, unicode] of Object.entries(funcMap)) {
    formatted = formatted.replace(new RegExp(latex.replace('\\', '\\\\'), 'g'), unicode);
  }
  
  // Spacing
  formatted = formatted.replace(/\\quad/g, '  ');
  formatted = formatted.replace(/\\qquad/g, '    ');
  formatted = formatted.replace(/\\,/g, ' ');
  formatted = formatted.replace(/\\;/g, ' ');
  formatted = formatted.replace(/\\!/g, '');
  formatted = formatted.replace(/\\ /g, ' ');
  
  // Text in math mode
  formatted = formatted.replace(/\\text\{([^}]*)\}/g, '$1');
  formatted = formatted.replace(/\\textbf\{([^}]*)\}/g, '$1');
  formatted = formatted.replace(/\\mathrm\{([^}]*)\}/g, '$1');
  formatted = formatted.replace(/\\mathbf\{([^}]*)\}/g, '$1');
  
  // Remove sizing commands
  formatted = formatted.replace(/\\left/g, '');
  formatted = formatted.replace(/\\right/g, '');
  formatted = formatted.replace(/\\big/g, '');
  formatted = formatted.replace(/\\Big/g, '');
  formatted = formatted.replace(/\\bigg/g, '');
  formatted = formatted.replace(/\\Bigg/g, '');
  
  // Clean up braces
  formatted = formatted.replace(/\{/g, '(');
  formatted = formatted.replace(/\}/g, ')');
  
  return formatted;
};

/**
 * Main render function - uses KaTeX if available, falls back to Unicode
 */
const renderLatex = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  // Check if KaTeX is available
  if (typeof window !== 'undefined' && window.katex) {
    return processLatexText(text);
  }
  
  // Fallback to Unicode conversion
  let result = text;
  
  // Process delimited content
  result = result.replace(/\$\$(.*?)\$\$/g, (match, p1) => formatMathToUnicode(p1));
  result = result.replace(/\$([^$\n]+?)\$/g, (match, p1) => formatMathToUnicode(p1));
  result = result.replace(/\\\((.*?)\\\)/g, (match, p1) => formatMathToUnicode(p1));
  result = result.replace(/\\\[(.*?)\\\]/g, (match, p1) => formatMathToUnicode(p1));
  
  return result;
};

/**
 * LatexRenderer Component
 * React component that properly renders LaTeX text using KaTeX
 * Handles both LaTeX-delimited content and Unicode math symbols
 */
const LatexRenderer = React.memo(({ text, className = '', style = {} }) => {
  const containerRef = useRef(null);
  const [renderedHtml, setRenderedHtml] = useState('');
  const [isKatexReady, setIsKatexReady] = useState(false);
  
  // Check if KaTeX is loaded
  useEffect(() => {
    const checkKatex = () => {
      if (typeof window !== 'undefined' && window.katex) {
        setIsKatexReady(true);
        return true;
      }
      return false;
    };
    
    if (checkKatex()) return;
    
    // Poll for KaTeX availability (it might load after component mounts)
    const interval = setInterval(() => {
      if (checkKatex()) {
        clearInterval(interval);
      }
    }, 100);
    
    // Clean up after 5 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 5000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);
  
  // Render LaTeX when KaTeX is ready or text changes
  useEffect(() => {
    if (!text) {
      setRenderedHtml('');
      return;
    }
    
    if (isKatexReady) {
      const html = processLatexText(text);
      setRenderedHtml(html);
    } else {
      // Fallback: escape HTML and show as plain text
      setRenderedHtml(escapeHtml(text));
    }
  }, [text, isKatexReady]);
  
  // If text is empty, return null
  if (!text) return null;
  
  // If KaTeX is ready and we have rendered HTML, use dangerouslySetInnerHTML
  if (renderedHtml) {
    return (
      <span
        ref={containerRef}
        className={`latex-content ${className}`}
        style={style}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    );
  }
  
  // Fallback: show plain text
  return <span className={className} style={style}>{text}</span>;
});

LatexRenderer.displayName = 'LatexRenderer';

// ============================================
// CUSTOM HOOKS
// ============================================
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// ============================================
// API SERVICE
// ============================================
const api = {
  async getClasses() {
    const res = await fetch(`${API_BASE_URL}/classes/`);
    return res.json();
  },
  
  async getClassDetails(id) {
    const res = await fetch(`${API_BASE_URL}/classes/${id}/`);
    return res.json();
  },
  
  async getClassWeightage(id) {
    const res = await fetch(`${API_BASE_URL}/classes/${id}/weightage/`);
    return res.json();
  },
  
  async getClassStatistics(id) {
    const res = await fetch(`${API_BASE_URL}/classes/${id}/statistics/`);
    return res.json();
  },
  
  async getChapters(classId) {
    const res = await fetch(`${API_BASE_URL}/chapters/?class_id=${classId}`);
    return res.json();
  },
  
  async getChapterQuestions(chapterId) {
    const res = await fetch(`${API_BASE_URL}/chapters/${chapterId}/`);
    return res.json();
  },
  
  async getQuestions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/questions/?${queryString}`);
    return res.json();
  },
  
  async generatePaper(data) {
    const res = await fetch(`${API_BASE_URL}/papers/generate/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  
  async getDashboardStats() {
    const res = await fetch(`${API_BASE_URL}/dashboard/`);
    return res.json();
  },
  
  async calculateWeightage(data) {
    const res = await fetch(`${API_BASE_URL}/weightage/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

// ============================================
// ICON COMPONENTS
// ============================================
const Icons = {
  Book: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Circle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  FileText: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Filter: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  Download: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Trash: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  BarChart: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/>
      <line x1="18" y1="20" x2="18" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  ),
  Target: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Layers: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
      <polyline points="2 17 12 22 22 17"/>
      <polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  Award: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7"/>
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>
  ),
  Sparkles: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z"/>
    </svg>
  ),
  Zap: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Clock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Star: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Info: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Printer: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9"/>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
      <rect x="6" y="14" width="12" height="8"/>
    </svg>
  ),
  Eye: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Copy: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  RefreshCw: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  Moon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  Sun: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  Home: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  GraduationCap: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const getSectionColor = (section) => {
  const colors = {
    'A': { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
    'B': { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
    'C': { bg: '#fef3c7', text: '#b45309', border: '#f59e0b' },
    'D': { bg: '#fce7f3', text: '#be185d', border: '#ec4899' },
    'E': { bg: '#ede9fe', text: '#6d28d9', border: '#8b5cf6' },
  };
  return colors[section] || { bg: '#f1f5f9', text: '#475569', border: '#94a3b8' };
};

const getDifficultyColor = (difficulty) => {
  const colors = {
    'easy': '#10b981',
    'medium': '#f59e0b',
    'hard': '#ef4444',
  };
  return colors[difficulty] || '#94a3b8';
};

const formatMarks = (marks) => {
  return `${marks} Mark${marks !== 1 ? 's' : ''}`;
};

const getClassGradient = (index) => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  ];
  return gradients[index % gradients.length];
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function QuestionPaperGenerator() {
  // State
  const [theme, setTheme] = useLocalStorage('qpg-theme', 'dark');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classDetails, setClassDetails] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [chapterQuestions, setChapterQuestions] = useState({});
  const [selectedQuestions, setSelectedQuestions] = useLocalStorage('qpg-selected', {});
  const [weightageData, setWeightageData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('dashboard');
  const [showPaper, setShowPaper] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Load initial data
  useEffect(() => {
    loadClasses();
    loadDashboardStats();
  }, []);

  // Load class details when selected
  useEffect(() => {
    if (selectedClass) {
      loadClassDetails(selectedClass.id);
      loadChapters(selectedClass.id);
      loadWeightageData(selectedClass.id);
    }
  }, [selectedClass]);

  // API Calls
  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await api.getClasses();
      setClasses(data.results || data);
    } catch (error) {
      showNotification('Failed to load classes', 'error');
    }
    setLoading(false);
  };

  const loadDashboardStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setDashboardStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats');
    }
  };

  const loadClassDetails = async (classId) => {
    try {
      const data = await api.getClassDetails(classId);
      setClassDetails(data);
    } catch (error) {
      showNotification('Failed to load class details', 'error');
    }
  };

  const loadChapters = async (classId) => {
    try {
      const data = await api.getChapters(classId);
      setChapters(data.results || data);
    } catch (error) {
      showNotification('Failed to load chapters', 'error');
    }
  };

  const loadWeightageData = async (classId) => {
    try {
      const data = await api.getClassWeightage(classId);
      setWeightageData(data);
    } catch (error) {
      console.error('Failed to load weightage');
    }
  };

  const loadChapterQuestions = async (chapterId) => {
    if (chapterQuestions[chapterId]) return;
    
    try {
      const data = await api.getChapterQuestions(chapterId);
      setChapterQuestions(prev => ({
        ...prev,
        [chapterId]: data.questions || []
      }));
    } catch (error) {
      showNotification('Failed to load questions', 'error');
    }
  };

  // Event Handlers
  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    setSelectedChapters([]);
    setExpandedChapters({});
    setView('questions');
  };

  const handleChapterToggle = (chapter) => {
    const isExpanded = expandedChapters[chapter.id];
    setExpandedChapters(prev => ({
      ...prev,
      [chapter.id]: !isExpanded
    }));
    
    if (!isExpanded) {
      loadChapterQuestions(chapter.id);
    }
  };

  const handleQuestionToggle = (question, chapter) => {
    const key = `${chapter.id}_${question.id}`;
    setSelectedQuestions(prev => {
      if (prev[key]) {
        const { [key]: removed, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [key]: {
          ...question,
          chapter: chapter.name,
          chapterId: chapter.id,
          unitId: chapter.unit,
        }
      };
    });
  };

  const handleClearSelection = () => {
    setSelectedQuestions({});
    showNotification('Selection cleared', 'info');
  };

  const handleGeneratePaper = () => {
    if (Object.keys(selectedQuestions).length === 0) {
      showNotification('Please select at least one question', 'warning');
      return;
    }
    setShowPaper(true);
    setView('paper');
  };

  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Computed Values
  const totalSelectedQuestions = Object.keys(selectedQuestions).length;
  const totalSelectedMarks = Object.values(selectedQuestions).reduce((sum, q) => sum + (q.marks || 0), 0);
  
  const sectionCounts = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    Object.values(selectedQuestions).forEach(q => {
      if (counts.hasOwnProperty(q.section)) {
        counts[q.section]++;
      }
    });
    return counts;
  }, [selectedQuestions]);

  // Calculate selected marks per chapter
  const selectedMarksPerChapter = useMemo(() => {
    const marks = {};
    Object.values(selectedQuestions).forEach(q => {
      const chId = q.chapterId;
      if (chId) {
        marks[chId] = (marks[chId] || 0) + (q.marks || 0);
      }
    });
    return marks;
  }, [selectedQuestions]);

  // Calculate selected marks per unit
  const selectedMarksPerUnit = useMemo(() => {
    const marks = {};
    weightageData.forEach(unit => {
      let unitMarks = 0;
      unit.chapters?.forEach(ch => {
        unitMarks += selectedMarksPerChapter[ch.id] || 0;
      });
      marks[unit.id] = unitMarks;
    });
    return marks;
  }, [selectedQuestions, weightageData, selectedMarksPerChapter]);

  // Filter chapters based on search
  const filteredChapters = useMemo(() => {
    if (!debouncedSearch) return chapters;
    const query = debouncedSearch.toLowerCase();
    return chapters.filter(ch => 
      ch.name.toLowerCase().includes(query) ||
      ch.unit_name?.toLowerCase().includes(query)
    );
  }, [chapters, debouncedSearch]);

  // ============================================
  // STYLES
  // ============================================
  const styles = {
    container: {
      minHeight: '100vh',
      background: theme === 'dark'
        ? 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
      fontFamily: "'Outfit', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    header: {
      background: theme === 'dark'
        ? 'rgba(15, 15, 35, 0.95)'
        : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: theme === 'dark'
        ? '1px solid rgba(255, 255, 255, 0.1)'
        : '1px solid rgba(0, 0, 0, 0.1)',
      padding: '16px 32px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    logoIcon: {
      width: '48px',
      height: '48px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
    },
    mainContent: {
      display: 'flex',
      maxWidth: '1800px',
      margin: '0 auto',
      minHeight: 'calc(100vh - 80px)',
    },
    sidebar: {
      width: sidebarOpen ? '360px' : '0px',
      background: theme === 'dark'
        ? 'linear-gradient(180deg, rgba(15, 15, 35, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)'
        : 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      borderRight: theme === 'dark'
        ? '1px solid rgba(255, 255, 255, 0.08)'
        : '1px solid rgba(0, 0, 0, 0.08)',
      overflow: 'hidden',
      transition: 'width 0.3s ease',
      position: 'sticky',
      top: '80px',
      height: 'calc(100vh - 80px)',
    },
    sidebarContent: {
      width: '360px',
      padding: '24px',
      height: '100%',
      overflowY: 'auto',
    },
    content: {
      flex: 1,
      padding: '32px',
      overflowY: 'auto',
    },
    card: {
      background: theme === 'dark'
        ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
      backdropFilter: 'blur(20px)',
      border: theme === 'dark'
        ? '1px solid rgba(255, 255, 255, 0.1)'
        : '1px solid rgba(0, 0, 0, 0.08)',
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: theme === 'dark'
        ? '0 8px 32px rgba(0, 0, 0, 0.4)'
        : '0 8px 32px rgba(0, 0, 0, 0.08)',
    },
    button: {
      primary: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '14px 28px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'all 0.3s ease',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
      },
      secondary: {
        background: theme === 'dark'
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.05)',
        color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
        border: theme === 'dark'
          ? '1px solid rgba(255, 255, 255, 0.15)'
          : '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        padding: '12px 20px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
      },
      danger: {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '12px 20px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
      },
    },
    input: {
      background: theme === 'dark'
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.03)',
      border: theme === 'dark'
        ? '1px solid rgba(255, 255, 255, 0.15)'
        : '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '12px',
      padding: '14px 18px',
      fontSize: '15px',
      color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
      outline: 'none',
      width: '100%',
      transition: 'all 0.3s ease',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '600',
    },
  };

  // ============================================
  // RENDER FUNCTIONS
  // ============================================
  const renderNotifications = () => (
    <div style={{ position: 'fixed', top: '100px', right: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {notifications.map(n => {
        const colors = {
          info: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
          success: { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
          warning: { bg: '#fef3c7', text: '#b45309', border: '#f59e0b' },
          error: { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' },
        };
        const c = colors[n.type] || colors.info;
        
        return (
          <div key={n.id} style={{
            background: c.bg,
            color: c.text,
            borderLeft: `4px solid ${c.border}`,
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            animation: 'slideIn 0.3s ease',
            minWidth: '300px',
          }}>
            {n.message}
          </div>
        );
      })}
    </div>
  );

  const renderHeader = () => (
    <header style={styles.header}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>
          <Icons.GraduationCap />
        </div>
        <div>
          <div style={{ fontSize: '24px', fontWeight: '700', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Question Paper Generator
          </div>
          <div style={{ fontSize: '12px', color: theme === 'dark' ? '#94a3b8' : '#64748b', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Professional Exam Paper Creation
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {selectedClass && (
          <button
            onClick={() => { setSelectedClass(null); setView('dashboard'); }}
            style={styles.button.secondary}
          >
            <Icons.Home /> Dashboard
          </button>
        )}
        
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{
            ...styles.button.secondary,
            padding: '12px',
          }}
        >
          {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
        </button>
        
        {view !== 'dashboard' && view !== 'paper' && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              ...styles.button.secondary,
              padding: '12px',
            }}
          >
            <Icons.Menu />
          </button>
        )}
      </div>
    </header>
  );

  const renderDashboard = () => (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Welcome to Question Paper Generator
        </h1>
        <p style={{ fontSize: '18px', color: theme === 'dark' ? '#94a3b8' : '#64748b', maxWidth: '600px', margin: '0 auto' }}>
          Create professional exam papers with ease. Select a class to get started.
        </p>
      </div>
      
      {/* Stats Grid */}
      {dashboardStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
          {[
            { label: 'Total Classes', value: dashboardStats.total_classes, icon: <Icons.Book />, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
            { label: 'Total Units', value: dashboardStats.total_units, icon: <Icons.Layers />, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
            { label: 'Total Chapters', value: dashboardStats.total_chapters, icon: <Icons.FileText />, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
            { label: 'Total Questions', value: dashboardStats.total_questions, icon: <Icons.Target />, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
          ].map((stat, i) => (
            <div key={i} style={{
              ...styles.card,
              background: stat.gradient,
              color: 'white',
              padding: '28px',
              textAlign: 'center',
              transform: 'translateY(0)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'default',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ marginBottom: '12px', opacity: 0.9 }}>{stat.icon}</div>
              <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>{stat.value}</div>
              <div style={{ fontSize: '14px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}
      
      {/* Class Selection */}
      <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>Select a Class</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {classes.map((cls, index) => (
          <div
            key={cls.id}
            onClick={() => handleClassSelect(cls)}
            style={{
              ...styles.card,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(102, 126, 234, 0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '120px',
              height: '120px',
              background: getClassGradient(index),
              borderRadius: '0 0 0 100%',
              opacity: 0.2,
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: getClassGradient(index),
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: 'white',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              }}>
                {cls.icon || '📚'}
              </div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: '700' }}>{cls.display_name}</div>
                <div style={{ fontSize: '14px', color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
                  {cls.total_marks || 80} Marks
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ ...styles.badge, background: theme === 'dark' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.1)', color: '#667eea' }}>
                <Icons.Layers /> {cls.total_units || '—'} Units
              </span>
              <span style={{ ...styles.badge, background: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <Icons.FileText /> {cls.total_chapters || '—'} Chapters
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSidebar = () => (
    <aside style={styles.sidebar}>
      <div style={styles.sidebarContent}>
        {/* Selection Summary */}
        <div style={{ ...styles.card, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Icons.CheckCircle />
            <span style={{ fontSize: '18px', fontWeight: '700' }}>Selection Summary</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: '800' }}>{totalSelectedQuestions}</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Questions</div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '28px', fontWeight: '800' }}>{totalSelectedMarks}</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Total Marks</div>
            </div>
          </div>
          
          {/* Section breakdown */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(sectionCounts).map(([section, count]) => count > 0 && (
              <span key={section} style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
              }}>
                Section {section}: {count}
              </span>
            ))}
          </div>
        </div>
        
        {/* Quick Filters - ONLY SECTION FILTER */}
        <div style={{ ...styles.card, marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Icons.Filter />
            <span style={{ fontSize: '16px', fontWeight: '600' }}>Section Filter</span>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['all', 'A', 'B', 'C', 'D', 'E'].map(s => {
              const sectionColor = s === 'all' ? { bg: theme === 'dark' ? '#1e293b' : '#f1f5f9', text: theme === 'dark' ? '#e2e8f0' : '#1e293b' } : getSectionColor(s);
              return (
                <button
                  key={s}
                  onClick={() => setSectionFilter(s)}
                  style={{
                    background: sectionFilter === s ? sectionColor.bg : 'transparent',
                    color: sectionFilter === s ? sectionColor.text : (theme === 'dark' ? '#94a3b8' : '#64748b'),
                    border: `2px solid ${sectionFilter === s ? sectionColor.border || sectionColor.bg : 'transparent'}`,
                    borderRadius: '10px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {s === 'all' ? 'All' : `Section ${s}`}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Weightage Status - SHOWING CHAPTERS UNDER UNITS */}
        <div style={{ ...styles.card }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Icons.BarChart />
            <span style={{ fontSize: '16px', fontWeight: '600' }}>Weightage Status</span>
          </div>
          
          {/* Overall Progress */}
          {weightageData.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              {(() => {
                const totalTarget = weightageData.reduce((sum, u) => sum + (u.weightage || 0), 0);
                const totalSelected = Object.values(selectedMarksPerUnit).reduce((sum, m) => sum + m, 0);
                const percentage = totalTarget > 0 ? (totalSelected / totalTarget) * 100 : 0;
                
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                      <span>Total Progress</span>
                      <span style={{ fontWeight: '700' }}>{totalSelected} / {totalTarget} marks</span>
                    </div>
                    <div style={{
                      height: '10px',
                      background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      borderRadius: '5px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${Math.min(percentage, 100)}%`,
                        height: '100%',
                        background: percentage > 100 ? '#ef4444' : percentage >= 80 ? '#f59e0b' : '#10b981',
                        borderRadius: '5px',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                    {totalSelected > totalTarget && (
                      <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px', fontWeight: '600' }}>
                        ⚠️ Exceeded by {totalSelected - totalTarget} marks!
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
          
          {/* Per Unit with Chapters */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {weightageData.map(unit => {
              const unitSelected = selectedMarksPerUnit[unit.id] || 0;
              const unitTarget = unit.weightage || 0;
              const unitPercentage = unitTarget > 0 ? (unitSelected / unitTarget) * 100 : 0;
              const unitStatus = unitSelected > unitTarget ? 'exceeded' : unitSelected >= unitTarget * 0.8 ? 'warning' : 'ok';
              const statusColors = {
                ok: '#10b981',
                warning: '#f59e0b',
                exceeded: '#ef4444',
              };
              
              return (
                <div key={unit.id} style={{ marginBottom: '16px' }}>
                  {/* Unit Header */}
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    marginBottom: '8px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>
                        {unit.short_name || unit.name?.split(': ')[1] || unit.name}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '700' }}>
                        {unitSelected}/{unitTarget}
                      </span>
                    </div>
                    <div style={{
                      height: '4px',
                      background: 'rgba(255,255,255,0.3)',
                      borderRadius: '2px',
                      marginTop: '8px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${Math.min(unitPercentage, 100)}%`,
                        height: '100%',
                        background: 'white',
                        borderRadius: '2px',
                      }} />
                    </div>
                  </div>
                  
                  {/* Chapters under this unit */}
                  {unit.chapters && unit.chapters.length > 0 && (
                    <div style={{ paddingLeft: '12px' }}>
                      {unit.chapters.map(ch => {
                        const chSelected = selectedMarksPerChapter[ch.id] || 0;
                        const chTarget = ch.calculated_weightage || 0;
                        const chPercentage = chTarget > 0 ? (chSelected / chTarget) * 100 : 0;
                        const chStatus = chSelected > chTarget ? 'exceeded' : chSelected >= chTarget * 0.8 ? 'warning' : chSelected > 0 ? 'ok' : 'empty';
                        
                        return (
                          <div key={ch.id} style={{
                            background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            borderLeft: `3px solid ${chStatus === 'exceeded' ? '#ef4444' : chStatus === 'warning' ? '#f59e0b' : chStatus === 'ok' ? '#10b981' : '#94a3b8'}`,
                            padding: '8px 12px',
                            borderRadius: '0 8px 8px 0',
                            marginBottom: '6px',
                            fontSize: '12px',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{
                                maxWidth: '160px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                color: theme === 'dark' ? '#cbd5e1' : '#475569',
                              }}>
                                {ch.name}
                              </span>
                              <span style={{
                                fontWeight: '600',
                                color: chStatus === 'exceeded' ? '#ef4444' : chStatus === 'warning' ? '#f59e0b' : chStatus === 'ok' ? '#10b981' : '#94a3b8',
                              }}>
                                {chSelected}/{chTarget}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Actions */}
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleGeneratePaper}
            disabled={totalSelectedQuestions === 0}
            style={{
              ...styles.button.primary,
              opacity: totalSelectedQuestions === 0 ? 0.5 : 1,
              cursor: totalSelectedQuestions === 0 ? 'not-allowed' : 'pointer',
              justifyContent: 'center',
            }}
          >
            <Icons.FileText /> Generate Paper
          </button>
          
          <button
            onClick={handleClearSelection}
            disabled={totalSelectedQuestions === 0}
            style={{
              ...styles.button.danger,
              opacity: totalSelectedQuestions === 0 ? 0.5 : 1,
              cursor: totalSelectedQuestions === 0 ? 'not-allowed' : 'pointer',
              justifyContent: 'center',
            }}
          >
            <Icons.Trash /> Clear Selection
          </button>
        </div>
      </div>
    </aside>
  );

  const renderQuestionSelection = () => (
    <div>
      {/* Class Header */}
      <div style={{ ...styles.card, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
            }}>
              {selectedClass?.icon || '📚'}
            </div>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0 }}>{selectedClass?.display_name}</h1>
              <p style={{ margin: '8px 0 0', opacity: 0.9 }}>
                {chapters.length} Chapters • {selectedClass?.total_marks || 80} Marks Total
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search */}
      <div style={{ marginBottom: '24px', position: 'relative' }}>
        <Icons.Search style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: theme === 'dark' ? '#94a3b8' : '#64748b' }} />
        <input
          type="text"
          placeholder="Search chapters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ ...styles.input, paddingLeft: '52px' }}
        />
      </div>
      
      {/* Chapters List */}
      <div>
        {filteredChapters.map(chapter => {
          const isExpanded = expandedChapters[chapter.id];
          const questions = chapterQuestions[chapter.id] || [];
          const selectedInChapter = Object.keys(selectedQuestions).filter(k => k.startsWith(`${chapter.id}_`)).length;
          const chapterSelectedMarks = selectedMarksPerChapter[chapter.id] || 0;
          
          // Get chapter's target weightage from weightageData
          let chapterTarget = 0;
          weightageData.forEach(unit => {
            const ch = unit.chapters?.find(c => c.id === chapter.id);
            if (ch) chapterTarget = ch.calculated_weightage || 0;
          });
          
          // Filter questions by section
          const filteredQuestions = sectionFilter === 'all' 
            ? questions 
            : questions.filter(q => q.section === sectionFilter);
          
          // Group by section
          const groupedBySection = {};
          filteredQuestions.forEach(q => {
            if (!groupedBySection[q.section]) groupedBySection[q.section] = [];
            groupedBySection[q.section].push(q);
          });
          
          return (
            <div key={chapter.id} style={{ ...styles.card, marginBottom: '16px' }}>
              {/* Chapter Header */}
              <div
                onClick={() => handleChapterToggle(chapter)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  padding: '8px 0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: theme === 'dark' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#667eea',
                  }}>
                    {isExpanded ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                  </div>
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: '600' }}>{chapter.name}</div>
                    <div style={{ fontSize: '13px', color: theme === 'dark' ? '#94a3b8' : '#64748b', marginTop: '4px' }}>
                      {chapter.total_questions || questions.length} questions • {chapter.total_marks || 0} marks available
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Weightage indicator */}
                  {chapterTarget > 0 && (
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: chapterSelectedMarks > chapterTarget ? 'rgba(239, 68, 68, 0.15)' : chapterSelectedMarks >= chapterTarget * 0.8 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: chapterSelectedMarks > chapterTarget ? '#ef4444' : chapterSelectedMarks >= chapterTarget * 0.8 ? '#f59e0b' : '#10b981',
                    }}>
                      {chapterSelectedMarks}/{chapterTarget} marks
                    </div>
                  )}
                  
                  {selectedInChapter > 0 && (
                    <span style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                    }}>
                      {selectedInChapter} selected
                    </span>
                  )}
                </div>
              </div>
              
              {/* Questions */}
              {isExpanded && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>
                  {Object.keys(groupedBySection).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
                      {questions.length === 0 ? 'Loading questions...' : 'No questions match the filter'}
                    </div>
                  ) : (
                    ['A', 'B', 'C', 'D', 'E'].map(section => {
                      const sectionQuestions = groupedBySection[section];
                      if (!sectionQuestions || sectionQuestions.length === 0) return null;
                      
                      const sectionColor = getSectionColor(section);
                      const sectionMarks = sectionQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
                      
                      return (
                        <div key={section} style={{ marginBottom: '24px' }}>
                          {/* Section Header */}
                          <div style={{
                            background: sectionColor.bg,
                            padding: '12px 16px',
                            borderRadius: '10px',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                            <span style={{ color: sectionColor.text, fontWeight: '600' }}>
                              Section {section}
                            </span>
                            <span style={{ color: sectionColor.text, fontSize: '13px' }}>
                              {sectionQuestions.length} questions • {sectionMarks} marks
                            </span>
                          </div>
                          
                          {/* Questions in section */}
                          {sectionQuestions.map(question => {
                            const key = `${chapter.id}_${question.id}`;
                            const isSelected = selectedQuestions[key];
                            
                            return (
                              <div
                                key={question.id}
                                onClick={() => handleQuestionToggle(question, chapter)}
                                style={{
                                  background: isSelected
                                    ? (theme === 'dark' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)')
                                    : (theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'),
                                  border: isSelected
                                    ? '2px solid #10b981'
                                    : `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                  borderRadius: '12px',
                                  padding: '16px',
                                  marginBottom: '10px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                                  {/* Checkbox */}
                                  <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '6px',
                                    border: isSelected ? 'none' : `2px solid ${theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
                                    background: isSelected ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    marginTop: '2px',
                                  }}>
                                    {isSelected && <Icons.CheckCircle style={{ color: 'white', width: '16px', height: '16px' }} />}
                                  </div>
                                  
                                  {/* Question Content - USING LatexRenderer COMPONENT */}
                                  <div style={{ flex: 1 }}>
                                    <div style={{
                                      fontSize: '15px',
                                      lineHeight: '1.6',
                                      color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
                                    }}>
                                      <LatexRenderer text={question.question_text} />
                                    </div>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                                      <span style={{
                                        ...styles.badge,
                                        background: sectionColor.bg,
                                        color: sectionColor.text,
                                        fontSize: '12px',
                                        padding: '4px 10px',
                                      }}>
                                        {question.question_subtype || question.question_type || `Section ${section}`}
                                      </span>
                                      
                                      <span style={{
                                        ...styles.badge,
                                        background: theme === 'dark' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.1)',
                                        color: '#667eea',
                                        fontSize: '12px',
                                        padding: '4px 10px',
                                      }}>
                                        {formatMarks(question.marks)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPaperView = () => {
    const questionsList = Object.values(selectedQuestions);
    const groupedBySection = {};
    questionsList.forEach(q => {
      if (!groupedBySection[q.section]) groupedBySection[q.section] = [];
      groupedBySection[q.section].push(q);
    });
    
    let questionNumber = 1;
    
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <button
            onClick={() => { setView('questions'); setShowPaper(false); }}
            style={styles.button.secondary}
          >
            <Icons.ArrowLeft /> Back to Selection
          </button>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                const content = document.getElementById('paper-content')?.innerText || '';
                navigator.clipboard.writeText(content);
                showNotification('Paper copied to clipboard!', 'success');
              }}
              style={styles.button.secondary}
            >
              <Icons.Copy /> Copy
            </button>
            <button
              onClick={() => window.print()}
              style={styles.button.primary}
            >
              <Icons.Printer /> Print
            </button>
          </div>
        </div>
        
        {/* Paper Content */}
        <div id="paper-content" style={{ ...styles.card, padding: '48px' }}>
          {/* Paper Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>
              {selectedClass?.display_name} - Question Paper
            </h1>
            <div style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
              Total Questions: {questionsList.length} | Total Marks: {totalSelectedMarks} | Time: 3 Hours
            </div>
          </div>
          
          <div style={{
            height: '3px',
            background: 'linear-gradient(90deg, #667eea, #764ba2, #667eea)',
            borderRadius: '2px',
            marginBottom: '32px',
          }} />
          
          {/* Sections */}
          {['A', 'B', 'C', 'D', 'E'].map(section => {
            const sectionQuestions = groupedBySection[section];
            if (!sectionQuestions || sectionQuestions.length === 0) return null;
            
            const sectionColor = getSectionColor(section);
            const sectionMarks = sectionQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
            
            return (
              <div key={section} style={{ marginBottom: '32px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '14px 20px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontWeight: '700', fontSize: '16px' }}>Section {section}</span>
                  <span style={{ fontSize: '14px' }}>{sectionQuestions.length} Questions • {sectionMarks} Marks</span>
                </div>
                
                {sectionQuestions.map((q, idx) => (
                  <div key={idx} style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', lineHeight: '1.7' }}>
                          {/* USING LatexRenderer COMPONENT */}
                          <strong>Q{questionNumber++}.</strong> <LatexRenderer text={q.question_text} />
                        </div>
                        <div style={{ fontSize: '13px', color: theme === 'dark' ? '#94a3b8' : '#64748b', marginTop: '8px' }}>
                          📖 {q.chapter}
                        </div>
                      </div>
                      <div style={{
                        background: sectionColor.bg,
                        color: sectionColor.text,
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '700',
                        marginLeft: '16px',
                        flexShrink: 0,
                      }}>
                        [{q.marks}M]
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          overflow-x: hidden;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        /* KaTeX specific styles for theme compatibility */
        .latex-content .katex {
          color: inherit;
        }
        
        .latex-content .katex-display {
          margin: 0.5em 0;
        }
        
        @media print {
          * {
            background: white !important;
            color: black !important;
            box-shadow: none !important;
          }
          
          header, aside, button {
            display: none !important;
          }
          
          .latex-content .katex {
            color: black !important;
          }
        }
      `}</style>
      
      {renderNotifications()}
      {renderHeader()}
      
      <div style={styles.mainContent}>
        {view !== 'dashboard' && view !== 'paper' && renderSidebar()}
        
        <main style={styles.content}>
          {view === 'dashboard' && renderDashboard()}
          {view === 'questions' && renderQuestionSelection()}
          {view === 'paper' && renderPaperView()}
        </main>
      </div>
    </div>
  );
}