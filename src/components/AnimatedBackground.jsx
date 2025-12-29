import React, { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import "./AnimatedBackground.css";

// Math and Science symbols for the floating animation
const SYMBOLS = [
  // Math symbols
  "∫", "∑", "∏", "√", "∞", "π", "θ", "α", "β", "γ", "δ", "λ", "μ", "σ", "Δ", "Ω",
  "±", "÷", "×", "≠", "≈", "≤", "≥", "∂", "∇", "∈", "∉", "⊂", "⊃", "∪", "∩",
  // Science symbols
  "⚛", "🧬", "🔬", "⚡", "☢", "⚗", "🧪", "📐", "📏", "🔭",
  // Formulas and expressions
  "E=mc²", "F=ma", "a²+b²", "sin", "cos", "tan", "log", "ln", "lim", "dx",
  "H₂O", "CO₂", "O₂", "NaCl", "Fe", "Au", "Ag", "Cu",
  // Geometric shapes
  "△", "□", "○", "◇", "⬡", "⬢",
  // Numbers
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
];

// Color palette for symbols
const COLORS = [
  "rgba(139, 92, 246, 0.6)",   // Purple
  "rgba(99, 102, 241, 0.6)",   // Indigo
  "rgba(59, 130, 246, 0.6)",   // Blue
  "rgba(6, 182, 212, 0.6)",    // Cyan
  "rgba(16, 185, 129, 0.6)",   // Emerald
  "rgba(245, 158, 11, 0.5)",   // Amber
  "rgba(236, 72, 153, 0.5)",   // Pink
  "rgba(168, 85, 247, 0.6)",   // Violet
];

// Generate random number within range
const random = (min, max) => Math.random() * (max - min) + min;

// Generate a random symbol configuration
const generateSymbol = (index, totalSymbols) => {
  const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const size = random(14, 32);
  const duration = random(15, 35);
  const delay = random(0, 10);

  // Distribute symbols across the viewport
  const startX = random(5, 95);
  const startY = random(100, 120); // Start below viewport
  const endY = random(-20, -5); // End above viewport

  // Add some horizontal drift
  const driftX = random(-30, 30);

  return {
    id: index,
    symbol,
    color,
    size,
    duration,
    delay,
    startX,
    startY,
    endY,
    driftX,
    rotation: random(0, 360),
    rotationEnd: random(-180, 180),
  };
};

const FloatingSymbol = React.memo(({ config, isDarkMode }) => {
  const symbolVariants = {
    animate: {
      y: [`${config.startY}vh`, `${config.endY}vh`],
      x: [`${config.startX}vw`, `${config.startX + config.driftX}vw`],
      rotate: [config.rotation, config.rotation + config.rotationEnd],
      opacity: [0, 0.8, 0.8, 0],
      scale: [0.5, 1, 1, 0.5],
    },
  };

  return (
    <motion.div
      className="floating-symbol"
      style={{
        position: "absolute",
        fontSize: `${config.size}px`,
        color: isDarkMode ? config.color : config.color.replace("0.6", "0.4").replace("0.5", "0.3"),
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontWeight: config.symbol.length > 2 ? 500 : 600,
        textShadow: isDarkMode
          ? `0 0 10px ${config.color}, 0 0 20px ${config.color.replace("0.6", "0.3")}`
          : `0 0 8px ${config.color.replace("0.6", "0.2")}`,
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 0,
        willChange: "transform, opacity",
      }}
      variants={symbolVariants}
      animate="animate"
      transition={{
        duration: config.duration,
        delay: config.delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {config.symbol}
    </motion.div>
  );
});

FloatingSymbol.displayName = "FloatingSymbol";

// Glowing orb component for ambient lighting effect
const GlowingOrb = React.memo(({ index, isDarkMode }) => {
  const colors = [
    "rgba(139, 92, 246, 0.15)",
    "rgba(59, 130, 246, 0.12)",
    "rgba(6, 182, 212, 0.12)",
    "rgba(168, 85, 247, 0.15)",
  ];

  const size = random(200, 400);
  const x = random(10, 90);
  const y = random(10, 90);
  const color = colors[index % colors.length];

  return (
    <motion.div
      className="glowing-orb"
      style={{
        position: "absolute",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: isDarkMode
          ? `radial-gradient(circle, ${color} 0%, transparent 70%)`
          : `radial-gradient(circle, ${color.replace("0.15", "0.08").replace("0.12", "0.06")} 0%, transparent 70%)`,
        filter: "blur(40px)",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 0,
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 0.8, 0.5],
        x: [0, random(-50, 50), 0],
        y: [0, random(-50, 50), 0],
      }}
      transition={{
        duration: random(8, 15),
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
});

GlowingOrb.displayName = "GlowingOrb";

// Grid pattern overlay
const GridPattern = React.memo(({ isDarkMode }) => {
  return (
    <div
      className="grid-pattern"
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: isDarkMode
          ? `linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
             linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)`
          : `linear-gradient(rgba(99, 102, 241, 0.04) 1px, transparent 1px),
             linear-gradient(90deg, rgba(99, 102, 241, 0.04) 1px, transparent 1px)`,
        backgroundSize: "50px 50px",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
});

GridPattern.displayName = "GridPattern";

// Particle burst effect on interaction
const ParticleBurst = React.memo(({ x, y, onComplete }) => {
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i * 30) * (Math.PI / 180),
      distance: random(30, 80),
      size: random(4, 8),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    })),
  []);

  return (
    <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none" }}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          style={{
            position: "absolute",
            width: particle.size,
            height: particle.size,
            borderRadius: "50%",
            backgroundColor: particle.color,
            boxShadow: `0 0 6px ${particle.color}`,
          }}
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            scale: [0, 1, 0],
            x: Math.cos(particle.angle) * particle.distance,
            y: Math.sin(particle.angle) * particle.distance,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
          onAnimationComplete={particle.id === 0 ? onComplete : undefined}
        />
      ))}
    </div>
  );
});

ParticleBurst.displayName = "ParticleBurst";

function AnimatedBackground({ isDarkMode = false, symbolCount = 30, showOrbs = true }) {
  // Generate symbols only once on mount
  const symbols = useMemo(
    () => Array.from({ length: symbolCount }, (_, i) => generateSymbol(i, symbolCount)),
    [symbolCount]
  );

  // Generate orbs
  const orbs = useMemo(
    () => Array.from({ length: 4 }, (_, i) => i),
    []
  );

  return (
    <div className={`animated-background ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Base gradient */}
      <div className="background-gradient" />

      {/* Grid pattern */}
      <GridPattern isDarkMode={isDarkMode} />

      {/* Glowing orbs for ambient effect */}
      {showOrbs && orbs.map((index) => (
        <GlowingOrb key={index} index={index} isDarkMode={isDarkMode} />
      ))}

      {/* Floating symbols */}
      <div className="symbols-container">
        {symbols.map((config) => (
          <FloatingSymbol key={config.id} config={config} isDarkMode={isDarkMode} />
        ))}
      </div>

      {/* Vignette overlay */}
      <div className="vignette-overlay" />
    </div>
  );
}

export default React.memo(AnimatedBackground);