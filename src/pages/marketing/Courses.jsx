import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const courses = [
  {
    category: 'CBSE',
    icon: '&#x1F4DA;',
    color: '#3b82f6',
    items: [
      { name: 'Class 6', subjects: 'Mathematics, Science, English', price: 200 },
      { name: 'Class 7', subjects: 'Mathematics, Science, English', price: 200 },
      { name: 'Class 8', subjects: 'Mathematics, Science, English', price: 200 },
      { name: 'Class 9', subjects: 'Mathematics, Science, English', price: 200 },
      { name: 'Class 10', subjects: 'Mathematics, Science, English', price: 200 },
      { name: 'Class 11', subjects: 'Mathematics, Physics, Chemistry, Biology', price: 300 },
      { name: 'Class 12', subjects: 'Mathematics, Physics, Chemistry, Biology', price: 300 },
    ]
  },
  {
    category: 'CBSE + JEE Foundation',
    icon: '&#x1F3AF;',
    color: '#a855f7',
    items: [
      { name: 'Class 8 Foundation', price: 500, subjects: 'Mathematics' },
      { name: 'Class 9 Foundation', price: 500, subjects: 'Mathematics' },
      { name: 'Class 10 Foundation', price: 500, subjects: 'Mathematics' },
    ]
  },
  {
    category: 'JEE Mains',
    icon: '&#x1F680;',
    color: '#f59e0b',
    items: [
      { name: 'Class 11 & 12 JEE Mains', price: 800, subjects: 'Mathematics' },
    ]
  },
  {
    category: 'JEE Advanced',
    icon: '&#x1F31F;',
    color: '#ef4444',
    items: [
      { name: 'Class 11 & 12 JEE Advanced', price: 1000, subjects: 'Mathematics' },
    ]
  },
]

const subjects = [
  { name: 'Mathematics', icon: '&#x1F4D0;', color: '#3b82f6', chapters: '15+ Chapters' },
  { name: 'Science', icon: '&#x1F52C;', color: '#22c55e', chapters: '18+ Chapters' },
  { name: 'Physics', icon: '&#x26A1;', color: '#eab308', chapters: '14+ Chapters' },
  { name: 'Chemistry', icon: '&#x1F9EA;', color: '#a855f7', chapters: '16+ Chapters' },
  { name: 'Biology', icon: '&#x1F9EC;', color: '#ec4899', chapters: '12+ Chapters' },
  { name: 'English', icon: '&#x1F4D6;', color: '#6366f1', chapters: '10+ Chapters' },
]

const features = [
  { icon: '&#x1F3AC;', title: 'Video Lessons', desc: 'HD quality video tutorials by expert teachers' },
  { icon: '&#x1F4DD;', title: 'Practice Tests', desc: 'Chapter-wise and full mock tests' },
  { icon: '&#x1F916;', title: 'AI Doubt Solving', desc: '24/7 AI chatbot for instant help' },
  { icon: '&#x1F4CA;', title: 'Progress Tracking', desc: 'Detailed analytics and reports' },
  { icon: '&#x1F4F1;', title: 'Mobile Access', desc: 'Learn anywhere on any device' },
  { icon: '&#x1F3C6;', title: 'Certificates', desc: 'Get certified on completion' },
]

const pricingPlans = [
  { name: 'CBSE Class 6-10', price: 200, color: '#3b82f6', features: ['All Subjects', 'Video Lessons', 'Practice Tests', 'AI Support'] },
  { name: 'CBSE Class 11-12', price: 300, color: '#3b82f6', features: ['All Subjects', 'Video Lessons', 'Practice Tests', 'AI Support'] },
  { name: 'JEE Mains', price: 800, color: '#f59e0b', features: ['PCM Complete', 'Mock Tests', 'AI Analysis', 'Doubt Support'], popular: true },
  { name: 'JEE Advanced', price: 1000, color: '#ef4444', features: ['Advanced Problems', 'Full Mock Tests', 'AI Remedial', 'Expert Support'] },
]

