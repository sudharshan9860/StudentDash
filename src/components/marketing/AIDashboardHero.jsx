import { motion } from 'framer-motion'

const features = [
  { icon: '&#x1F9E0;', label: 'AI Exam Correction', desc: 'Upload answer sheets, get instant AI-graded results with detailed feedback', color: '#818cf8' },
  { icon: '&#x1F4CA;', label: 'Gap Analysis', desc: 'Pinpoints exact weak topics per student — no more guessing where they struggle', color: '#a78bfa' },
  { icon: '&#x1F4AC;', label: '24/7 AI Chatbot', desc: 'Students ask doubts anytime, get step-by-step solutions instantly', color: '#c084fc' },
  { icon: '&#x1F3AF;', label: 'Personalized Learning Path', desc: 'AI builds a custom study plan based on each student\'s weak areas', color: '#e879f9' },
  { icon: '&#x1F4D6;', label: 'Smart Question Papers', desc: 'Auto-generate chapter-wise or full-length tests in seconds', color: '#f472b6' },
]

const stats = [
  { value: '50K+', label: 'Students', color: '#818cf8' },
  { value: '200+', label: 'Schools', color: '#a78bfa' },
  { value: '95%', label: 'Accuracy', color: '#c084fc' },
  { value: '2M+', label: 'Questions Solved', color: '#e879f9' },
]

export default function AIDashboardHero() {
  return (
    <div className="relative py-16 md:py-24 overflow-hidden">
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Center radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-radial rounded-full opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.15), rgba(139,92,246,0.08) 40%, transparent 70%)' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="glass-pill text-indigo-600 mb-4 inline-flex">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Powered by AI Agents
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4">
            See the <span className="gradient-text">Intelligence</span> Behind the Platform
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">Our AI agents reason, retrieve context, and execute — all in real-time to personalize every student&apos;s learning path.</p>
        </motion.div>

        <div className="relative flex justify-center">
          {/* === Glassmorphism Outer Container === */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.92 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-4xl relative"
          >
            {/* Large glow behind outer container */}
            <div className="absolute -inset-6 bg-gradient-to-br from-indigo-500/15 via-purple-500/15 to-pink-500/10 rounded-[32px] blur-3xl opacity-70" />

            {/* Glassmorphism wrapper */}
            <div
              className="relative rounded-[28px] p-5 md:p-8"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(20px) saturate(1.3)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 16px 64px rgba(99, 102, 241, 0.08), 0 4px 16px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 0 80px rgba(99, 102, 241, 0.03)',
              }}
            >
              {/* Rainbow top-edge border */}
              <div className="absolute top-0 left-8 right-8 h-[2px] rounded-full bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

              {/* === Upper-left status pill === */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-4 md:mb-5"
              >
                <div
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold tracking-wide"
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15), 0 0 12px rgba(99,102,241,0.1)',
                  }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                  </span>
                  <span className="text-emerald-400">Live</span>
                  <span className="w-px h-3 bg-slate-600" />
                  <span className="text-slate-300">AI Engine Active</span>
                  <span className="w-px h-3 bg-slate-600" />
                  <span className="text-indigo-400">3 agents running</span>
                </div>
              </motion.div>

              {/* === Main Code Window (inside glass container) === */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="relative"
              >
                {/* Inner glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-80" />

                <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#0f172a' }}>
                  {/* macOS title bar */}
                  <div className="flex items-center px-5 py-3.5 border-b border-white/5">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/30" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/30" />
                      <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/30" />
                    </div>
                    <span className="flex-1 text-center text-xs font-medium text-slate-400 tracking-wide">SmartLearners.ai — AI Dashboard</span>
                    <div className="w-14" />
                  </div>

                  {/* Dashboard content */}
                  <div className="p-5">
                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-3 mb-5">
                      {stats.map((s, i) => (
                        <motion.div
                          key={s.label}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 * i, duration: 0.4 }}
                          className="rounded-xl p-3 text-center"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <div className="text-xl md:text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                          <div className="text-[10px] text-slate-400 mt-1 font-medium tracking-wide uppercase">{s.label}</div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Feature list */}
                    <div className="space-y-2.5">
                      {features.map((f, i) => (
                        <motion.div
                          key={f.label}
                          initial={{ opacity: 0, x: -15 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.08 * i + 0.3, duration: 0.35 }}
                          className="flex items-start gap-3 rounded-xl p-3 transition-colors"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                        >
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 mt-0.5"
                            style={{ background: `${f.color}18` }}
                            dangerouslySetInnerHTML={{ __html: f.icon }}
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white">{f.label}</div>
                            <div className="text-xs text-slate-400 leading-relaxed mt-0.5">{f.desc}</div>
                          </div>
                          <div className="shrink-0 ml-auto self-center">
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: f.color, boxShadow: `0 0 8px ${f.color}60` }} />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Bottom bar inside dark window */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <span className="text-[11px] text-slate-400">All features powered by <span className="text-indigo-400 font-semibold">Agentic AI</span></span>
                      </div>
                      <span className="text-[10px] text-slate-500 tracking-wider uppercase">CBSE &bull; Class 6-12</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Bottom bar inside glass container */}
              <div className="flex items-center justify-between mt-4 md:mt-5 px-1">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 border-2 border-white/80 shadow-sm" />
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 border-2 border-white/80 shadow-sm" />
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 border-2 border-white/80 shadow-sm" />
                  </div>
                  <span className="text-[11px] text-gray-500 font-medium">3 AI agents collaborating</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Latency: 42ms</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* === Left Floating Card — Vector DB === */}
          <motion.div
            initial={{ opacity: 0, x: -40, y: 20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="absolute -left-4 md:left-0 lg:-left-16 top-1/4 z-20 hidden md:block"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="glass-card-dark p-4 w-52"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-base">&#x1F4DD;</div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">Exam Corrected</p>
                  <p className="text-sm font-semibold text-white">Maths — Class 10</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/40 animate-pulse" />
                <span className="text-[11px] text-emerald-400 font-medium">42 sheets graded in 3 min</span>
              </div>
            </motion.div>
          </motion.div>

          {/* === Right Floating Card — Agent Response === */}
          <motion.div
            initial={{ opacity: 0, x: 40, y: 20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="absolute -right-4 md:right-0 lg:-right-16 top-[45%] z-20 hidden md:block"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="glass-card-dark p-4 w-64"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-base">&#x1F393;</div>
                <p className="text-sm font-semibold text-white">Student Report</p>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generating personalized learning path for Rahul — Weak in Trigonometry, Quadratics...
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                  initial={{ width: '0%' }}
                  whileInView={{ width: '75%' }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2, duration: 1.5, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* === Bottom Pill — System Status === */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="glass-pill-dark px-5 py-2 flex items-center gap-2 rounded-full text-xs font-semibold tracking-wide shadow-lg shadow-black/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/40 animate-pulse" />
              <span className="text-slate-300">System Online</span>
              <span className="text-indigo-400">v2.4.0</span>
            </div>
          </motion.div>

          {/* === Top-right mini card — Thinking === */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="absolute -right-2 md:right-8 lg:-right-8 top-8 z-20 hidden md:block"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="glass-pill-dark px-3 py-1.5 text-[11px] font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                <span className="text-yellow-300">Reasoning...</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
