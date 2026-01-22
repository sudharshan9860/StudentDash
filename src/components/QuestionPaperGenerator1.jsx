import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './QuestionPaperGenerator.css';

// ============================================
// CONFIGURATION
// ============================================
const API_BASE_URL = 'https://qgen.smartlearners.ai/api';

// ============================================
// LATEX RENDERING UTILITIES
// ============================================
const hasLatexDelimiters = (text) => {
  if (!text || typeof text !== 'string') return false;
  return /\$\$[\s\S]+?\$\$|\$(?!\$)[^$\n]+?\$|\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]/.test(text);
};

const hasLatexCommands = (text) => {
  if (!text || typeof text !== 'string') return false;
  return /\\(?:frac|sqrt|int|sum|prod|alpha|beta|gamma|delta|theta|pi|sigma|omega|phi|lambda|mu|epsilon|rho|tau|Delta|Sigma|Omega|Pi|times|div|pm|mp|cdot|leq|geq|neq|approx|equiv|infty|rightarrow|leftarrow|Rightarrow|Leftarrow|therefore|because|forall|exists|in|notin|subset|supset|cup|cap|emptyset|sin|cos|tan|cot|sec|csc|log|ln|lim|vec|hat|bar|dot|ddot|overline|underline|overbrace|underbrace|binom|tbinom|dbinom|text|textbf|mathrm|mathbf|mathit|mathbb|mathcal|left|right|big|Big|bigg|Bigg|quad|qquad|,|;|!|:|partial|nabla|angle|triangle|square|circ|bullet|star|ast|oplus|otimes|perp|parallel|cong|sim|simeq|propto|degree)\b/.test(text);
};

const hasUnicodeMath = (text) => {
  if (!text || typeof text !== 'string') return false;
  return /[²³⁴⁵⁶⁷⁸⁹⁰¹⁺⁻⁼⁽⁾ⁿ₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎√∛∜∫∬∭∮∯∰∱∲∳∑∏∐αβγδεζηθικλμνξοπρςστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ∞±×÷≤≥≠≈≡≢≣→←↑↓↔↕⇒⇐⇑⇓⇔⇕∴∵∀∃∄∈∉∋∌⊂⊃⊄⊅⊆⊇⊈⊉∪∩∅∧∨⊕⊖⊗⊘⊙·•°′″‴‵‶‷∂∇△▽□◇○●◦∠∡∢⊥∥∦≮≯≰≱≲≳≶≷≺≻≼≽⊀⊁⊰⊱⋖⋗⋘⋙⋚⋛⋜⋝]/.test(text);
};

const isPureUnicode = (text) => {
  if (!text || typeof text !== 'string') return false;
  return hasUnicodeMath(text) && !hasLatexDelimiters(text) && !hasLatexCommands(text);
};

const hasTextMathNotation = (text) => {
  if (!text || typeof text !== 'string') return false;
  const patterns = [/\w+\^-?\d+/, /\d+\^[a-zA-Z]/, /[a-zA-Z]\^[a-zA-Z]/, /\([^)]+\)\^-?\w+/];
  return patterns.some(pattern => pattern.test(text));
};

