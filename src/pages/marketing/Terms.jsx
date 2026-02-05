import { motion } from 'framer-motion'

const highlights = [
  {
    icon: '&#x2696;',
    title: 'Legal Agreement',
    description: 'Binding terms between you and Smart Learners.ai (Orcalex Technologies LLP)',
    color: '#3b82f6'
  },
  {
    icon: '&#x1F91D;',
    title: 'Fair Usage',
    description: 'Guidelines for responsible use of our platform',
    color: '#22c55e'
  },
  {
    icon: '&#x1F464;',
    title: 'User Rights',
    description: 'Your rights and responsibilities as a user',
    color: '#a855f7'
  },
  {
    icon: '&#x26A0;',
    title: 'Important Notices',
    description: 'Key limitations and disclaimers',
    color: '#f97316'
  }
]

export default function Terms() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Floating Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
        <div className="absolute rounded-full" style={{ width: 400, height: 400, background: '#e8f0fe', top: '10%', left: '-10%', filter: 'blur(80px)', opacity: 0.6 }} />
        <div className="absolute rounded-full" style={{ width: 300, height: 300, background: '#f3e8ff', top: '60%', right: '-5%', filter: 'blur(80px)', opacity: 0.6 }} />
      </div>

      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="badge badge-primary mb-6">Terms & Conditions</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Terms & <span className="gradient-text">Conditions</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Please read these Terms and conditions carefully before using Smart Learners.ai (<span className="text-blue-600 font-semibold">Orcalex Technologies LLP</span>).
              By accessing or using our platform, you agree to be bound by these Terms. If you do not agree, you may not use the Platform.
            </p>
            <p className="text-sm text-gray-500">
              Last updated: August 29, 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-12 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {highlights.map((highlight, index) => (
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
                  style={{ background: `${highlight.color}15`, border: `2px solid ${highlight.color}40` }}
                  dangerouslySetInnerHTML={{ __html: highlight.icon }}
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {highlight.title}
                </h3>
                <p className="text-gray-600 text-sm">{highlight.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">1. Legal Agreement</h2>

            <p className="text-gray-600 mb-8">
              These Terms constitute a binding legal agreement between you and Smart Learners.ai (Orcalex Technologies LLP).
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">2. Description of Service</h2>

            <p className="text-gray-600 mb-4">
              Smart Learners.ai provides an AI-powered educational platform offering:
            </p>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li>• Personalized learning experiences</li>
              <li>• AI-driven tutoring and assessments</li>
              <li>• Progress tracking and analytics</li>
              <li>• Interactive courses for Classes 6-12</li>
              <li>• JEE preparation materials and tests</li>
              <li>• Certificates and performance reports</li>
            </ul>

            <p className="text-gray-600 mb-8">
              The Platform is provided "as is," and we may modify, suspend, or discontinue any aspect of the service at our discretion.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">3. User Registration and Accounts</h2>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Account Creation</h3>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li>• Users must provide accurate and complete information during registration.</li>
              <li>• One account per user is allowed.</li>
              <li>• Users under 18 may only register with verifiable parental or guardian consent.</li>
            </ul>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Account Security</h3>
            <ul className="text-gray-600 mb-8 space-y-2">
              <li>• You are responsible for maintaining the confidentiality of your credentials.</li>
              <li>• Notify us immediately of unauthorized use of your account.</li>
              <li>• Strong passwords and regular updates are recommended.</li>
              <li>• We are not liable for damages from unauthorized account access.</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">4. Acceptable Use Policy</h2>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Permitted Uses</h3>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li>• Access and use content for personal learning.</li>
              <li>• Complete assignments honestly.</li>
              <li>• Interact respectfully with AI tutors and peers.</li>
              <li>• Provide constructive feedback.</li>
            </ul>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Prohibited Activities</h3>
            <p className="text-gray-600 mb-4">You agree not to:</p>
            <ul className="text-gray-600 mb-8 space-y-2">
              <li>• Share accounts or login credentials.</li>
              <li>• Copy, distribute, or modify content without permission.</li>
              <li>• Reverse engineer or hack the platform.</li>
              <li>• Submit false information or cheat on assessments.</li>
              <li>• Use bots, scripts, or scraping tools.</li>
              <li>• Upload viruses, malicious code, or harmful content.</li>
              <li>• Harass or harm other users.</li>
              <li>• Violate laws or regulations.</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">5. Subscription and Payment Terms</h2>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Subscription Plans</h3>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li>• Free plan with limited access.</li>
              <li>• Premium subscriptions with full access.</li>
              <li>• Annual and monthly billing options.</li>
              <li>• Institutional/bulk pricing available.</li>
            </ul>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Payment Processing</h3>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li>• All payments are processed securely by third-party providers (e.g., PhonePe).</li>
              <li>• We do not store credit/debit card details.</li>
              <li>• Fees are charged in advance.</li>
              <li>• Failed payments may result in suspension.</li>
            </ul>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Refunds</h3>
            <p className="text-gray-600 mb-6">
              Payments are non-refundable, except where required by law. If you cancel, you will continue to have access until the end of your billing cycle.
            </p>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Auto-Renewal</h3>
            <p className="text-gray-600 mb-8">
              Subscriptions renew automatically unless cancelled before the renewal date. Price changes will be notified 30 days in advance.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">6. Intellectual Property Rights</h2>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Our Content</h3>
            <p className="text-gray-600 mb-6">
              All content, software, AI algorithms, design, trademarks, and technology are the property of Smart Learners.ai (Orcalex Technologies LLP) and protected by applicable laws.
            </p>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">User-Generated Content</h3>
            <p className="text-gray-600 mb-8">
              By submitting content (answers, feedback, uploads), you grant Smart Learners.ai a non-exclusive, royalty-free, worldwide license to use, display, and improve services. We reserve the right to moderate, remove, or edit user content that violates these Terms.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">7. Privacy and Data Protection</h2>

            <p className="text-gray-600 mb-8">
              Your privacy is important to us. Our Privacy Policy explains what information we collect, how we use it, and your rights.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">8. Disclaimers and Limitations</h2>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Educational Disclaimer</h3>
            <p className="text-gray-600 mb-6">
              Smart Learners.ai is a supplementary tool. While we strive for accuracy, we do not guarantee specific academic outcomes. Traditional study methods and qualified teachers remain essential.
            </p>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Service Availability</h3>
            <p className="text-gray-600 mb-6">
              We target 99.9% uptime but do not guarantee uninterrupted access. We are not responsible for delays or interruptions caused by force majeure events (e.g., natural disasters, government actions, internet outages).
            </p>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Limitation of Liability</h3>
            <p className="text-gray-600 mb-8">
              We are not liable for indirect, incidental, or consequential damages including loss of profits, data, goodwill, or learning outcomes.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">9. Indemnity</h2>

            <p className="text-gray-600 mb-8">
              You agree to indemnify and hold harmless Smart Learners.ai, its affiliates, and employees from claims, damages, or expenses arising from your misuse of the Platform or violation of these Terms.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">10. Termination</h2>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">By You</h3>
            <p className="text-gray-600 mb-4">
              You may terminate your account at any time by:
            </p>
            <ul className="text-gray-600 mb-6 space-y-2">
              <li>• Using account deletion settings</li>
              <li>• Contacting our support team</li>
            </ul>

            <h3 className="text-2xl font-semibold text-gray-800 mb-4">By Us</h3>
            <p className="text-gray-600 mb-4">
              We may suspend or terminate your account if:
            </p>
            <ul className="text-gray-600 mb-8 space-y-2">
              <li>• Terms are violated.</li>
              <li>• Fraudulent activity is detected.</li>
              <li>• The account remains inactive for long periods.</li>
              <li>• The service is discontinued (with reasonable notice).</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">11. Communication: WhatsApp Notifications</h2>

            <p className="text-gray-600 mb-4">
              By creating an account on Smart Learners.ai, you consent to receive important communications from us through WhatsApp, including:
            </p>
            <ul className="text-gray-600 mb-8 space-y-2">
              <li>• Learning updates and reminders</li>
              <li>• Test alerts, progress reports, and performance insights</li>
              <li>• Important service-related messages</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">12. Changes to Terms</h2>

            <p className="text-gray-600 mb-8">
              We may update these Terms from time to time. Material changes will be communicated by email or platform notification at least 30 days before effect. Continued use after changes implies acceptance.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">13. Contact Information</h2>

            <p className="text-gray-600 mb-4">
              For any questions about these Terms, contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <p className="text-gray-700 mb-2"><strong>Email:</strong> hello@smartlearners.ai</p>
              <p className="text-gray-700 mb-2"><strong>Phone:</strong> +91 6303974827</p>
              <p className="text-gray-700 mb-2"><strong>Address:</strong> 4th Floor, Veer Chambers, Prakash Nagar, Hyderabad-500016, India</p>
              <p className="text-gray-700"><strong>Support Hours:</strong> Mon-Sat, 9:00 AM - 6:00 PM IST</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
