import { motion } from 'framer-motion'

const policies = [
  {
    icon: '&#x1F6AB;',
    title: 'No Refunds',
    description: 'All payments are final and non-refundable',
    color: '#ef4444'
  },
  {
    icon: '&#x2696;',
    title: 'Transparent Policy',
    description: 'Clear terms stated before purchase',
    color: '#eab308'
  },
  {
    icon: '&#x1F4DC;',
    title: 'Legally Binding',
    description: 'Payments confirm acceptance of terms',
    color: '#3b82f6'
  },
  {
    icon: '&#x2139;',
    title: 'Support Available',
    description: 'We assist with any platform issues',
    color: '#a855f7'
  }
]

export default function Refund() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Floating Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
        <div className="absolute rounded-full" style={{ width: 400, height: 400, background: '#fef3c7', top: '10%', left: '-10%', filter: 'blur(80px)', opacity: 0.6 }} />
        <div className="absolute rounded-full" style={{ width: 300, height: 300, background: '#fee2e2', top: '60%', right: '-5%', filter: 'blur(80px)', opacity: 0.6 }} />
      </div>

      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="badge badge-primary mb-6">Refund Policy</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Refund <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              At <span className="text-blue-600 font-semibold">Smart Learners.ai (Orcalex Technologies LLP)</span>, we strive to provide high-quality digital learning experiences. Since our services include <span className="font-semibold">instant access to digital content and personalized AI-driven tools</span>, we operate under a <span className="font-semibold">non-refundable digital services policy</span>.
            </p>
            <p className="text-sm text-gray-500">Last updated: July 31, 2025</p>
          </motion.div>
        </div>
      </section>

      {/* Policies Section */}
      <section className="py-12 bg-gradient-to-r from-orange-50 via-yellow-50 to-red-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {policies.map((policy, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 text-center hover-lift"
              >
                <div
                  className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-4"
                  style={{ background: `${policy.color}15`, border: `2px solid ${policy.color}40` }}
                  dangerouslySetInnerHTML={{ __html: policy.icon }}
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {policy.title}
                </h3>
                <p className="text-gray-600 text-sm">{policy.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Refund Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Important Notice</h2>

            <p className="text-gray-600 mb-4">
              By accessing and using the Smart Learners.ai platform, you acknowledge and accept that all payments are final and non-refundable. This includes, but is not limited to:
            </p>

            <ul className="text-gray-600 mb-6 space-y-2">
              <li>• Monthly or annual subscription fees</li>
              <li>• One-time course or module purchases</li>
              <li>• Promotional or discounted offers</li>
              <li>• Institutional and bulk orders</li>
              <li>• Trial-to-paid conversions</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Legal Disclaimer</h2>
            <p className="text-gray-600 mb-4">
              Under the Consumer Protection Act of India and international digital commerce regulations, digital content and educational services are exempt from standard return policies once access is granted. Since Smart Learners.ai delivers immediate access to digital learning materials, we are legally not obligated to provide refunds.
            </p>

            <p className="text-gray-600 mb-8">
              Your transaction is considered a legally binding agreement, confirming your understanding and acceptance of these terms. Please read our Terms of Service and Privacy Policy before completing your purchase.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Need Help?</h2>
            <p className="text-gray-600 mb-4">
              While we do not issue refunds, we are committed to providing a seamless experience. For platform issues, technical difficulties, or learning concerns, please contact our support team:
            </p>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <p className="text-gray-700 mb-2"><strong>Support Email:</strong> hello@smartlearners.ai</p>
              <p className="text-gray-700 mb-2"><strong>Phone:</strong> +91 6303974827</p>

              <h4 className="font-semibold text-gray-800 mt-4 mb-2">Support Hours:</h4>
              <p className="text-gray-700 mb-2">Monday - Friday: 9:00 AM - 6:00 PM IST</p>
              <p className="text-gray-700 mb-4">Response time: Within 24 hours</p>

              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <h4 className="font-semibold text-yellow-800 mb-2">Reminder:</h4>
                <p className="text-yellow-700 text-sm">
                  Please ensure that you fully understand our offerings before purchasing. Our team is happy to answer any pre-sales questions or provide demos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