const convertTextMathToLatex = (text) => {
  if (!text || typeof text !== 'string') return text;

  const toLatex = (expr) => {
    let latex = expr;
    latex = latex.replace(/\^(-?\d+)/g, '^{$1}');
    latex = latex.replace(/\^([a-zA-Z])(?![a-zA-Z0-9{])/g, '^{$1}');
    latex = latex.replace(/×/g, ' \\times ');
    latex = latex.replace(/÷/g, ' \\div ');
    latex = latex.replace(/√/g, '\\sqrt');
    return latex;
  };

  let result = text;
  result = result.replace(/(\([^)]{2,}\)\^-?[a-zA-Z0-9]+(?:\s*[\+\-\*×]\s*\([^)]{2,}\)\^-?[a-zA-Z0-9]+)*)/g, (match) => match.includes('$') ? match : `$${toLatex(match)}$`);
  result = result.replace(/(\([^)]{2,}\)\^-?[a-zA-Z0-9]+)/g, (match) => match.includes('$') ? match : `$${toLatex(match)}$`);
  result = result.replace(/(\([^)]{2,}\)\s*\([^)]{2,}\))/g, (match) => match.includes('$') ? match : `$${toLatex(match)}$`);
  result = result.replace(/([a-zA-Z0-9]+\^-?[a-zA-Z0-9]+(?:\s*[\+\-]\s*[a-zA-Z0-9]+\^?-?[a-zA-Z0-9]*)+)/g, (match) => {
    if (match.includes('$') || !match.includes('^')) return match;
    return `$${toLatex(match)}$`;
  });
  result = result.replace(/([a-zA-Z])\s*=\s*([a-zA-Z0-9]+\^-?[a-zA-Z0-9]+)/g, (match, lhs, rhs) => match.includes('$') ? match : `$${lhs}=${toLatex(rhs)}$`);
  result = result.replace(/(?<![a-zA-Z0-9$])(\d+\^[a-zA-Z])(?![a-zA-Z0-9])(?!\$)/g, (match) => `$${toLatex(match)}$`);
  result = result.replace(/(?<![a-zA-Z0-9$])([a-zA-Z]\^-?\d+)(?![a-zA-Z0-9])(?!\$)/g, (match) => `$${toLatex(match)}$`);
  result = result.replace(/(?<![a-zA-Z0-9$])(\d+\^-?\d+)(?![a-zA-Z0-9])(?!\$)/g, (match) => `$${toLatex(match)}$`);
  result = result.replace(/\$\s*\$/g, '');
  result = result.replace(/\$\$/g, '$');
  return result;
};

const processTextMathExpressions = (text) => {
  if (!text || typeof text !== 'string') return text;
  let result = text;
  if (hasLatexDelimiters(text)) return text;
  if (!hasTextMathNotation(text)) return text;

  const toLatex = (expr) => {
    let latex = expr.replace(/\^(-?\d+)/g, '^{$1}');
    latex = latex.replace(/\^([a-zA-Z])(?![a-zA-Z{])/g, '^{$1}');
    latex = latex.replace(/×/g, ' \\times ');
    latex = latex.replace(/÷/g, ' \\div ');
    return latex;
  };

  result = result.replace(/Simplify:\s*([^\n]+)/gi, (match, expr) => expr.includes('$') ? match : `Simplify: $${toLatex(expr.trim())}$`);
  result = result.replace(/Factori[sz]e\s+([^\n]+?)(?=\s+by\s+|\s*$)/gi, (match, expr) => expr.includes('$') ? match : `Factorise $${toLatex(expr.trim())}$`);
  result = result.replace(/Multiply\s+([^\n]+?)\s+by\s+([^\n]+?)(?=\s+and|\s*$)/gi, (match, expr1, expr2) => {
    if (expr1.includes('$') || expr2.includes('$')) return match;
    return `Multiply $${toLatex(expr1.trim())}$ by $${toLatex(expr2.trim())}$`;
  });
  result = convertTextMathToLatex(result);
  return result;
};

const renderWithKatex = (latex, displayMode = false) => {
  try {
    if (typeof window !== 'undefined' && window.katex) {
      return window.katex.renderToString(latex, {
        throwOnError: false,
        displayMode: displayMode,
        strict: false,
        trust: true,
        macros: { "\\R": "\\mathbb{R}", "\\N": "\\mathbb{N}", "\\Z": "\\mathbb{Z}", "\\Q": "\\mathbb{Q}", "\\C": "\\mathbb{C}" }
      });
    }
    return latex;
  } catch (error) {
    console.warn('KaTeX rendering error:', error);
    return `<span class="latex-error">${escapeHtml(latex)}</span>`;
  }
};

const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const processLatexText = (text) => {
  if (!text || typeof text !== 'string') return '';
  if (isPureUnicode(text)) return escapeHtml(text);
  let result = text;
  if (!hasLatexDelimiters(text) && hasTextMathNotation(text)) {
    result = processTextMathExpressions(result);
  }
  result = result.replace(/\$\$([\s\S]+?)\$\$/g, (match, latex) => renderWithKatex(latex.trim(), true));
  result = result.replace(/\\\[([\s\S]+?)\\\]/g, (match, latex) => renderWithKatex(latex.trim(), true));
  result = result.replace(/\$(?!\$)([^$\n]+?)\$/g, (match, latex) => renderWithKatex(latex.trim(), false));
  result = result.replace(/\\\(([\s\S]+?)\\\)/g, (match, latex) => renderWithKatex(latex.trim(), false));
  if (hasLatexCommands(result) && !hasLatexDelimiters(text)) {
    result = renderWithKatex(result, false);
  }
  return result;
};

// ============================================
// LATEX RENDERER COMPONENT
// ============================================
const LatexRenderer = React.memo(({ text, className = '' }) => {
  const [renderedHtml, setRenderedHtml] = useState('');
  const [isKatexReady, setIsKatexReady] = useState(false);

  useEffect(() => {
    const checkKatex = () => {
      if (typeof window !== 'undefined' && window.katex) {
        setIsKatexReady(true);
        return true;
      }
      return false;
    };
    if (checkKatex()) return;
    const interval = setInterval(() => { if (checkKatex()) clearInterval(interval); }, 100);
    const timeout = setTimeout(() => clearInterval(interval), 5000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, []);

  useEffect(() => {
    if (!text) { setRenderedHtml(''); return; }
    setRenderedHtml(isKatexReady ? processLatexText(text) : escapeHtml(text));
  }, [text, isKatexReady]);

  if (!text) return null;
  if (renderedHtml) {
    return <span className={`qpg-latex ${className}`} dangerouslySetInnerHTML={{ __html: renderedHtml }} />;
  }
  return <span className={className}>{text}</span>;
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
    } catch { return initialValue; }
  });
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) { console.error(error); }
  }, [key, storedValue]);
  return [storedValue, setValue];
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
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
  async getChapters(classId) {
    const res = await fetch(`${API_BASE_URL}/chapters/?class_id=${classId}`);
    return res.json();
  },
  async getChapterQuestions(chapterId) {
    const res = await fetch(`${API_BASE_URL}/chapters/${chapterId}/`);
    return res.json();
  },
  async getDashboardStats() {
    const res = await fetch(`${API_BASE_URL}/dashboard/`);
    return res.json();
  },
};

