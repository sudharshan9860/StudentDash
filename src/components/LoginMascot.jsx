import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./LoginMascot.css";

/**
 * LoginMascot Component - Emoji-Style Expressions
 * 
 * States:
 * - idle: Normal happy face 😊
 * - thinking: Hand on chin, pondering 🤔 (when typing)
 * - covering: Both hands covering eyes 🙈 (password hidden)
 * - peeking: One hand covering, one eye peeking 🫣 (show password)
 * - celebrating: Party mode with confetti 🥳 (login success)
 */
const LoginMascot = ({ state = "idle" }) => {
  return (
    <div className={`login-mascot-container ${state}`}>
      <motion.svg
        viewBox="0 0 200 220"
        className="login-mascot-svg"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Definitions */}
        <defs>
          {/* Background gradient */}
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f7fa" />
            <stop offset="100%" stopColor="#80deea" />
          </linearGradient>
          
          {/* Skin gradient */}
          <linearGradient id="skinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffecd2" />
            <stop offset="100%" stopColor="#fcb69f" />
          </linearGradient>
          
          {/* Hair gradient */}
          <linearGradient id="hairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5d4e37" />
            <stop offset="100%" stopColor="#3d3027" />
          </linearGradient>

          {/* Shirt gradient */}
          <linearGradient id="shirtGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4fc3f7" />
            <stop offset="100%" stopColor="#0288d1" />
          </linearGradient>

          {/* Blush gradient */}
          <radialGradient id="blushGradient">
            <stop offset="0%" stopColor="#ffb6c1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffb6c1" stopOpacity="0" />
          </radialGradient>

          {/* Hand skin gradient */}
          <linearGradient id="handGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffecd2" />
            <stop offset="100%" stopColor="#f8d5c2" />
          </linearGradient>

          {/* Party hat gradient */}
          <linearGradient id="partyHatGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff6b6b" />
            <stop offset="50%" stopColor="#feca57" />
            <stop offset="100%" stopColor="#48dbfb" />
          </linearGradient>
        </defs>

        {/* Background Circle */}
        <motion.circle
          cx="100"
          cy="85"
          r="75"
          fill="url(#bgGradient)"
          stroke="#00acc1"
          strokeWidth="3"
          animate={state === "celebrating" ? {
            stroke: ["#00acc1", "#ff6b6b", "#feca57", "#00acc1"],
          } : {}}
          transition={{ duration: 1, repeat: state === "celebrating" ? Infinity : 0 }}
        />

        {/* Confetti for celebrating */}
        <AnimatePresence>
          {state === "celebrating" && (
            <g className="confetti">
              {[...Array(12)].map((_, i) => (
                <motion.rect
                  key={i}
                  x={40 + (i % 4) * 40}
                  y={20 + Math.floor(i / 4) * 30}
                  width="8"
                  height="8"
                  rx="1"
                  fill={['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'][i % 6]}
                  initial={{ y: -20, opacity: 0, rotate: 0 }}
                  animate={{ 
                    y: [20 + Math.floor(i / 4) * 30, 180],
                    opacity: [1, 0],
                    rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)],
                    x: [40 + (i % 4) * 40, 40 + (i % 4) * 40 + (Math.random() - 0.5) * 60]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeOut"
                  }}
                />
              ))}
            </g>
          )}
        </AnimatePresence>

        {/* Party Hat for celebrating */}
        <AnimatePresence>
          {state === "celebrating" && (
            <motion.g
              initial={{ y: -30, opacity: 0, rotate: -20 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <polygon
                points="100,5 130,55 70,55"
                fill="url(#partyHatGradient)"
                stroke="#fff"
                strokeWidth="2"
              />
              {/* Hat stripes */}
              <line x1="85" y1="40" x2="95" y2="15" stroke="#fff" strokeWidth="2" opacity="0.5" />
              <line x1="105" y1="40" x2="100" y2="10" stroke="#fff" strokeWidth="2" opacity="0.5" />
              {/* Pom pom */}
              <circle cx="100" cy="5" r="6" fill="#ff6b6b" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* === BODY SECTION === */}
        
        {/* Shoulders/Shirt */}
        <ellipse
          cx="100"
          cy="185"
          rx="55"
          ry="35"
          fill="url(#shirtGradient)"
        />
        
        {/* Neck */}
        <rect
          x="85"
          y="140"
          width="30"
          height="25"
          rx="5"
          fill="url(#skinGradient)"
        />

        {/* Shirt collar */}
        <path
          d="M70 160 Q100 175 130 160 L130 185 Q100 170 70 185 Z"
          fill="url(#shirtGradient)"
        />

        {/* === ARMS === */}
        
        {/* LEFT ARM */}
        <motion.g
          className="left-arm"
          animate={
            state === "thinking" ? { rotate: 0, x: 20, y: -60 } :
            state === "covering" ? { rotate: -45, x: 25, y: -30 } :
            state === "peeking" ? { rotate: -45, x: 25, y: -30 } :
            state === "celebrating" ? { rotate: -30, x: 10, y: -40 } :
            { rotate: 0, x: 0, y: 0 }
          }
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{ originX: "45px", originY: "170px" }}
        >
          {/* Upper arm */}
          <ellipse cx="45" cy="170" rx="18" ry="12" fill="url(#shirtGradient)" />
          {/* Forearm */}
          <ellipse cx="30" cy="160" rx="15" ry="10" fill="url(#shirtGradient)" />
          {/* Hand */}
          <circle cx="18" cy="150" r="14" fill="url(#handGradient)" stroke="#e8c4b8" strokeWidth="1" />
          {/* Fingers */}
          <ellipse cx="8" cy="140" rx="5" ry="8" fill="url(#handGradient)" />
          <ellipse cx="15" cy="135" rx="4" ry="9" fill="url(#handGradient)" />
          <ellipse cx="22" cy="134" rx="4" ry="9" fill="url(#handGradient)" />
          <ellipse cx="29" cy="137" rx="4" ry="8" fill="url(#handGradient)" />
          <ellipse cx="30" cy="152" rx="6" ry="5" fill="url(#handGradient)" />
        </motion.g>

        {/* RIGHT ARM */}
        <motion.g
          className="right-arm"
          animate={
            state === "thinking" ? { rotate: 60, x: -50, y: -80 } :
            state === "covering" ? { rotate: 45, x: -25, y: -30 } :
            state === "peeking" ? { rotate: 20, x: -10, y: -10 } :
            state === "celebrating" ? { rotate: 30, x: -10, y: -40 } :
            { rotate: 0, x: 0, y: 0 }
          }
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{ originX: "155px", originY: "170px" }}
        >
          {/* Upper arm */}
          <ellipse cx="155" cy="170" rx="18" ry="12" fill="url(#shirtGradient)" />
          {/* Forearm */}
          <ellipse cx="170" cy="160" rx="15" ry="10" fill="url(#shirtGradient)" />
          {/* Hand */}
          <circle cx="182" cy="150" r="14" fill="url(#handGradient)" stroke="#e8c4b8" strokeWidth="1" />
          {/* Fingers */}
          <ellipse cx="192" cy="140" rx="5" ry="8" fill="url(#handGradient)" />
          <ellipse cx="185" cy="135" rx="4" ry="9" fill="url(#handGradient)" />
          <ellipse cx="178" cy="134" rx="4" ry="9" fill="url(#handGradient)" />
          <ellipse cx="171" cy="137" rx="4" ry="8" fill="url(#handGradient)" />
          <ellipse cx="170" cy="152" rx="6" ry="5" fill="url(#handGradient)" />
        </motion.g>

        {/* === FACE SECTION === */}
        
        {/* Hair - Back */}
        <ellipse cx="100" cy="55" rx="45" ry="38" fill="url(#hairGradient)" />

        {/* Face */}
        <ellipse cx="100" cy="85" rx="42" ry="48" fill="url(#skinGradient)" />

        {/* Hair - Front/Bangs */}
        <path
          d="M58 65 Q62 42 75 38 Q88 34 100 36 Q112 34 125 38 Q138 42 142 65
             Q138 55 125 50 Q112 46 100 48 Q88 46 75 50 Q62 55 58 65"
          fill="url(#hairGradient)"
        />

        {/* Ears */}
        <ellipse cx="56" cy="85" rx="6" ry="10" fill="url(#skinGradient)" />
        <ellipse cx="144" cy="85" rx="6" ry="10" fill="url(#skinGradient)" />

        {/* === EYEBROWS === */}
        <AnimatePresence mode="wait">
          {/* Normal/Idle eyebrows */}
          {(state === "idle" || state === "celebrating") && (
            <motion.g
              key="eyebrows-normal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <path d="M72 72 Q80 68 88 72" stroke="#5d4e37" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M112 72 Q120 68 128 72" stroke="#5d4e37" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </motion.g>
          )}

          {/* Thinking eyebrows - raised */}
          {state === "thinking" && (
            <motion.g
              key="eyebrows-thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.path 
                d="M72 68 Q80 62 88 68" 
                stroke="#5d4e37" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                fill="none"
                animate={{ d: ["M72 68 Q80 62 88 68", "M72 66 Q80 60 88 66", "M72 68 Q80 62 88 68"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <path d="M112 70 Q120 66 128 70" stroke="#5d4e37" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </motion.g>
          )}

          {/* Peeking eyebrows - surprised */}
          {state === "peeking" && (
            <motion.g
              key="eyebrows-peeking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <path d="M112 65 Q120 58 128 65" stroke="#5d4e37" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* === EYES === */}
        <AnimatePresence mode="wait">
          {/* Normal open eyes */}
          {(state === "idle" || state === "celebrating") && (
            <motion.g
              key="eyes-open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Left Eye */}
              <ellipse cx="80" cy="85" rx="10" ry="12" fill="white" stroke="#333" strokeWidth="1.5" />
              <motion.circle 
                cx="82" cy="87" r="6" fill="#4a3728"
                animate={state === "celebrating" ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
              <circle cx="83" cy="85" r="3" fill="#1a1a1a" />
              <circle cx="85" cy="83" r="2" fill="white" />

              {/* Right Eye */}
              <ellipse cx="120" cy="85" rx="10" ry="12" fill="white" stroke="#333" strokeWidth="1.5" />
              <motion.circle 
                cx="122" cy="87" r="6" fill="#4a3728"
                animate={state === "celebrating" ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
              />
              <circle cx="123" cy="85" r="3" fill="#1a1a1a" />
              <circle cx="125" cy="83" r="2" fill="white" />
            </motion.g>
          )}

          {/* Thinking eyes - looking up */}
          {state === "thinking" && (
            <motion.g
              key="eyes-thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Left Eye - looking up */}
              <ellipse cx="80" cy="85" rx="10" ry="12" fill="white" stroke="#333" strokeWidth="1.5" />
              <motion.circle 
                cx="80" cy="82" r="6" fill="#4a3728"
                animate={{ cy: [82, 80, 82], cx: [80, 82, 80] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <circle cx="81" cy="80" r="3" fill="#1a1a1a" />
              <circle cx="83" cy="78" r="2" fill="white" />

              {/* Right Eye - looking up */}
              <ellipse cx="120" cy="85" rx="10" ry="12" fill="white" stroke="#333" strokeWidth="1.5" />
              <motion.circle 
                cx="120" cy="82" r="6" fill="#4a3728"
                animate={{ cy: [82, 80, 82], cx: [120, 122, 120] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              />
              <circle cx="121" cy="80" r="3" fill="#1a1a1a" />
              <circle cx="123" cy="78" r="2" fill="white" />
            </motion.g>
          )}

          {/* Covering eyes - both closed */}
          {state === "covering" && (
            <motion.g
              key="eyes-closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <path d="M68 85 Q80 92 92 85" stroke="#333" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M108 85 Q120 92 132 85" stroke="#333" strokeWidth="3" strokeLinecap="round" fill="none" />
            </motion.g>
          )}

          {/* Peeking - one eye visible 🫣 */}
          {state === "peeking" && (
            <motion.g
              key="eyes-peeking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Left Eye - covered/closed */}
              <path d="M68 85 Q80 92 92 85" stroke="#333" strokeWidth="3" strokeLinecap="round" fill="none" />
              
              {/* Right Eye - peeking wide open! */}
              <ellipse cx="120" cy="85" rx="12" ry="14" fill="white" stroke="#333" strokeWidth="1.5" />
              <motion.circle 
                cx="122" cy="87" r="7" fill="#4a3728"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <circle cx="124" cy="85" r="4" fill="#1a1a1a" />
              <circle cx="127" cy="82" r="2.5" fill="white" />
              <circle cx="120" cy="90" r="1.5" fill="white" opacity="0.6" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Blush cheeks */}
        <ellipse cx="62" cy="98" rx="10" ry="6" fill="url(#blushGradient)" />
        <ellipse cx="138" cy="98" rx="10" ry="6" fill="url(#blushGradient)" />

        {/* Nose */}
        <ellipse cx="100" cy="100" rx="4" ry="3" fill="#f0a89a" />

        {/* === MOUTH === */}
        <AnimatePresence mode="wait">
          {/* Normal smile */}
          {state === "idle" && (
            <motion.path
              key="mouth-idle"
              d="M88 112 Q100 122 112 112"
              stroke="#e07060"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}

          {/* Thinking mouth - small, thoughtful */}
          {state === "thinking" && (
            <motion.g
              key="mouth-thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.path
                d="M95 115 Q100 112 105 115"
                stroke="#e07060"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                animate={{ d: ["M95 115 Q100 112 105 115", "M95 113 Q100 116 105 113", "M95 115 Q100 112 105 115"] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.g>
          )}

          {/* Covering mouth - worried */}
          {state === "covering" && (
            <motion.path
              key="mouth-covering"
              d="M92 115 Q100 118 108 115"
              stroke="#e07060"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}

          {/* Peeking mouth - surprised O */}
          {state === "peeking" && (
            <motion.ellipse
              key="mouth-peeking"
              cx="100"
              cy="115"
              rx="7"
              ry="9"
              fill="#ff8a80"
              stroke="#e07060"
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            />
          )}

          {/* Celebrating mouth - big happy smile */}
          {state === "celebrating" && (
            <motion.g
              key="mouth-celebrating"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <path
                d="M82 108 Q100 130 118 108"
                stroke="#e07060"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="#ff8a80"
              />
              {/* Tongue */}
              <ellipse cx="100" cy="118" rx="8" ry="5" fill="#ff6b6b" />
              {/* Teeth hint */}
              <path d="M88 108 L112 108" stroke="white" strokeWidth="3" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Hand covering left side of face for peeking */}
        <AnimatePresence>
          {state === "peeking" && (
            <motion.g
              key="peek-hand"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Hand covering left eye area */}
              <ellipse cx="70" cy="88" rx="22" ry="28" fill="url(#handGradient)" stroke="#e8c4b8" strokeWidth="1" />
              {/* Finger gaps to peek through */}
              <ellipse cx="55" cy="70" rx="7" ry="14" fill="url(#handGradient)" />
              <ellipse cx="65" cy="62" rx="6" ry="16" fill="url(#handGradient)" />
              <ellipse cx="76" cy="58" rx="6" ry="18" fill="url(#handGradient)" />
              <ellipse cx="87" cy="62" rx="6" ry="16" fill="url(#handGradient)" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Hands covering both eyes for covering state */}
        <AnimatePresence>
          {state === "covering" && (
            <motion.g
              key="cover-hands"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Left hand */}
              <motion.g
                initial={{ x: -40, y: 30 }}
                animate={{ x: 0, y: 0 }}
                exit={{ x: -40, y: 30 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <ellipse cx="70" cy="88" rx="22" ry="25" fill="url(#handGradient)" stroke="#e8c4b8" strokeWidth="1" />
                <ellipse cx="52" cy="72" rx="7" ry="14" fill="url(#handGradient)" />
                <ellipse cx="62" cy="64" rx="6" ry="16" fill="url(#handGradient)" />
                <ellipse cx="74" cy="60" rx="6" ry="18" fill="url(#handGradient)" />
                <ellipse cx="86" cy="64" rx="6" ry="16" fill="url(#handGradient)" />
              </motion.g>
              {/* Right hand */}
              <motion.g
                initial={{ x: 40, y: 30 }}
                animate={{ x: 0, y: 0 }}
                exit={{ x: 40, y: 30 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <ellipse cx="130" cy="88" rx="22" ry="25" fill="url(#handGradient)" stroke="#e8c4b8" strokeWidth="1" />
                <ellipse cx="148" cy="72" rx="7" ry="14" fill="url(#handGradient)" />
                <ellipse cx="138" cy="64" rx="6" ry="16" fill="url(#handGradient)" />
                <ellipse cx="126" cy="60" rx="6" ry="18" fill="url(#handGradient)" />
                <ellipse cx="114" cy="64" rx="6" ry="16" fill="url(#handGradient)" />
              </motion.g>
            </motion.g>
          )}
        </AnimatePresence>

        {/* Thinking hand on chin 🤔 */}
        <AnimatePresence>
          {state === "thinking" && (
            <motion.g
              key="thinking-hand"
              initial={{ x: 30, y: 30, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              exit={{ x: 30, y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Hand on chin */}
              <ellipse cx="130" cy="115" rx="18" ry="15" fill="url(#handGradient)" stroke="#e8c4b8" strokeWidth="1" />
              {/* Finger pointing up along cheek */}
              <ellipse cx="138" cy="95" rx="5" ry="15" fill="url(#handGradient)" />
              {/* Other fingers curled */}
              <ellipse cx="120" cy="108" rx="6" ry="8" fill="url(#handGradient)" />
              <ellipse cx="125" cy="105" rx="5" ry="9" fill="url(#handGradient)" />
            </motion.g>
          )}
        </AnimatePresence>

        {/* Sparkles/stars for celebrating */}
        <AnimatePresence>
          {state === "celebrating" && (
            <g className="celebrate-sparkles">
              <motion.text
                x="35"
                y="50"
                fontSize="18"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                🎉
              </motion.text>
              <motion.text
                x="150"
                y="45"
                fontSize="16"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
              >
                ✨
              </motion.text>
              <motion.text
                x="25"
                y="140"
                fontSize="14"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              >
                🎊
              </motion.text>
              <motion.text
                x="165"
                y="135"
                fontSize="14"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
              >
                ⭐
              </motion.text>
            </g>
          )}
        </AnimatePresence>

      </motion.svg>
    </div>
  );
};

export default LoginMascot;