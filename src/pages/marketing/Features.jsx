import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: '&#x1F916;',
    title: 'AI-Powered Learning',
    description: 'Our AI analyzes every answer, identifies mistakes, and provides personalized explanations.',
    color: 'blue',
    bgColor: 'bg-blue-50',
    iconBg: 'bg-blue-100'
  },
  {
    icon: '&#x1F4CA;',
    title: 'Gap Analysis',
    description: 'Automatically identifies weak areas and creates targeted improvement plans.',
    color: 'purple',
    bgColor: 'bg-purple-50',
    iconBg: 'bg-purple-100'
  },
  {
    icon: '&#x1F4F1;',
    title: 'WhatsApp Updates',
    description: 'Parents receive real-time updates on child\'s progress directly on WhatsApp.',
    color: 'green',
    bgColor: 'bg-green-50',
    iconBg: 'bg-green-100'
  },
  {
    icon: '&#x1F4DD;',
    title: 'Step-by-Step Solutions',
    description: 'Every question comes with detailed, step-by-step AI-generated solutions.',
    color: 'orange',
    bgColor: 'bg-orange-50',
    iconBg: 'bg-orange-100'
  },
  {
    icon: '&#x1F3AF;',
    title: 'Exam Preparation',
    description: '7-day exam guides with daily practice plans and confidence tracking.',
    color: 'pink',
    bgColor: 'bg-pink-50',
    iconBg: 'bg-pink-100'
  },
  {
    icon: '&#x1F4AC;',
    title: '24/7 AI Chatbot',
    description: 'Ask doubts anytime and get instant, accurate answers from our AI tutor.',
    color: 'cyan',
    bgColor: 'bg-cyan-50',
    iconBg: 'bg-cyan-100'
  },
]

export default function Features() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="badge badge-primary mb-6">Features</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Powerful Features for <span className="gradient-text">Smart Learning</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Everything your child needs to excel in academics, powered by cutting-edge AI technology.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 hover-lift"
              >
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-6 ${feature.iconBg}`}
                  dangerouslySetInnerHTML={{ __html: feature.icon }}
                />
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cta-gradient p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Experience These Features?
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Start your free trial today and see the difference AI-powered learning can make.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/free-trial" className="button button--mimas text-lg px-8 py-4">
                <span>Start Free Trial</span>
              </Link>
              <Link to="/courses" className="btn-secondary text-lg px-8 py-4">
                View Courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