// ============================================
// ICON COMPONENTS
// ============================================
const Icons = {
  Book: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  CheckCircle: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  ChevronRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>,
  ChevronDown: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  FileText: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Filter: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Trash: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  BarChart: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  Target: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Layers: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  X: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Printer: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  Copy: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  ArrowLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const getSectionColor = (section) => {
  const colors = {
    'A': { bg: 'rgba(0, 193, 212, 0.15)', text: '#00a3b5', border: '#00c1d4' },
    'B': { bg: 'rgba(0, 27, 108, 0.12)', text: '#001b6c', border: '#001b6c' },
    'C': { bg: 'rgba(16, 185, 129, 0.12)', text: '#059669', border: '#10b981' },
    'D': { bg: 'rgba(245, 158, 11, 0.12)', text: '#b45309', border: '#f59e0b' },
    'E': { bg: 'rgba(139, 92, 246, 0.12)', text: '#7c3aed', border: '#8b5cf6' },
  };
  return colors[section] || { bg: '#f1f5f9', text: '#475569', border: '#94a3b8' };
};

const formatMarks = (marks) => `${marks} Mark${marks !== 1 ? 's' : ''}`;

// ============================================
// MAIN COMPONENT
// ============================================
export default function QuestionPaperGenerator() {
  // State
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [chapterQuestions, setChapterQuestions] = useState({});
  const [selectedQuestions, setSelectedQuestions] = useLocalStorage('qpg-selected', {});
  const [weightageData, setWeightageData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('dashboard');
  const [examDuration, setExamDuration] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
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
    } catch { showNotification('Failed to load classes', 'error'); }
    setLoading(false);
  };

  const loadDashboardStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setDashboardStats(data);
    } catch { console.error('Failed to load dashboard stats'); }
  };

  const loadChapters = async (classId) => {
    try {
      const data = await api.getChapters(classId);
      setChapters(data.results || data);
    } catch { showNotification('Failed to load chapters', 'error'); }
  };

  const loadWeightageData = async (classId) => {
    try {
      const data = await api.getClassWeightage(classId);
      setWeightageData(data);
    } catch { console.error('Failed to load weightage'); }
  };

  const loadChapterQuestions = async (chapterId) => {
    if (chapterQuestions[chapterId]) return;
    try {
      const data = await api.getChapterQuestions(chapterId);
      setChapterQuestions(prev => ({ ...prev, [chapterId]: data.questions || [] }));
    } catch { showNotification('Failed to load questions', 'error'); }
  };

  // Event Handlers
  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    setExpandedChapters({});
    setView('questions');
  };

  const handleChapterToggle = (chapter) => {
    const isExpanded = expandedChapters[chapter.id];
    setExpandedChapters(prev => ({ ...prev, [chapter.id]: !isExpanded }));
    if (!isExpanded) loadChapterQuestions(chapter.id);
  };

  const handleQuestionToggle = (question, chapter) => {
    const key = `${chapter.id}_${question.id}`;
    setSelectedQuestions(prev => {
      if (prev[key]) {
        const { [key]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: { ...question, chapter: chapter.name, chapterId: chapter.id, unitId: chapter.unit } };
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
    setView('paper');
  };

  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  };

  // Computed Values
  const totalSelectedQuestions = Object.keys(selectedQuestions).length;
  const totalSelectedMarks = Object.values(selectedQuestions).reduce((sum, q) => sum + (q.marks || 0), 0);

  const sectionCounts = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    Object.values(selectedQuestions).forEach(q => { if (counts.hasOwnProperty(q.section)) counts[q.section]++; });
    return counts;
  }, [selectedQuestions]);

  const selectedMarksPerChapter = useMemo(() => {
    const marks = {};
    Object.values(selectedQuestions).forEach(q => {
      if (q.chapterId) marks[q.chapterId] = (marks[q.chapterId] || 0) + (q.marks || 0);
    });
    return marks;
  }, [selectedQuestions]);

  const selectedMarksPerUnit = useMemo(() => {
    const marks = {};
    weightageData.forEach(unit => {
      let unitMarks = 0;
      unit.chapters?.forEach(ch => { unitMarks += selectedMarksPerChapter[ch.id] || 0; });
      marks[unit.id] = unitMarks;
    });
    return marks;
  }, [selectedQuestions, weightageData, selectedMarksPerChapter]);

  const filteredChapters = useMemo(() => {
    if (!debouncedSearch) return chapters;
    const query = debouncedSearch.toLowerCase();
    return chapters.filter(ch => ch.name.toLowerCase().includes(query) || ch.unit_name?.toLowerCase().includes(query));
  }, [chapters, debouncedSearch]);

  // ============================================
  // RENDER FUNCTIONS
  // ============================================
  const renderNotifications = () => (
    <div className="qpg-toast-container">
      {notifications.map(n => (
        <div key={n.id} className={`qpg-toast qpg-toast-${n.type}`}>
          <span>{n.message}</span>
          <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))}><Icons.X /></button>
        </div>
      ))}
    </div>
  );

  const renderDashboard = () => (
    <div className="qpg-dashboard fade-in">
      <div className="qpg-dashboard-header">
        <h1>Question Paper Generator</h1>
        <p>Create professional exam papers with ease. Select a class to get started.</p>
      </div>

      {dashboardStats && (
        <div className="qpg-stats-row">
          {[
            { label: 'Total Classes', value: dashboardStats.total_classes, icon: <Icons.Book />, color: 'blue' },
            { label: 'Total Units', value: dashboardStats.total_units, icon: <Icons.Layers />, color: 'green' },
            { label: 'Total Chapters', value: dashboardStats.total_chapters, icon: <Icons.FileText />, color: 'yellow' },
            { label: 'Total Questions', value: dashboardStats.total_questions, icon: <Icons.Target />, color: 'pink' },
          ].map((stat, i) => (
            <div key={i} className={`qpg-stat-card metric-card-${stat.color}`}>
              <div className="qpg-stat-icon">{stat.icon}</div>
              <div className="qpg-stat-info">
                <span className="qpg-stat-value">{stat.value}</span>
                <span className="qpg-stat-label">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="qpg-section-card">
        <div className="qpg-section-header">
          <h2>Select a Class</h2>
          <p>Choose a class to start creating your question paper</p>
        </div>
        <div className="qpg-class-grid">
          {loading ? (
            <div className="qpg-loading"><div className="qpg-spinner"></div><span>Loading classes...</span></div>
          ) : classes.map((cls) => (
            <div key={cls.id} className="qpg-class-item" onClick={() => handleClassSelect(cls)}>
              <div className="qpg-class-icon">{cls.icon || '📚'}</div>
              <div className="qpg-class-details">
                <h3>{cls.display_name}</h3>
                <div className="qpg-class-meta">
                  <span><Icons.Layers /> {cls.total_units || '—'} Units</span>
                  <span><Icons.FileText /> {cls.total_chapters || '—'} Chapters</span>
                </div>
              </div>
              <div className="qpg-class-arrow"><Icons.ChevronRight /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSidebar = () => {
    const totalTarget = weightageData.reduce((sum, u) => sum + (u.weightage || 0), 0);
    const totalSelected = Object.values(selectedMarksPerUnit).reduce((sum, m) => sum + m, 0);
    const percentage = totalTarget > 0 ? (totalSelected / totalTarget) * 100 : 0;
    const progressStatus = percentage > 100 ? 'exceeded' : percentage >= 80 ? 'warning' : '';

    return (
      <aside className="qpg-sidebar">
        {/* Summary Card */}
        <div className="qpg-sidebar-card qpg-summary">
          <h3><Icons.CheckCircle /> Selection Summary</h3>
          <div className="qpg-summary-stats">
            <div className="qpg-summary-stat">
              <span className="qpg-summary-value">{totalSelectedQuestions}</span>
              <span className="qpg-summary-label">Questions</span>
            </div>
            <div className="qpg-summary-stat">
              <span className="qpg-summary-value">{totalSelectedMarks}</span>
              <span className="qpg-summary-label">Total Marks</span>
            </div>
          </div>
          <div className="qpg-section-breakdown">
            {Object.entries(sectionCounts).map(([section, count]) => count > 0 && (
              <span key={section} className="qpg-section-tag" style={{ background: getSectionColor(section).bg, color: getSectionColor(section).text }}>
                Section {section}: {count}
              </span>
            ))}
          </div>
          <div className="qpg-sidebar-actions">
            <button className="qpg-btn qpg-btn-primary" onClick={handleGeneratePaper} disabled={totalSelectedQuestions === 0}>
              <Icons.FileText /> Generate Paper
            </button>
            <button className="qpg-btn qpg-btn-outline-danger" onClick={handleClearSelection} disabled={totalSelectedQuestions === 0}>
              <Icons.Trash /> Clear Selection
            </button>
          </div>
        </div>

        {/* Section Filter */}
        <div className="qpg-sidebar-card">
          <h3><Icons.Filter /> Section Filter</h3>
          <div className="qpg-filter-group">
            {['all', 'A', 'B', 'C', 'D', 'E'].map(s => (
              <button key={s} className={`qpg-filter-btn ${sectionFilter === s ? 'active' : ''}`} onClick={() => setSectionFilter(s)}>
                {s === 'all' ? 'All' : `Section ${s}`}
              </button>
            ))}
          </div>
        </div>

        {/* Weightage Progress */}
        <div className="qpg-sidebar-card">
          <h3><Icons.BarChart /> Weightage Progress</h3>
          <div className="qpg-progress-overview">
            <div className="qpg-progress-header">
              <span>Overall Progress</span>
              <span className={progressStatus}>{totalSelected} / {totalTarget} marks</span>
            </div>
            <div className="qpg-progress-track">
              <div className={`qpg-progress-bar ${progressStatus}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
            </div>
          </div>
          <div className="qpg-unit-list">
            {weightageData.map(unit => {
              const unitSelected = selectedMarksPerUnit[unit.id] || 0;
              const unitTarget = unit.weightage || 0;
              const unitPercentage = unitTarget > 0 ? (unitSelected / unitTarget) * 100 : 0;
              const unitStatus = unitSelected > unitTarget ? 'exceeded' : unitSelected >= unitTarget * 0.8 ? 'warning' : '';
              return (
                <div key={unit.id} className="qpg-unit-row">
                  <div className="qpg-unit-info">
                    <span className="qpg-unit-name">{unit.short_name || unit.name?.split(': ')[1] || unit.name}</span>
                    <span className={`qpg-unit-progress-text ${unitStatus}`}>{unitSelected}/{unitTarget}</span>
                  </div>
                  <div className="qpg-unit-track">
                    <div className={`qpg-unit-bar ${unitStatus}`} style={{ width: `${Math.min(unitPercentage, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    );
  };

  const renderQuestionSelection = () => (
    <div className="qpg-question-view fade-in">
      {/* Class Banner */}
      <div className="qpg-class-banner">
        <button className="qpg-back-btn" onClick={() => { setSelectedClass(null); setView('dashboard'); }}>
          <Icons.ArrowLeft /> Back
        </button>
        <div className="qpg-class-title">
          <span className="qpg-class-emoji">{selectedClass?.icon || '📚'}</span>
          <div>
            <h1>{selectedClass?.display_name}</h1>
            <p>{chapters.length} Chapters • {selectedClass?.total_marks || 80} Marks Total</p>
          </div>
        </div>
      </div>

      <div className="qpg-layout">
        <div className="qpg-main-content">
          {/* Toolbar */}
          <div className="qpg-toolbar">
            <div className="qpg-search-box">
              <Icons.Search />
              <input type="text" placeholder="Search chapters..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              {searchQuery && <button onClick={() => setSearchQuery('')}><Icons.X /></button>}
            </div>
            <div className="qpg-filter-group">
              <span className="qpg-filter-label"><Icons.Filter /> Section:</span>
              {['all', 'A', 'B', 'C', 'D', 'E'].map(s => (
                <button key={s} className={`qpg-filter-btn ${sectionFilter === s ? 'active' : ''}`} onClick={() => setSectionFilter(s)}>
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>

          {/* Chapters List */}
          <div className="qpg-chapters-list">
            {filteredChapters.length === 0 ? (
              <div className="qpg-empty-state">
                <Icons.Search />
                <h3>No chapters found</h3>
                <p>Try adjusting your search query</p>
              </div>
            ) : filteredChapters.map(chapter => {
              const isExpanded = expandedChapters[chapter.id];
              const questions = chapterQuestions[chapter.id] || [];
              const selectedInChapter = Object.keys(selectedQuestions).filter(k => k.startsWith(`${chapter.id}_`)).length;
              const chapterSelectedMarks = selectedMarksPerChapter[chapter.id] || 0;

              let chapterTarget = 0;
              weightageData.forEach(unit => {
                const ch = unit.chapters?.find(c => c.id === chapter.id);
                if (ch) chapterTarget = ch.calculated_weightage || 0;
              });

              const filteredQuestions = sectionFilter === 'all' ? questions : questions.filter(q => q.section === sectionFilter);
              const groupedBySection = {};
              filteredQuestions.forEach(q => {
                if (!groupedBySection[q.section]) groupedBySection[q.section] = [];
                groupedBySection[q.section].push(q);
              });

              const weightageStatus = chapterSelectedMarks > chapterTarget ? 'exceeded' : chapterSelectedMarks >= chapterTarget * 0.8 ? 'warning' : 'ok';

              return (
                <div key={chapter.id} className={`qpg-chapter-card ${isExpanded ? 'expanded' : ''}`}>
                  <div className="qpg-chapter-header" onClick={() => handleChapterToggle(chapter)}>
                    <div className="qpg-chapter-expand">
                      {isExpanded ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                    </div>
                    <div className="qpg-chapter-info">
                      <h3>{chapter.name}</h3>
                      <span>{chapter.total_questions || questions.length} questions • {chapter.total_marks || 0} marks</span>
                    </div>
                    <div className="qpg-chapter-status">
                      {chapterTarget > 0 && (
                        <span className={`qpg-status-badge ${weightageStatus}`}>{chapterSelectedMarks}/{chapterTarget} marks</span>
                      )}
                      {selectedInChapter > 0 && (
                        <span className="qpg-selected-badge">{selectedInChapter} selected</span>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="qpg-questions-container">
                      {questions.length === 0 ? (
                        <div className="qpg-loading-questions">Loading questions...</div>
                      ) : Object.keys(groupedBySection).length === 0 ? (
                        <div className="qpg-loading-questions">No questions match the filter</div>
                      ) : ['A', 'B', 'C', 'D', 'E'].map(section => {
                        const sectionQuestions = groupedBySection[section];
                        if (!sectionQuestions || sectionQuestions.length === 0) return null;
                        const sectionColor = getSectionColor(section);
                        const sectionMarks = sectionQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);

                        return (
                          <div key={section} className="qpg-section-block">
                            <div className="qpg-section-title" style={{ background: sectionColor.bg, color: sectionColor.text }}>
                              <span>Section {section}</span>
                              <span>{sectionQuestions.length} questions • {sectionMarks} marks</span>
                            </div>
                            {sectionQuestions.map(question => {
                              const key = `${chapter.id}_${question.id}`;
                              const isSelected = selectedQuestions[key];
                              return (
                                <div key={question.id} className={`qpg-question-item ${isSelected ? 'selected' : ''}`} onClick={() => handleQuestionToggle(question, chapter)}>
                                  <div className={`qpg-checkbox ${isSelected ? 'checked' : ''}`}>
                                    {isSelected && <Icons.CheckCircle />}
                                  </div>
                                  <div className="qpg-question-body">
                                    <div className="qpg-question-text"><LatexRenderer text={question.question_text} /></div>
                                    {question.figure && (
                                      <div className="qpg-question-figure">
                                        <img src={question.figure.startsWith('data:') ? question.figure : question.figure.startsWith('/9j/') || question.figure.startsWith('9j/') ? `data:image/jpeg;base64,${question.figure.startsWith('/') ? question.figure : '/' + question.figure}` : `data:image/png;base64,${question.figure}`} alt="Question figure" />
                                      </div>
                                    )}
                                    <div className="qpg-question-meta">
                                      <span className="qpg-q-type" style={{ background: sectionColor.bg, color: sectionColor.text }}>
                                        {question.question_subtype || question.question_type || `Section ${section}`}
                                      </span>
                                      <span className="qpg-q-marks">{formatMarks(question.marks)}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
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
        {renderSidebar()}
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
      <div className="qpg-paper-view fade-in">
        <div className="qpg-paper-toolbar">
          <button className="qpg-btn qpg-btn-secondary" onClick={() => setView('questions')}>
            <Icons.ArrowLeft /> Back to Selection
          </button>
          <div className="qpg-paper-actions">
            <div className="qpg-duration-control">
              <label>Duration:</label>
              <select value={examDuration} onChange={(e) => setExamDuration(Number(e.target.value))}>
                <option value={1}>1 Hour</option>
                <option value={1.5}>1.5 Hours</option>
                <option value={2}>2 Hours</option>
                <option value={2.5}>2.5 Hours</option>
                <option value={3}>3 Hours</option>
              </select>
            </div>
            <button className="qpg-btn qpg-btn-secondary" onClick={() => {
              const content = document.getElementById('paper-content')?.innerText || '';
              navigator.clipboard.writeText(content);
              showNotification('Paper copied to clipboard!', 'success');
            }}><Icons.Copy /> Copy</button>
            <button className="qpg-btn qpg-btn-primary" onClick={() => window.print()}><Icons.Printer /> Print</button>
          </div>
        </div>

        <div id="paper-content" className="qpg-paper-document">
          <div className="qpg-paper-header">
            <h1>{selectedClass?.display_name}</h1>
            <h2>Question Paper</h2>
            <div className="qpg-paper-meta">
              <span>Questions: {questionsList.length}</span>
              <span>Total Marks: {totalSelectedMarks}</span>
              <span>Time: {examDuration} {examDuration === 1 ? 'Hour' : 'Hours'}</span>
            </div>
          </div>
          <hr className="qpg-paper-divider" />

          {['A', 'B', 'C', 'D', 'E'].map(section => {
            const sectionQuestions = groupedBySection[section];
            if (!sectionQuestions || sectionQuestions.length === 0) return null;
            const sectionColor = getSectionColor(section);
            const sectionMarks = sectionQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);

            return (
              <div key={section} className="qpg-paper-section">
                <div className="qpg-paper-section-header">
                  <span>Section {section}</span>
                  <span>{sectionQuestions.length} Questions • {sectionMarks} Marks</span>
                </div>
                <ol className="qpg-paper-questions">
                  {sectionQuestions.map((q, idx) => (
                    <li key={idx} className="qpg-paper-q">
                      <div className="qpg-paper-q-num">Q{questionNumber++}.</div>
                      <div className="qpg-paper-q-content">
                        <LatexRenderer text={q.question_text} />
                        {q.figure && (
                          <div className="qpg-paper-q-figure">
                            <img src={q.figure.startsWith('data:') ? q.figure : q.figure.startsWith('/9j/') || q.figure.startsWith('9j/') ? `data:image/jpeg;base64,${q.figure.startsWith('/') ? q.figure : '/' + q.figure}` : `data:image/png;base64,${q.figure}`} alt="Figure" />
                          </div>
                        )}
                        <div className="qpg-paper-q-source">{q.chapter}</div>
                      </div>
                      <div className="qpg-paper-q-marks" style={{ background: sectionColor.bg, color: sectionColor.text }}>[{q.marks}M]</div>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
          <div className="qpg-paper-footer">*** End of Question Paper ***</div>
        </div>
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="qpg-container">
      {renderNotifications()}
      {view === 'dashboard' && renderDashboard()}
      {view === 'questions' && renderQuestionSelection()}
      {view === 'paper' && renderPaperView()}
    </div>
  );
}
