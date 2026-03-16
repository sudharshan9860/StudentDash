import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

const features = [
  { icon: '\uD83E\uDDE0', label: 'AI Exam Correction', desc: 'Upload answer sheets, get instant AI-graded results with detailed feedback', color: '#00A0E3' },
  { icon: '\uD83D\uDCCA', label: 'Gap Analysis', desc: 'Pinpoints exact weak topics per student -- no more guessing where they struggle', color: '#0080B8' },
  { icon: '\uD83D\uDCAC', label: '24/7 AI Chatbot', desc: 'Students ask doubts anytime, get step-by-step solutions instantly', color: '#00A0E3' },
  { icon: '\uD83C\uDFAF', label: 'Personalized Learning Path', desc: 'AI builds a custom study plan based on each student\'s weak areas', color: '#0080B8' },
  { icon: '\uD83D\uDCD6', label: 'Smart Question Papers', desc: 'Auto-generate chapter-wise or full-length tests in seconds', color: '#00A0E3' },
]

const stats = [
  { value: '50K+', label: 'Students', color: '#00A0E3' },
  { value: '200+', label: 'Schools', color: '#0080B8' },
  { value: '95%', label: 'Accuracy', color: '#00A0E3' },
  { value: '2M+', label: 'Questions Solved', color: '#0080B8' },
]

export default function AIDashboardHero() {
  return (
    <div className="relative py-16 md:py-24 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,160,227,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,160,227,1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(0,160,227,0.15), rgba(0,128,184,0.08) 40%, transparent 70%)' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-[#00A0E3] bg-[#00A0E3]/10 border border-[#00A0E3]/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#00A0E3] animate-pulse" />
            Powered by AI Agents
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0B1120] mt-4">
            See the <span className="text-[#00A0E3]">Intelligence</span> Behind the Platform
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">Our AI agents reason, retrieve context, and execute -- all in real-time to personalize every student&apos;s learning path.</p>
        </motion.div>

        <div className="relative flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.92 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-4xl relative"
          >
            <div className="absolute -inset-6 bg-gradient-to-br from-[#00A0E3]/15 via-[#0080B8]/10 to-transparent rounded-[32px] blur-3xl opacity-70" />

            <div
              className="relative rounded-[28px] p-5 md:p-8 bg-white/80 backdrop-blur-xl border border-gray-200 shadow-xl"
            >
              <div className="absolute top-0 left-8 right-8 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#00A0E3]/40 to-transparent" />

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-4 md:mb-5"
              >
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold tracking-wide bg-[#0B1120] border border-[#00A0E3]/25">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="text-emerald-400">Live</span>
                  <span className="w-px h-3 bg-gray-600" />
                  <span className="text-gray-300">AI Engine Active</span>
                  <span className="w-px h-3 bg-gray-600" />
                  <span className="text-[#00A0E3]">3 agents running</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="relative"
              >
                <div className="absolute -inset-2 bg-[#00A0E3]/5 rounded-2xl blur-xl opacity-80" />

                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-[#0B1120]">
                  <div className="flex items-center px-5 py-3.5 border-b border-white/5">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="flex-1 text-center text-xs font-medium text-gray-400 tracking-wide">SmartLearners.ai -- AI Dashboard</span>
                    <div className="w-14" />
                  </div>

                  <div className="p-5">
                    <div className="grid grid-cols-4 gap-3 mb-5">
                      {stats.map((s, i) => (
                        <motion.div
                          key={s.label}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 * i, duration: 0.4 }}
                          className="rounded-xl p-3 text-center bg-white/[0.04] border border-white/[0.06]"
                        >
                          <div className="text-xl md:text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                          <div className="text-[10px] text-gray-400 mt-1 font-medium tracking-wide uppercase">{s.label}</div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="space-y-2.5">
                      {features.map((f, i) => (
                        <motion.div
                          key={f.label}
                          initial={{ opacity: 0, x: -15 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.08 * i + 0.3, duration: 0.35 }}
                          className="flex items-start gap-3 rounded-xl p-3 bg-white/[0.03] border border-white/[0.05]"
                        >
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 mt-0.5"
                            style={{ background: `${f.color}18` }}
                          >
                            {f.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white">{f.label}</div>
                            <div className="text-xs text-gray-400 leading-relaxed mt-0.5">{f.desc}</div>
                          </div>
                          <div className="shrink-0 ml-auto self-center">
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: f.color, boxShadow: `0 0 8px ${f.color}60` }} />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#00A0E3] to-[#0080B8] flex items-center justify-center">
                          <Zap className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[11px] text-gray-400">All features powered by <span className="text-[#00A0E3] font-semibold">Agentic AI</span></span>
                      </div>
                      <span className="text-[10px] text-gray-500 tracking-wider uppercase">CBSE &bull; Class 6-12</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="flex items-center justify-between mt-4 md:mt-5 px-1">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1.5">
                    <div className="w-6 h-6 rounded-full bg-[#00A0E3] border-2 border-white shadow-sm" />
                    <div className="w-6 h-6 rounded-full bg-[#0080B8] border-2 border-white shadow-sm" />
                    <div className="w-6 h-6 rounded-full bg-[#0B1120] border-2 border-white shadow-sm" />
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

          {/* Left Floating Card */}
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
              className="p-4 w-52 bg-[#0B1120]/90 backdrop-blur-xl border border-[#00A0E3]/20 rounded-2xl shadow-xl text-white"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#00A0E3]/20 flex items-center justify-center text-base">{'\uD83D\uDCDD'}</div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-[#00A0E3] uppercase">Exam Corrected</p>
                  <p className="text-sm font-semibold text-white">Maths -- Class 10</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-emerald-400 font-medium">42 sheets graded in 3 min</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Floating Card */}
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
              className="p-4 w-64 bg-[#0B1120]/90 backdrop-blur-xl border border-[#00A0E3]/20 rounded-2xl shadow-xl text-white"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#0080B8]/20 flex items-center justify-center text-base">{'\uD83C\uDF93'}</div>
                <p className="text-sm font-semibold text-white">Student Report</p>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Generating personalized learning path for Rahul -- Weak in Trigonometry, Quadratics...
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-gray-700 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#00A0E3] to-[#0080B8]"
                  initial={{ width: '0%' }}
                  whileInView={{ width: '75%' }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2, duration: 1.5, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="px-5 py-2 flex items-center gap-2 rounded-full text-xs font-semibold tracking-wide shadow-lg bg-[#0B1120]/90 backdrop-blur-xl border border-[#00A0E3]/20 text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-gray-300">System Online</span>
              <span className="text-[#00A0E3]">v2.4.0</span>
            </div>
          </motion.div>

          {/* Top-right mini card */}
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
              <div className="px-3 py-1.5 text-[11px] font-semibold flex items-center gap-2 bg-[#0B1120]/90 backdrop-blur-xl border border-[#00A0E3]/20 rounded-full text-white">
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