export default function Courses() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Floating Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
        <div className="absolute rounded-full" style={{ width: 400, height: 400, background: '#dbeafe', top: '10%', left: '-10%', filter: 'blur(80px)', opacity: 0.6 }} />
        <div className="absolute rounded-full" style={{ width: 300, height: 300, background: '#f3e8ff', top: '60%', right: '-5%', filter: 'blur(80px)', opacity: 0.6 }} />
        <div className="absolute rounded-full" style={{ width: 250, height: 250, background: '#fce7f3', bottom: '10%', left: '30%', filter: 'blur(80px)', opacity: 0.6 }} />
      </div>

      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="badge badge-primary mb-6"
            >
              Our Courses
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight"
            >
              Complete Curriculum for <span className="gradient-text">Class 6-12</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
            >
              <span className="text-blue-600 font-bold">CBSE</span>,{' '}
              <span className="text-purple-600 font-bold">JEE Foundation</span>,{' '}
              <span className="text-amber-600 font-bold">JEE Mains</span> &{' '}
              <span className="text-red-600 font-bold">JEE Advanced</span> courses with AI-powered learning
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link to="/signup" className="button button--mimas text-lg px-8 py-4 no-underline">
                <span>Enroll Now</span>
              </Link>
              <a href="#courses" className="btn-secondary text-lg px-8 py-4 no-underline">
                View All Courses
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Simple <span className="gradient-text">Pricing</span>
            </h2>
            <p className="text-xl text-gray-600">One-time payment, lifetime access</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`glass-card p-6 relative hover-lift ${plan.popular ? 'border-2 shadow-lg' : ''}`}
                style={{ borderColor: plan.popular ? plan.color : 'transparent' }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span
                      className="text-white text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ background: plan.color }}
                    >
                      POPULAR
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold" style={{ color: plan.color }}>Rs.{plan.price}</span>
                    <span className="text-gray-500 text-sm">/one-time</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-gray-700 text-sm">
                      <span style={{ color: plan.color }}>&#10003;</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className="btn-primary w-full text-center block py-3 rounded-xl text-white font-semibold no-underline"
                  style={{ background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)` }}
                >
                  Enroll Now
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-20 bg-white" id="courses">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Choose Your <span className="gradient-text">Course</span>
            </h2>
            <p className="text-xl text-gray-600">Select from our comprehensive range of courses</p>
          </div>

          <div className="space-y-12">
            {courses.map((category, catIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ background: `${category.color}15`, border: `2px solid ${category.color}40` }}
                    dangerouslySetInnerHTML={{ __html: category.icon }}
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{category.category}</h3>
                    <p className="text-gray-500 text-sm">{category.items.length} courses available</p>
                  </div>
                </div>

                {/* Course Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {category.items.map((course, index) => (
                    <motion.div
                      key={course.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      viewport={{ once: true }}
                      className="glass-card p-6 hover-lift cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {course.name}
                        </h4>
                        <span
                          className="text-lg font-bold"
                          style={{ color: category.color }}
                        >
                          Rs.{course.price}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mb-4">{course.subjects}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">1 Month</span>
                        <Link
                          to="/signup"
                          className="text-sm font-semibold transition-colors no-underline"
                          style={{ color: category.color }}
                        >
                          Enroll &rarr;
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Covered */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Subjects <span className="gradient-text">Covered</span>
            </h2>
            <p className="text-xl text-gray-600">Comprehensive coverage of all subjects</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {subjects.map((subject, index) => (
              <motion.div
                key={subject.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 text-center hover-lift cursor-pointer"
                style={{ minWidth: '160px' }}
              >
                <div
                  className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-4"
                  style={{ background: `${subject.color}15`, border: `2px solid ${subject.color}40` }}
                  dangerouslySetInnerHTML={{ __html: subject.icon }}
                />
                <h3 className="font-semibold text-gray-900 mb-1">{subject.name}</h3>
                <p className="text-gray-500 text-xs">{subject.chapters}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              What You <span className="gradient-text">Get</span>
            </h2>
            <p className="text-xl text-gray-600">Every course includes these features</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 hover-lift"
              >
                <div
                  className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl mb-4"
                  dangerouslySetInnerHTML={{ __html: feature.icon }}
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Trial CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-12 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Not Sure Which Course?</h2>
            <p className="text-gray-700 mb-8">Try our platform free for 1 week and see the difference for yourself.</p>
            <Link to="/free-trial" className="button button--mimas no-underline" style={{ background: '#1e8e3e' }}>
              <span>Start Free Trial - No Credit Card</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cta-gradient p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-40 h-40 bg-blue-200/40 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-200/40 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                Join thousands of students already excelling with SmartLearners.ai
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/signup" className="button button--mimas text-lg px-8 py-4 no-underline">
                  <span>Get Started Free</span>
                </Link>
                <Link to="/contact" className="btn-secondary text-lg px-8 py-4 no-underline">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
