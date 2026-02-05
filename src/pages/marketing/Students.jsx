import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Students() {
  const features = [
    { icon: '&#x1F916;', title: 'AI Solutions', desc: 'Step-by-step perfect answers for every question' },
    { icon: '&#x1F4A1;', title: 'Concept Videos', desc: '3-5 min videos that make hard topics easy' },
    { icon: '&#x1F4AC;', title: '24/7 AI Chatbot', desc: 'Ask doubts anytime, get instant answers' },
    { icon: '&#x1F4CA;', title: 'Gap Analysis', desc: 'Know exactly where you need to improve' },
    { icon: '&#x1F3AF;', title: 'Practice Tests', desc: 'Chapter-wise and full-length tests' },
    { icon: '&#x1F4C8;', title: 'Progress Tracking', desc: 'Watch your improvement over time' },
    { icon: '&#x1F3C6;', title: 'Achievements', desc: 'Earn badges and rewards as you learn' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="badge badge-primary mb-6">For Students</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Your Personal <span className="gradient-text">AI Tutor</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Learn smarter, not harder. Our AI understands your weaknesses and helps you improve.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/free-trial" className="button button--mimas text-lg px-8 py-4"><span>Start Free Trial</span></Link>
              <Link to="/courses" className="btn-secondary text-lg px-8 py-4">View Courses</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            What You Get
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 text-center"
              >
                <div className="text-4xl mb-4" dangerouslySetInnerHTML={{ __html: feature.icon }}></div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cta-gradient p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Learning?</h2>
            <p className="text-gray-600 mb-8">Join thousands of students already improving with SmartLearners.ai</p>
            <Link to="/free-trial" className="button button--mimas"><span>Start Free Trial - 1 Week</span></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
