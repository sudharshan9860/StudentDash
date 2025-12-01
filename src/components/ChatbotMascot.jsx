// ChatbotMascot.jsx - Enhanced Half-Body Student Avatar with Hands
// Face + shoulders + hands for expressive poses like thinking, waving
// Professional ed-tech mascot for teenagers

import React, { useMemo } from 'react';
import './ChatbotMascot.css';

/**
 * ChatbotMascot Component - Half Body Version
 * 
 * @param {string} expression - 'neutral' | 'happy' | 'thinking' | 'excited' | 'listening' | 'sad' | 'waving' | 'curious'
 * @param {string} size - 'small' (40px) | 'medium' (56px) | 'large' (72px) | 'xlarge' (96px)
 * @param {boolean} animated - Enable/disable animations
 * @param {string} className - Additional CSS classes
 * @param {function} onClick - Click handler
 * @param {string} message - Speech bubble message (optional)
 * @param {boolean} showMessage - Show/hide speech bubble
 * @param {boolean} chatOpen - Whether chat window is open (controls bubble visibility)
 * @param {string} bubblePosition - 'top' | 'right' | 'bottom' - Position of speech bubble
 */
const ChatbotMascot = ({ 
  expression = 'neutral', 
  size = 'medium',
  animated = true,
  className = '',
  onClick = null,
  message = '',
  showMessage = false,
  chatOpen = true, // Default to true for backward compatibility
  bubblePosition = 'top' // 'top' | 'right' | 'bottom'
}) => {
  // Size mapping - slightly larger for half body
  const sizeMap = {
    small: 40,
    medium: 56,
    large: 72,
    xlarge: 96
  };
  
  const dimension = sizeMap[size] || 56;

  // Expression-based configurations with hand positions
  const expressionConfig = useMemo(() => ({
    neutral: {
      eyeScale: 1,
      pupilOffset: 0,
      mouthPath: 'M 35 42 Q 40 44 45 42',
      browOffset: 0,
      blush: 0.3,
      headBob: false,
      eyeAnimation: 'blink',
      handPose: 'rest',
      extraElement: null
    },
    happy: {
      eyeScale: 0.85,
      pupilOffset: 0,
      mouthPath: 'M 32 40 Q 40 48 48 40',
      browOffset: -1,
      blush: 0.6,
      headBob: true,
      eyeAnimation: 'squint',
      handPose: 'thumbsUp',
      extraElement: 'sparkles'
    },
    thinking: {
      eyeScale: 1,
      pupilOffset: 3,
      mouthPath: 'M 36 42 Q 40 42 44 44',
      browOffset: 2,
      blush: 0.2,
      headBob: false,
      eyeAnimation: 'look-around',
      handPose: 'chinThink',
      extraElement: 'thought-bubbles'
    },
    excited: {
      eyeScale: 1.1,
      pupilOffset: 0,
      mouthPath: 'M 30 38 Q 40 50 50 38',
      browOffset: -2,
      blush: 0.7,
      headBob: true,
      eyeAnimation: 'sparkle',
      handPose: 'celebrate',
      extraElement: 'stars'
    },
    listening: {
      eyeScale: 1,
      pupilOffset: -2,
      mouthPath: 'M 36 42 Q 40 40 44 42',
      browOffset: 1,
      blush: 0.3,
      headBob: false,
      eyeAnimation: 'focus',
      handPose: 'earCup',
      extraElement: 'sound-waves'
    },
    sad: {
      eyeScale: 0.9,
      pupilOffset: 0,
      mouthPath: 'M 34 46 Q 40 42 46 46',
      browOffset: 3,
      blush: 0.1,
      headBob: false,
      eyeAnimation: 'droopy',
      handPose: 'rest',
      extraElement: null
    },
    waving: {
      eyeScale: 1,
      pupilOffset: 0,
      mouthPath: 'M 32 40 Q 40 46 48 40',
      browOffset: -1,
      blush: 0.5,
      headBob: true,
      eyeAnimation: 'blink',
      handPose: 'wave',
      extraElement: null
    },
    curious: {
      eyeScale: 1.15,
      pupilOffset: 2,
      mouthPath: 'M 37 42 Q 40 40 43 42',
      browOffset: -1,
      blush: 0.3,
      headBob: false,
      eyeAnimation: 'wide',
      handPose: 'point',
      extraElement: 'question-mark'
    }
  }), []);

  const config = expressionConfig[expression] || expressionConfig.neutral;

  // Color palette
  const colors = {
    skin: '#F5D0B9',
    skinShadow: '#E8B89D',
    skinHighlight: '#FFEEDD',
    hair: '#3D2314',
    hairHighlight: '#5C3A2A',
    eyeWhite: '#FFFFFF',
    eyeIris: '#4A6FA5',
    eyePupil: '#1E3A5F',
    eyeShine: '#FFFFFF',
    mouth: '#C75B5B',
    teeth: '#FFFFFF',
    blush: '#FFB5B5',
    accent: '#00BCD4',
    accentDark: '#0097A7',
    shirt: '#4A90D9',
    shirtDark: '#3A7BC8',
    shirtLight: '#5BA0E9'
  };

  // Render hand based on pose
  const renderHand = (pose) => {
    switch (pose) {
      case 'chinThink':
        // Hand on chin - thinking pose 🤔
        return (
          <g className="chatbot-mascot__hand chatbot-mascot__hand--think">
            {/* Arm coming up to chin */}
            <path
              d="M 58 75 Q 62 62 56 52 Q 52 47 48 46"
              stroke={colors.skin}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            {/* Hand/fist at chin */}
            <ellipse cx="50" cy="48" rx="6" ry="5" fill={colors.skin} />
            {/* Fingers curled */}
            <path d="M 46 46 Q 44 44 46 42" stroke={colors.skin} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 48 45 Q 47 42 49 40" stroke={colors.skin} strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Shadow */}
            <ellipse cx="50" cy="49" rx="5" ry="3" fill={colors.skinShadow} opacity="0.3" />
          </g>
        );
      
      case 'wave':
        // Waving hand 👋
        return (
          <g className="chatbot-mascot__hand chatbot-mascot__hand--wave">
            {/* Arm */}
            <path
              d="M 62 75 Q 70 60 74 48"
              stroke={colors.skin}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            {/* Open palm */}
            <ellipse cx="75" cy="44" rx="7" ry="6" fill={colors.skin} />
            {/* Fingers spread */}
            <rect x="70" y="36" width="3" height="10" rx="1.5" fill={colors.skin} transform="rotate(-15 71.5 41)" />
            <rect x="74" y="34" width="3" height="11" rx="1.5" fill={colors.skin} transform="rotate(-5 75.5 39.5)" />
            <rect x="78" y="35" width="3" height="10" rx="1.5" fill={colors.skin} transform="rotate(5 79.5 40)" />
            <rect x="81" y="38" width="3" height="8" rx="1.5" fill={colors.skin} transform="rotate(15 82.5 42)" />
            {/* Thumb */}
            <rect x="68" y="42" width="3" height="7" rx="1.5" fill={colors.skin} transform="rotate(-45 69.5 45.5)" />
          </g>
        );
      
      case 'thumbsUp':
        // Thumbs up 👍
        return (
          <g className="chatbot-mascot__hand chatbot-mascot__hand--thumbsup">
            {/* Arm */}
            <path
              d="M 60 75 Q 66 64 68 55"
              stroke={colors.skin}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            {/* Fist */}
            <ellipse cx="69" cy="52" rx="6" ry="5" fill={colors.skin} />
            {/* Curled fingers */}
            <path d="M 65 54 Q 64 56 66 57" stroke={colors.skinShadow} strokeWidth="2" fill="none" opacity="0.5" />
            {/* Thumb up */}
            <rect x="67" y="42" width="4" height="12" rx="2" fill={colors.skin} />
            <ellipse cx="69" cy="42" rx="3" ry="2" fill={colors.skin} />
          </g>
        );
      
      case 'celebrate':
        // Both hands up 🎉
        return (
          <g className="chatbot-mascot__hand chatbot-mascot__hand--celebrate">
            {/* Left arm up */}
            <path
              d="M 18 75 Q 10 58 6 48"
              stroke={colors.skin}
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
            />
            <ellipse cx="5" cy="44" rx="5" ry="4" fill={colors.skin} />
            {/* Right arm up */}
            <path
              d="M 62 75 Q 70 58 74 48"
              stroke={colors.skin}
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
            />
            <ellipse cx="75" cy="44" rx="5" ry="4" fill={colors.skin} />
            {/* Stars around hands */}
            <text x="0" y="40" fontSize="8" className="chatbot-mascot__celebrate-star">✨</text>
            <text x="76" y="40" fontSize="8" className="chatbot-mascot__celebrate-star chatbot-mascot__celebrate-star--delayed">✨</text>
          </g>
        );
      
      case 'earCup':
        // Hand cupping ear 👂
        return (
          <g className="chatbot-mascot__hand chatbot-mascot__hand--ear">
            {/* Arm to ear */}
            <path
              d="M 62 75 Q 68 60 64 50 Q 60 42 56 38"
              stroke={colors.skin}
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
            />
            {/* Cupped hand near ear */}
            <path
              d="M 58 36 Q 54 34 52 36 Q 50 40 52 44 Q 56 46 60 42 Q 62 38 58 36"
              fill={colors.skin}
              stroke={colors.skinShadow}
              strokeWidth="1"
            />
          </g>
        );
      
      case 'point':
        // Pointing finger ☝️
        return (
          <g className="chatbot-mascot__hand chatbot-mascot__hand--point">
            {/* Arm */}
            <path
              d="M 62 75 Q 70 58 72 48"
              stroke={colors.skin}
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
            />
            {/* Fist */}
            <ellipse cx="72" cy="46" rx="5" ry="4" fill={colors.skin} />
            {/* Pointing finger */}
            <rect x="70" y="34" width="4" height="14" rx="2" fill={colors.skin} />
            <ellipse cx="72" cy="34" rx="2.5" ry="2" fill={colors.skin} />
          </g>
        );
      
      case 'rest':
      default:
        // Hands at rest (visible at sides)
        return (
          <g className="chatbot-mascot__hand chatbot-mascot__hand--rest">
            {/* Left arm hint */}
            <path
              d="M 18 75 Q 12 70 10 75"
              stroke={colors.skin}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
            {/* Right arm hint */}
            <path
              d="M 62 75 Q 68 70 70 75"
              stroke={colors.skin}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        );
    }
  };

  // Render extra elements based on expression
  const renderExtraElement = () => {
    switch (config.extraElement) {
      case 'sparkles':
        return (
          <g className="chatbot-mascot__sparkles">
            <path d="M 8 18 L 10 22 L 8 26 L 6 22 Z" fill={colors.accent} className="chatbot-mascot__sparkle" />
            <path d="M 72 18 L 74 22 L 72 26 L 70 22 Z" fill={colors.accent} className="chatbot-mascot__sparkle chatbot-mascot__sparkle--delayed" />
          </g>
        );
      case 'thought-bubbles':
        return (
          <g className="chatbot-mascot__thought-bubbles">
            <circle cx="72" cy="18" r="3" fill={colors.accent} opacity="0.6" />
            <circle cx="78" cy="12" r="2.5" fill={colors.accent} opacity="0.4" />
            <circle cx="82" cy="6" r="2" fill={colors.accent} opacity="0.3" />
          </g>
        );
      case 'stars':
        return (
          <g className="chatbot-mascot__stars">
            <text x="5" y="15" fontSize="10" className="chatbot-mascot__star">⭐</text>
            <text x="72" y="12" fontSize="8" className="chatbot-mascot__star chatbot-mascot__star--delayed">⭐</text>
          </g>
        );
      case 'sound-waves':
        return (
          <g className="chatbot-mascot__sound-waves">
            <path d="M 76 28 Q 80 30 76 32" stroke={colors.accent} strokeWidth="2" fill="none" opacity="0.6" className="chatbot-mascot__wave" />
            <path d="M 79 25 Q 84 30 79 35" stroke={colors.accent} strokeWidth="2" fill="none" opacity="0.4" className="chatbot-mascot__wave chatbot-mascot__wave--delayed" />
          </g>
        );
      case 'question-mark':
        return (
          <g className="chatbot-mascot__question-mark">
            <text x="74" y="18" fontSize="14" fill={colors.accent} fontWeight="bold" className="chatbot-mascot__question">?</text>
          </g>
        );
      default:
        return null;
    }
  };

  // Only show speech bubble if chat is open AND showMessage is true
  const shouldShowBubble = chatOpen && showMessage && message;

  return (
    <div 
      className={`chatbot-mascot chatbot-mascot--${size} chatbot-mascot--${expression} ${animated ? 'chatbot-mascot--animated' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : 'img'}
      aria-label={`Study buddy mascot - ${expression}`}
      tabIndex={onClick ? 0 : -1}
    >
      {/* Speech Bubble - Only shows when chat is open AND message is enabled */}
      {shouldShowBubble && (
        <div className={`chatbot-mascot__speech-bubble chatbot-mascot__speech-bubble--${size} chatbot-mascot__speech-bubble--${bubblePosition}`}>
          <span>{message}</span>
          <div className={`chatbot-mascot__speech-bubble-tail chatbot-mascot__speech-bubble-tail--${bubblePosition}`} />
        </div>
      )}

      <svg 
        viewBox="0 0 80 80" 
        width={dimension} 
        height={dimension}
        className="chatbot-mascot__svg"
      >
        {/* Definitions */}
        <defs>
          <linearGradient id={`skinGradient-${expression}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.skinHighlight} />
            <stop offset="50%" stopColor={colors.skin} />
            <stop offset="100%" stopColor={colors.skinShadow} />
          </linearGradient>
          
          <linearGradient id={`hairGradient-${expression}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.hairHighlight} />
            <stop offset="100%" stopColor={colors.hair} />
          </linearGradient>
          
          <linearGradient id={`shirtGradient-${expression}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.shirtLight} />
            <stop offset="50%" stopColor={colors.shirt} />
            <stop offset="100%" stopColor={colors.shirtDark} />
          </linearGradient>
          
          <radialGradient id={`irisGradient-${expression}`} cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#6B8FC7" />
            <stop offset="100%" stopColor={colors.eyeIris} />
          </radialGradient>
          
          <filter id={`glowFilter-${expression}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <filter id={`shadowFilter-${expression}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Background circle */}
        <circle cx="40" cy="40" r="38" className="chatbot-mascot__bg" fill="rgba(0,188,212,0.08)" />

        {/* Body/Shirt (behind hands) */}
        <g className="chatbot-mascot__body">
          {/* Shoulders and shirt */}
          <ellipse 
            cx="40" 
            cy="74" 
            rx="28" 
            ry="18" 
            fill={`url(#shirtGradient-${expression})`}
            filter={`url(#shadowFilter-${expression})`}
          />
          {/* Collar/neckline */}
          <path 
            d="M 32 58 Q 40 64 48 58" 
            stroke={colors.shirtDark} 
            strokeWidth="2" 
            fill="none"
          />
          {/* Neck */}
          <rect x="36" y="52" width="8" height="10" rx="2" fill={`url(#skinGradient-${expression})`} />
        </g>

        {/* Hands - rendered based on expression */}
        {renderHand(config.handPose)}

        {/* Head group */}
        <g className={`chatbot-mascot__head ${config.headBob ? 'chatbot-mascot__head--bobbing' : ''}`}>
          
          {/* Hair back */}
          <ellipse cx="40" cy="28" rx="22" ry="20" fill={`url(#hairGradient-${expression})`} className="chatbot-mascot__hair-back" />
          
          {/* Ears */}
          <ellipse cx="18" cy="36" rx="4" ry="5" fill={`url(#skinGradient-${expression})`} />
          <ellipse cx="62" cy="36" rx="4" ry="5" fill={`url(#skinGradient-${expression})`} />
          <ellipse cx="18" cy="36" rx="2.5" ry="3" fill={colors.skinShadow} opacity="0.3" />
          <ellipse cx="62" cy="36" rx="2.5" ry="3" fill={colors.skinShadow} opacity="0.3" />
          
          {/* Face */}
          <ellipse 
            cx="40" 
            cy="37" 
            rx="20" 
            ry="22" 
            fill={`url(#skinGradient-${expression})`} 
            filter={`url(#shadowFilter-${expression})`} 
            className="chatbot-mascot__face" 
          />
          
          {/* Hair front - bangs */}
          <path 
            d="M 20 28 Q 22 16 32 12 Q 40 10 48 12 Q 58 16 60 28 Q 56 24 50 22 Q 44 20 40 22 Q 36 20 30 22 Q 24 24 20 28 Z"
            fill={`url(#hairGradient-${expression})`}
            className="chatbot-mascot__hair-front"
          />
          
          {/* Hair highlight */}
          <path d="M 30 16 Q 35 14 40 16" stroke={colors.hairHighlight} strokeWidth="2" fill="none" opacity="0.5" />

          {/* Headband */}
          <path 
            d="M 18 26 Q 40 20 62 26"
            stroke={colors.accent}
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
            filter={`url(#glowFilter-${expression})`}
            className="chatbot-mascot__headband"
          />
          
          {/* Headband shine */}
          <path d="M 26 24 Q 34 21 42 24" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Eyebrows */}
          <g className="chatbot-mascot__eyebrows" transform={`translate(0, ${config.browOffset})`}>
            <path 
              d={expression === 'thinking' || expression === 'curious'
                ? "M 28 30 Q 31 28 35 30"
                : expression === 'sad'
                ? "M 28 29 Q 31 32 35 29"
                : "M 28 31 Q 31 29 35 31"
              }
              stroke={colors.hair}
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
            <path 
              d={expression === 'thinking' || expression === 'curious'
                ? "M 45 28 Q 49 26 53 29"
                : expression === 'sad'
                ? "M 45 29 Q 49 32 53 29"
                : "M 45 31 Q 49 29 53 31"
              }
              stroke={colors.hair}
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
            />
          </g>

          {/* Eyes */}
          <g className={`chatbot-mascot__eyes chatbot-mascot__eyes--${config.eyeAnimation}`}>
            {/* Left eye */}
            <g className="chatbot-mascot__eye chatbot-mascot__eye--left">
              <ellipse 
                cx="31" 
                cy="38" 
                rx="6" 
                ry={6 * config.eyeScale}
                fill={colors.eyeWhite}
                stroke="#E0E0E0"
                strokeWidth="0.5"
              />
              <circle 
                cx={31 + config.pupilOffset} 
                cy={38 + (expression === 'thinking' ? -1.5 : expression === 'listening' ? 1 : 0)} 
                r="3.5"
                fill={`url(#irisGradient-${expression})`}
              />
              <circle 
                cx={31 + config.pupilOffset} 
                cy={38 + (expression === 'thinking' ? -1.5 : expression === 'listening' ? 1 : 0)} 
                r="1.8"
                fill={colors.eyePupil}
              />
              <circle 
                cx={29 + config.pupilOffset} 
                cy={36.5 + (expression === 'thinking' ? -1.5 : expression === 'listening' ? 1 : 0)} 
                r="1.2"
                fill={colors.eyeShine}
                opacity="0.9"
              />
              {(expression === 'happy' || expression === 'excited') && (
                <path d="M 25 38 Q 31 42 37 38" stroke={colors.skin} strokeWidth="4" fill="none" />
              )}
            </g>

            {/* Right eye */}
            <g className="chatbot-mascot__eye chatbot-mascot__eye--right">
              <ellipse 
                cx="49" 
                cy="38" 
                rx="6" 
                ry={6 * config.eyeScale}
                fill={colors.eyeWhite}
                stroke="#E0E0E0"
                strokeWidth="0.5"
              />
              <circle 
                cx={49 + config.pupilOffset} 
                cy={38 + (expression === 'thinking' ? -1.5 : expression === 'listening' ? 1 : 0)} 
                r="3.5"
                fill={`url(#irisGradient-${expression})`}
              />
              <circle 
                cx={49 + config.pupilOffset} 
                cy={38 + (expression === 'thinking' ? -1.5 : expression === 'listening' ? 1 : 0)} 
                r="1.8"
                fill={colors.eyePupil}
              />
              <circle 
                cx={47 + config.pupilOffset} 
                cy={36.5 + (expression === 'thinking' ? -1.5 : expression === 'listening' ? 1 : 0)} 
                r="1.2"
                fill={colors.eyeShine}
                opacity="0.9"
              />
              {(expression === 'happy' || expression === 'excited') && (
                <path d="M 43 38 Q 49 42 55 38" stroke={colors.skin} strokeWidth="4" fill="none" />
              )}
            </g>
          </g>

          {/* Blush */}
          <g className="chatbot-mascot__blush" opacity={config.blush}>
            <ellipse cx="23" cy="44" rx="4" ry="2.5" fill={colors.blush} />
            <ellipse cx="57" cy="44" rx="4" ry="2.5" fill={colors.blush} />
          </g>

          {/* Nose */}
          <ellipse cx="40" cy="42" rx="1.8" ry="1.2" fill={colors.skinShadow} opacity="0.4" />

          {/* Mouth */}
          <g className="chatbot-mascot__mouth">
            <path 
              d={config.mouthPath}
              stroke={colors.mouth}
              strokeWidth="2"
              fill={expression === 'happy' || expression === 'excited' ? colors.mouth : 'none'}
              strokeLinecap="round"
              className="chatbot-mascot__mouth-path"
            />
            {(expression === 'happy' || expression === 'excited') && (
              <rect x="36" y="41" width="8" height="4" rx="1" fill={colors.teeth} opacity="0.9" />
            )}
          </g>

          {/* Extra elements based on expression */}
          {renderExtraElement()}
        </g>
      </svg>

      {/* Status indicator */}
      <div className={`chatbot-mascot__status chatbot-mascot__status--${expression}`} />
    </div>
  );
};

