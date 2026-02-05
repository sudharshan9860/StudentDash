import { motion } from 'framer-motion'

const principles = [
  {
    icon: '&#x1F6E1;',
    title: 'Data Protection',
    description: 'We use industry-standard encryption to protect your personal information',
    color: '#3b82f6'
  },
  {
    icon: '&#x1F464;',
    title: 'Privacy First',
    description: 'Your privacy is our top priority in everything we do',
    color: '#22c55e'
  },
  {
    icon: '&#x1F512;',
    title: 'Secure Storage',
    description: 'All data is stored securely with advanced security measures',
    color: '#a855f7'
  },
  {
    icon: '&#x1F441;',
    title: 'Transparency',
    description: 'We are transparent about what data we collect and how we use it',
    color: '#6366f1'
  }
]

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Floating Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
        <div className="absolute rounded-full" style={{ width: 400, height: 400, background: '#e8f0fe', top: '10%', left: '-10%', filter: 'blur(80px)', opacity: 0.6 }} />
        <div className="absolute rounded-full" style={{ width: 300, height: 300, background: '#fce8f4', top: '60%', right: '-5%', filter: 'blur(80px)', opacity: 0.6 }} />
      </div>

      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="badge badge-primary mb-6">Privacy Policy</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              At Smart Learners.ai (<span className="text-blue-600 font-semibold">Orcalex Technologies LLP</span>), we are committed to protecting your privacy and ensuring
              the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data, in compliance with applicable data protection laws.
            </p>
            <p className="text-sm text-gray-500">
              Last updated: August 29, 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Principles Section */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-purple-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {principles.map((principle, index) => (
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
                  style={{ background: `${principle.color}15`, border: `2px solid ${principle.color}40` }}
                  dangerouslySetInnerHTML={{ __html: principle.icon }}
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {principle.title}
                </h3>
                <p className="text-gray-600 text-sm">{principle.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">1. Information We Collect</h2>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Personal Information</h3>
            <p className="text-gray-600 mb-4">
              When you register or use our services, we may collect:
            </p>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li>• Full name and contact details (email, phone number)</li>
              <li>• Educational background and class level</li>
              <li>• Parent/guardian details (for minors)</li>
              <li>• Payment information (processed securely by trusted third-party providers; we do not store credit/debit card details)</li>
            </ul>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Learning Data</h3>
            <p className="text-gray-600 mb-4">
              To provide personalized learning, we collect:
            </p>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li>• Course progress and completion records</li>
              <li>• Quiz and test results</li>
              <li>• Time spent on topics</li>
              <li>• Learning preferences and interaction logs</li>
            </ul>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Technical Information</h3>
            <p className="text-gray-600 mb-4">
              We automatically collect:
            </p>
            <ul className="text-gray-600 mb-8 space-y-2">
              <li>• Platform usage patterns</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">2. How We Use Your Information</h2>

            <p className="text-gray-600 mb-6">We process your information for:</p>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Educational Services</h3>
            <p className="text-gray-600 mb-4">Personalized tutoring, study plans, certificates, progress tracking and performance analysis</p>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Communication</h3>
            <p className="text-gray-600 mb-8">Account notifications, updates, support, and (with consent) marketing offers</p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">3. Data Sharing and Disclosure</h2>

            <p className="text-gray-600 mb-6">
              We never sell or rent your personal data. We may share it only in these cases:
            </p>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Service Providers</h3>
            <p className="text-gray-600 mb-4">
              With trusted vendors (e.g., cloud hosting, analytics, payment processors, customer support tools) bound by strict confidentiality agreements
            </p>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Legal Obligations</h3>
            <p className="text-gray-600 mb-4">
              To comply with laws, court orders, or prevent fraud/abuse
            </p>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Business Transfers</h3>
            <p className="text-gray-600 mb-8">
              In the event of a merger, acquisition, or reorganization, with safeguards in place
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">4. Data Security</h2>

            <p className="text-gray-600 mb-4">
              We use industry-standard measures to secure your data:
            </p>
            <ul className="text-gray-600 mb-8 space-y-2">
              <li>• SSL/TLS encryption for all transmissions</li>
              <li>• Encrypted and access-controlled storage</li>
              <li>• Regular security audits and monitoring</li>
              <li>• Employee training and restricted access</li>
              <li>• Incident response protocols</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">5. Your Rights</h2>

            <p className="text-gray-600 mb-4">Depending on your location, you may have the right to:</p>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li>• Access your personal data</li>
              <li>• Correct or update your information</li>
              <li>• Request deletion of your account and data</li>
              <li>• Export your learning data in a machine-readable format</li>
              <li>• Opt out of marketing communications</li>
            </ul>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Parental Rights</h3>
            <p className="text-gray-600 mb-8">
              For users under 18, parents/guardians may access, update, or request deletion of their child's information by contacting us.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">6. Cookies and Tracking</h2>

            <p className="text-gray-600 mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li>• Remember your login preferences</li>
              <li>• Analyze platform usage</li>
              <li>• Personalize learning content</li>
            </ul>
            <p className="text-gray-600 mb-8">
              You can manage cookies via your browser settings.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">7. Retention of Data</h2>

            <p className="text-gray-600 mb-8">
              We retain personal data only as long as necessary for educational services, legal obligations, or dispute resolution. After that, your data is securely deleted or anonymized.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">8. Changes to This Policy</h2>

            <p className="text-gray-600 mb-8">
              We may update this Privacy Policy from time to time. Material changes will be communicated via email or in-app notification. The updated version will be effective immediately upon posting.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">9. Contact Us</h2>

            <p className="text-gray-600 mb-4">
              If you have questions or concerns about this Privacy Policy or your data rights, please contact:
            </p>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <p className="text-gray-700 mb-2"><strong>Email:</strong> hello@smartlearners.ai</p>
              <p className="text-gray-700 mb-2"><strong>Phone:</strong> +91 6303974827</p>
              <p className="text-gray-700"><strong>Address:</strong> 4th Floor, Veer Chambers, Prakash Nagar, Hyderabad-500016, India</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
