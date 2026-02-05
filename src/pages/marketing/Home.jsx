import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserType } from '../../contexts/UserTypeContext'
import UserTypeSelection from '../../components/marketing/UserTypeSelection'
import { FaTimes, FaPlay } from 'react-icons/fa'

// The Real Problem - Parent Pain Points
const realProblems = [
  { icon: 'X', text: 'Studies 3 hours daily - Still makes same errors' },
  { icon: 'X', text: 'Expensive tuitions - No clarity on weak areas' },
  { icon: 'X', text: "Parents don't know - Where exactly child is struggling" },
  { icon: 'X', text: 'Board exams coming - Rising panic, no plan' },
]

// What Parents Get - WhatsApp Updates
const whatsappFeatures = [
  'Chapter-wise performance weekly',
  'Exact weak concepts identified',
  'Exam readiness score (60%? 90%?)',
]

// Traditional vs SmartLearners comparison
const comparisonData = {
  traditional: {
    features: [
      'Same mistakes again & again',
      "Parents don't know what's wrong",
      'Doubts stay unsolved',
      'Exam panic, no plan',
    ],
    result: 'Stress, low marks, frustration'
  },
  smart: {
    features: [
      'AI finds & fixes every mistake',
      'WhatsApp updates daily to parents',
      'Ask AI 24/7, instant answers',
      '7-day exam guide = Full confidence',
    ],
    result: 'Better marks, happy learning!'
  }
}

// 7-Day Exam Guide
const examGuide = [
  { day: 'Day 1', task: 'AI tests weak chapters' },
  { day: 'Day 2-5', task: 'Daily remedial plan (30 mins)' },
  { day: 'Day 6', task: 'Confidence practice' },
  { day: 'Day 7', task: 'Full revision + exam tips' },
]

// Parent Testimonials
const parentTestimonials = [
  {
    name: 'Mr. Patel',
    location: 'Bangalore',
    quote: 'Finally could see WHERE she was making mistakes.',
    result: 'Priya: 62% - 87% in Math (2 months)'
  },
  {
    name: 'Mrs. Reddy',
    location: 'Hyderabad',
    quote: '7-day plan gave him clarity. Confidence changed everything.',
    result: 'Arjun stopped exam panic'
  },
]


const testimonials = [
  { quote: "SmartLearners.ai transformed how I study. The AI tutor helped me improve my math scores by 40%!", name: 'Priya Sharma', role: 'Class 12 Student, Delhi' },
  { quote: "The analytics dashboard gives me insights I never had before. It's a game-changer for our institution.", name: 'Rajesh Kumar', role: 'Teacher, Hyderabad' },
  { quote: "My daughter loves the gamified approach. She actually asks to study now!", name: 'Anita Desai', role: 'Parent' },
]