// Mascot messages for different actions
export const MascotMessages = {
  // Language changes
  languageEn: "Let's learn in English! 📚",
  languageHi: "चलो हिंदी में सीखें! 📚",
  languageTe: "తెలుగులో నేర్చుకుందాం! 📚",
  
  // Session actions
  clearChat: "Fresh start! Ask me anything! ✨",
  connecting: "Connecting to my brain... 🧠",
  connected: "I'm ready to help you! 🎉",
  disconnected: "Oops! Connection lost 😟",
  
  // Image actions
  imageUpload: "Ooh, let me see that! 👀",
  imageSolve: "Let me solve this! 🧮",
  imageCorrect: "Checking your answer! ✅",
  
  // Voice actions
  listening: "I'm all ears! 🎧",
  processingVoice: "Understanding you... 🎙️",
  
  // Suggestions
  suggestionProgress: "Let's check your progress! 📊",
  suggestionWeakness: "Finding areas to improve! 🎯",
  suggestionRemedial: "Creating a study plan! 📝",
  suggestionTutorial: "Let me show you around! 🎓",
  suggestionSolve: "Getting the solution! 💡",
  suggestionExplain: "Explaining concepts! 🔍",
  
  // General
  greeting: "Hi there! Ready to learn? 👋",
  thinking: "Hmm, let me think... 🤔",
  success: "Great job! Keep it up! 🌟",
  error: "Oops! Let's try again! 💪",
  typing: "Typing my response... ✍️"
};

export default ChatbotMascot;