export default function Home() {
  const { userType } = useUserType()
  const [showVideoModal, setShowVideoModal] = useState(false)

  // Determine content based on user type
  const isParent = userType === 'parent'
  const isSchool = userType === 'school'

  return (
    <div className="overflow-hidden bg-white">
      {/* ========== FLOATING BACKGROUND ========== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
        <div className="absolute rounded-full" style={{ width: 400, height: 400, background: '#e8f0fe', top: '10%', left: '-10%', filter: 'blur(80px)', opacity: 0.6 }} />
        <div className="absolute rounded-full" style={{ width: 300, height: 300, background: '#fce8f4', top: '60%', right: '-5%', filter: 'blur(80px)', opacity: 0.6 }} />
        <div className="absolute rounded-full" style={{ width: 250, height: 250, background: '#e6f4ea', bottom: '10%', left: '30%', filter: 'blur(80px)', opacity: 0.6 }} />
      </div>

      {/* ========== HERO SECTION ========== */}
      <section className="relative pt-20 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {isParent ? (
              <>
                {/* Parent View Hero */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="badge badge-primary mb-8">
                  AI-Powered Learning for Class 6-12
                </motion.div>

                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
                  Your Child Studies Hard.<br />
                  <span className="gradient-text">Why Aren&apos;t the Marks Improving?</span>
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
                  Because the <span className="text-red-600 font-semibold">same mistakes keep repeating</span>.
                </motion.p>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="text-lg text-gray-500 mb-6 max-w-2xl mx-auto">
                  Your child doesn&apos;t see them. Teachers don&apos;t catch them.<br />
                  <span className="text-blue-600 font-semibold">SmartLearners.ai does.</span>
                </motion.p>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-lg text-gray-700 mb-10 max-w-2xl mx-auto">
                  AI finds the exact mistake, explains why it&apos;s wrong, and makes sure it <span className="text-green-600 font-semibold">never happens again</span>.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="flex flex-wrap justify-center gap-4 mb-8">
                  <Link to="/free-trial" className="button button--mimas text-lg px-8 py-4"><span>Start Free Trial - 1 Week</span></Link>
                  <button onClick={() => setShowVideoModal(true)} className="btn-secondary text-lg px-8 py-4 flex items-center gap-2"><FaPlay className="text-sm" /> Watch Demo</button>
                </motion.div>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-sm text-gray-500">
                  No credit card needed - CBSE Class 6-12 (All subjects) - 15-day money-back guarantee
                </motion.p>
              </>
            ) : isSchool ? (
              <>
                {/* School View Hero */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="badge badge-primary mb-8">
                  AI-Powered Platform for Schools
                </motion.div>

                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
                  Know Every Student&apos;s<br />
                  <span className="gradient-text">Weak Points Instantly</span>
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
                  AI analyzes exams and shows you exactly where each student needs help.
                </motion.p>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="text-lg text-gray-700 mb-10 max-w-2xl mx-auto">
                  Better results. Less guesswork. Happy parents.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-4 mb-8">
                  <Link to="/schools" className="button button--mimas text-lg px-8 py-4"><span>See School Plans</span></Link>
                  <button onClick={() => setShowVideoModal(true)} className="btn-secondary text-lg px-8 py-4 flex items-center gap-2"><FaPlay className="text-sm" /> Watch Demo</button>
                </motion.div>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-sm text-gray-500">
                  Used by 100+ schools - Easy setup - Full support
                </motion.p>
              </>
            ) : (
              <>
                {/* Default Hero - Main landing page */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="badge badge-primary mb-2">
                  AI-Powered Learning Platform for Class 6-12
                </motion.div>

                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 text-gray-900 leading-tight">
                  NO.1 Agentic AI <span className="gradient-text">All-in-One Educational Platform</span>
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-base text-gray-600 mb-4 max-w-2xl mx-auto">
                  Personalized <span className="text-blue-600 font-bold">CBSE</span> & <span className="text-purple-600 font-bold">JEE FOUNDATION</span> courses for Class 6-12.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-3 mb-2">
                  <Link to="/free-trial" className="button button--mimas px-6 py-3"><span>Start Free Trial</span></Link>
                  <button onClick={() => setShowVideoModal(true)} className="btn-secondary px-6 py-3 flex items-center gap-2"><FaPlay className="text-xs" /> Watch Demo</button>
                </motion.div>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-xs text-gray-500">
                  No credit card needed - CBSE Class 6-12 (All subjects) - 15-day money-back guarantee
                </motion.p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ========== USER TYPE SELECTION ========== */}
      {!userType && <UserTypeSelection />}

      {/* ========== CONTENT SECTIONS - Only show after user type is selected ========== */}
      {userType && (
        <>
          {/* ========== STATS BAR ========== */}
          <section className="py-12 bg-gradient-to-r from-blue-50 to-purple-50 border-y border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap justify-center gap-16 md:gap-24 lg:gap-32">
                {isParent ? (
                  <>
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">500+</div>
                      <div className="text-gray-600 text-sm">Active Students</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">95%</div>
                      <div className="text-gray-600 text-sm">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">24/7</div>
                      <div className="text-gray-600 text-sm">AI Tutor Available</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">10+ hrs</div>
                      <div className="text-gray-600 text-sm">Time Saved per Exam</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">99%</div>
                      <div className="text-gray-600 text-sm">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">200+</div>
                      <div className="text-gray-600 text-sm">Partner Schools</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* ========== FEATURES/BENEFITS SECTION ========== */}
          <section className="py-20 md:py-28 bg-white" id="features">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {isParent ? (
                <>
                  {/* THE REAL PROBLEM Section */}
                  <div className="mb-16">
                    <div className="text-center mb-10">
                      <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                        THE <span className="text-red-600">REAL PROBLEM</span>
                      </h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
                      {realProblems.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                          <span className="text-xl text-red-600">{item.icon}</span>
                          <span className="text-gray-700">{item.text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-center">
                      <p className="text-xl text-blue-600 font-semibold">SmartLearners.ai solves all of this.</p>
                    </div>
                  </div>

                  {/* TRADITIONAL vs SMARTLEARNERS Comparison */}
                  <div className="mb-16">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Traditional <span className="text-red-600">vs</span> <span className="gradient-text">SmartLearners.ai</span>
                      </h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                      {/* Traditional Card */}
                      <div className="glass-card p-6 border-l-4 border-l-red-500">
                        <div className="text-center mb-4">
                          <span className="inline-block px-4 py-2 rounded-full bg-red-50 text-red-600 font-bold border border-red-200">Traditional Learning</span>
                        </div>
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 mb-4">
                          <span className="text-red-600 font-bold">Result: </span>
                          <span className="text-red-700 font-medium">{comparisonData.traditional.result}</span>
                        </div>
                        <div className="space-y-2">
                          {comparisonData.traditional.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-red-50/50">
                              <span className="text-red-600 text-sm">X</span>
                              <span className="text-gray-600 text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SmartLearners Card */}
                      <div className="glass-card p-6 border-l-4 border-l-green-500">
                        <div className="text-center mb-4">
                          <span className="inline-block px-4 py-2 rounded-full bg-green-50 text-green-600 font-bold border border-green-200">SmartLearners.ai</span>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 mb-4">
                          <span className="text-green-600 font-bold">Result: </span>
                          <span className="text-green-700">{comparisonData.smart.result}</span>
                        </div>
                        <div className="space-y-2">
                          {comparisonData.smart.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-green-50/50">
                              <span className="text-green-600 text-sm">&#10003;</span>
                              <span className="text-gray-700 text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HOW IT WORKS - 3 Steps */}
                  <div className="mb-16">
                    <div className="text-center mb-10">
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        HOW IT <span className="gradient-text">WORKS</span>
                      </h2>
                      <p className="text-gray-600">3 Simple Steps</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                      {[
                        { step: '1', title: 'Child practices', desc: 'Solves questions, writes answers', icon: '1' },
                        { step: '2', title: 'AI finds mistakes', desc: 'Shows exact wrong line + concept gap', icon: '2' },
                        { step: '3', title: 'Learn & improve', desc: 'Step-by-step correction + concept clarity', icon: '3' },
                      ].map((item, index) => (
                        <div key={index} className="glass-card p-6 text-center">
                          <div className="w-16 h-16 mx-auto rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white mb-4">
                            {item.icon}
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                          <p className="text-gray-600 text-sm">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                    <div className="text-center">
                      <p className="text-gray-700">Parents get WhatsApp update automatically.</p>
                    </div>
                  </div>

                  {/* EXAM WEEK - 7-Day Guide */}
                  <div className="mb-16">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        EXAM WEEK? <span className="gradient-text">NO PANIC.</span>
                      </h2>
                      <p className="text-gray-600">7-Day Exam Guide</p>
                    </div>
                    <div className="glass-card p-6 max-w-3xl mx-auto">
                      <div className="space-y-3 mb-6">
                        {examGuide.map((item, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                            <span className="text-blue-600 font-bold min-w-[80px]">{item.day}</span>
                            <span className="text-gray-900">{item.task}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-center p-4 rounded-xl bg-green-50 border border-green-200">
                        <p className="text-green-600 font-bold">Result: Confidence 60% to 99%</p>
                        <p className="text-gray-600 text-sm mt-1">Parents get daily WhatsApp updates.</p>
                      </div>
                    </div>
                  </div>

                  {/* REAL RESULTS - Testimonials */}
                  <div className="mb-16">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        <span className="gradient-text">REAL RESULTS</span>
                      </h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                      {parentTestimonials.map((t, index) => (
                        <div key={index} className="glass-card p-6">
                          <div className="text-green-600 font-bold mb-3">&quot;{t.result}&quot;</div>
                          <p className="text-gray-700 italic mb-4">&quot;{t.quote}&quot;</p>
                          <p className="text-gray-500 text-sm">- {t.name}, {t.location}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* WHAT YOUR CHILD GETS - Student Benefits */}
                  <div className="mb-16">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        What Your Child <span className="gradient-text">Gets</span>
                      </h2>
                      <p className="text-gray-600">Everything they need to succeed</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      {[
                        { icon: '&#x1F4DD;', title: 'AI Solutions', desc: 'Step-by-step perfect answers for every question' },
                        { icon: '&#x1F4A1;', title: 'Concept Videos', desc: '3-5 min videos that make hard topics easy' },
                        { icon: '&#x1F916;', title: '24/7 AI Chatbot', desc: 'Ask doubts anytime, get instant answers' },
                      ].map((item, index) => (
                        <div key={index} className="glass-card p-5 text-center">
                          <div className="text-3xl mb-3" dangerouslySetInnerHTML={{ __html: item.icon }}></div>
                          <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                          <p className="text-gray-600 text-sm">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                    <div className="text-center mt-6">
                      <Link to="/students" className="text-blue-600 hover:text-blue-700 font-medium">
                        See all 7 features for students
                      </Link>
                    </div>
                  </div>

                  {/* WHAT YOU GET AS A PARENT - WhatsApp Section */}
                  <div className="glass-card p-8 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 mb-16">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-2xl text-white">&#x1F4F1;</div>
                          <span className="text-green-600 font-bold text-lg">Real-Time WhatsApp Updates</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">What You Get as a Parent</h3>
                        <div className="space-y-3 mb-6">
                          {whatsappFeatures.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 text-gray-700">
                              <span className="text-green-600">&#10003;</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 italic">
                          No more guessing. You&apos;ll KNOW exactly where your child stands.
                        </p>
                      </div>
                      <div className="bg-white rounded-2xl p-4 shadow-md">
                        <div className="bg-[#075E54] rounded-t-xl p-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">&#x1F393;</div>
                          <div className="text-white text-sm font-medium">SmartLearners.ai</div>
                        </div>
                        <div className="bg-[#ECE5DD] p-3 rounded-b-xl space-y-2">
                          <div className="bg-white rounded-lg p-3 shadow-sm text-xs">
                            <p className="text-gray-800 font-medium">Example Update</p>
                            <p className="text-gray-600 mt-1">&quot;Arjun practiced 5 questions today. 3 correct. 2 mistakes in Thermodynamics. Remedial plan sent.&quot;</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FINAL MESSAGE FOR PARENTS */}
                  <div className="glass-card p-8 md:p-12 text-center bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Final Message for Parents</h2>
                    <p className="text-gray-700 text-lg mb-4">
                      You invest in school, tuition, and books.<br />
                      But one thing is missing:
                    </p>
                    <div className="max-w-xl mx-auto mb-6 space-y-2 ">
                      <p className="text-gray-700">Someone who tracks <span className="text-blue-600 font-semibold">EVERY mistake</span>.</p>
                      <p className="text-gray-700">Explains <span className="text-blue-600 font-semibold">WHY it happened</span>.</p>
                      <p className="text-gray-700">Makes sure it <span className="text-green-600 font-semibold">NEVER repeats</span>.</p>
                    </div>
                    <p className="text-xl text-gray-900 font-semibold mb-6">That&apos;s SmartLearners.ai.</p>
                    <Link to="/free-trial" className="button button--mimas text-lg px-8 py-4"><span>Start Free Trial Now</span></Link>
                    <p className="text-sm text-gray-500 mt-4">
                      Limited: 500 students per batch (We limit for personalized AI tracking)
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* School View - Features Only */}
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">AI-Powered <span className="gradient-text">Exam Correction</span></h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">Upload exam papers. Get detailed analysis. Find student weak areas.</p>
                  </div>

                  {/* What Teachers Get & How It Helps Schools */}
                  <div className="mb-12">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="glass-card p-8 border-l-4 border-l-purple-500">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center text-3xl">&#x1F469;&#x200D;&#x1F3EB;</div>
                          <h3 className="text-2xl font-bold text-gray-900">What Teachers Get</h3>
                        </div>
                        <ul className="space-y-4 text-gray-700">
                          {['Automatic exam correction', 'Step-wise mistake identification', 'Clear marks for every question', 'Exact step where students lost marks', 'Ready-to-use remedial guidance'].map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="text-purple-600 text-lg">&#10003;</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="glass-card p-8 border-l-4 border-l-pink-500">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center text-3xl">&#x1F4A1;</div>
                          <h3 className="text-2xl font-bold text-gray-900">How It Helps Schools</h3>
                        </div>
                        <ul className="space-y-4 text-gray-700">
                          {['Saves hours of exam correction time', 'Reduces teacher workload significantly', 'Ensures fair and consistent evaluation', 'Delivers clear academic insights', 'Improves overall learning outcomes'].map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="text-pink-600 text-lg">&#10003;</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* School CTA */}
                  <div className="glass-card p-8 md:p-12 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Want to Try Exam Correction?</h2>
                    <p className="text-gray-700 text-lg mb-6">
                      Download a free demo and see how it works for your school
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mb-6">
                      <button onClick={() => setShowVideoModal(true)} className="button button--mimas text-lg px-8 py-4 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #9334e9, #ec4899)' }}><span className="flex items-center gap-2"><FaPlay className="text-sm" /> Watch Demo</span></button>
                      <Link to="/schools" className="btn-secondary text-lg px-8 py-4">See Pricing</Link>
                    </div>
                    <p className="text-sm text-gray-500">
                      Free demo - Easy to use - Works with any exam
                    </p>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ========== TESTIMONIALS ========== */}
          <section className="py-20 md:py-28 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {isParent ? (
                <>
                  {/* Parent Testimonials */}
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Parents <span className="gradient-text">Love Us</span></h2>
                    <p className="text-xl text-gray-600">Join thousands of happy parents</p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      {
                        quote: "My son went from failing to topping his class. The daily WhatsApp reports keep me informed without nagging him!",
                        name: 'Sunita Verma',
                        role: 'Mother of Class 10 Student',
                        improvement: '45% to 88%'
                      },
                      {
                        quote: "Better than Rs.5000/month tuition! My daughter actually understands concepts now. The AI explains things so clearly.",
                        name: 'Rajesh Kumar',
                        role: 'Father of Class 8 Student',
                        improvement: '52% to 85%'
                      },
                      {
                        quote: "Finally, I know what my child is actually studying. The weak area alerts helped us focus on what matters.",
                        name: 'Priya Mehta',
                        role: 'Mother of Class 7 Student',
                        improvement: '60% to 92%'
                      },
                    ].map((t) => (
                      <div key={t.name} className="glass-card p-6 hover-lift bg-white">
                        <div className="flex justify-between items-start mb-4">
                          <div className="text-3xl text-blue-600">&quot;</div>
                          <div className="px-3 py-1 rounded-full bg-green-100 text-green-600 text-sm font-bold border border-green-200">
                            {t.improvement}
                          </div>
                        </div>
                        <p className="text-gray-700 mb-6 italic leading-relaxed">{t.quote}</p>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{t.name}</div>
                            <div className="text-gray-500 text-sm">{t.role}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* School Testimonials */}
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Loved by Learners & Educators</h2>
                    <p className="text-xl text-gray-600">See what our community has to say</p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((t) => (
                      <div key={t.name} className="glass-card p-6 hover-lift bg-white">
                        <div className="text-3xl text-blue-600 mb-4">&quot;</div>
                        <p className="text-gray-700 mb-6 italic leading-relaxed">{t.quote}</p>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{t.name}</div>
                            <div className="text-gray-500 text-sm">{t.role}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* ========== CTA SECTION ========== */}
          <section className="py-20 md:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="cta-gradient p-12 md:p-16 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-40 h-40 bg-blue-200/40 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-200/40 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to Transform Learning?</h2>
                  <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">Join thousands of students and schools already using SmartLearners.ai</p>
                  <div className="flex flex-wrap justify-center gap-4">
                    {isParent ? (
                      <>
                        <Link to="/signup" className="button button--mimas text-lg px-8 py-4"><span>Get Started Free</span></Link>
                        <button onClick={() => setShowVideoModal(true)} className="btn-secondary text-lg px-8 py-4 flex items-center gap-2"><FaPlay className="text-sm" /> Watch Demo</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setShowVideoModal(true)} className="button button--mimas text-lg px-8 py-4 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #9334e9, #ec4899)' }}><span className="flex items-center gap-2"><FaPlay className="text-sm" /> Watch Demo</span></button>
                        <Link to="/schools" className="btn-secondary text-lg px-8 py-4">Learn More</Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ========== VIDEO DEMO MODAL ========== */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            style={{ zIndex: 9999 }}
            onClick={() => setShowVideoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={(e) => { e.stopPropagation(); setShowVideoModal(false); }}
                className="absolute -top-12 right-0 z-20 w-10 h-10 flex items-center justify-center bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors shadow-lg"
              >
                <FaTimes className="w-5 h-5" />
              </button>

              {/* Video Header */}
              <div className="bg-blue-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white">SmartLearners.ai Demo</h3>
                <p className="text-blue-100 text-sm">See how our AI-powered platform works</p>
              </div>

              {/* Video Player */}
              <div className="relative aspect-video bg-gray-900">
                <video
                  className="w-full h-full"
                  controls
                  autoPlay
                  src="/getstarted.mp4"
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Footer */}
              <div className="px-6 py-4 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
                <p className="text-gray-600 text-sm">
                  Ready to get started? Try our platform free for 1 month!
                </p>
                <Link
                  to="/free-trial"
                  className="button button--mimas px-6 py-2 text-sm"
                  onClick={() => setShowVideoModal(false)}
                >
                  <span>Start Free Trial</span>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
