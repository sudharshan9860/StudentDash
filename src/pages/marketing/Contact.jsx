import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { marketingApi } from '../../api/axiosInstance'

const contactInfo = [
  {
    icon: '&#x1F4E7;',
    title: 'Email Us',
    desc: 'Send us an email anytime',
    value: 'hello@smartlearners.ai',
    href: 'mailto:hello@smartlearners.ai',
    color: '#3b82f6'
  },
  {
    icon: '&#x1F4DE;',
    title: 'Call Us',
    desc: 'Mon-Sat, 9am-6pm IST',
    value: '+91 6303974827',
    href: 'tel:+916303974827',
    color: '#a855f7'
  },
  {
    icon: '&#x1F4AC;',
    title: 'WhatsApp',
    desc: 'Chat with us instantly',
    value: '+91 6303974827',
    href: 'https://wa.me/6303974827',
    color: '#22c55e'
  },
  {
    icon: '&#x1F4CD;',
    title: 'Visit Us',
    desc: 'Kaizen Imperial Heights',
    value: 'Begumpet, Hyderabad',
    href: '#',
    color: '#f59e0b'
  },
]

const faqs = [
  {
    question: 'How do I enroll in a course?',
    answer: 'Simply click on "Get Started" or "Enroll Now", create an account, select your class and course, and complete the payment. You will get instant access to all course materials.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major payment methods including UPI, Credit/Debit Cards, Net Banking, and popular wallets like Paytm and PhonePe.'
  },
  {
    question: 'Is there a refund policy?',
    answer: 'Since our services include instant access to digital content, we operate under a non-refundable policy. Please review our Refund Policy for more details.'
  },
  {
    question: 'Can I access courses on mobile?',
    answer: 'Yes! Our platform is fully responsive and works on all devices - mobile, tablet, and desktop. Learn anywhere, anytime.'
  },
  {
    question: 'How does the AI tutor work?',
    answer: 'Our AI tutor is available 24/7 to answer your doubts. Simply type your question or upload an image of the problem, and get step-by-step solutions instantly.'
  },
  {
    question: 'Do you offer courses for schools?',
    answer: 'Yes! We have special B2B plans for schools with bulk enrollment, admin dashboard, and detailed analytics. Contact us for a custom quote.'
  },
]

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    userType: 'student',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('idle')
  const [openFaq, setOpenFaq] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await marketingApi.submitContactForm(formData)
      setSubmitStatus('success')
      toast.success('Message sent successfully! We will get back to you soon.')
      setFormData({
        name: '',
        email: '',
        phone: '',
        userType: 'student',
        subject: '',
        message: ''
      })
      setTimeout(() => setSubmitStatus('idle'), 5000)
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Floating Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
        <div className="absolute rounded-full" style={{ width: 400, height: 400, background: '#dbeafe', top: '10%', left: '-10%', filter: 'blur(80px)', opacity: 0.6 }} />
        <div className="absolute rounded-full" style={{ width: 300, height: 300, background: '#f3e8ff', top: '60%', right: '-5%', filter: 'blur(80px)', opacity: 0.6 }} />
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
              Contact Us
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900"
            >
              Get in <span className="gradient-text">Touch</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
            >
              Have questions? We would love to hear from you. Send us a message and we will respond as soon as possible.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {contactInfo.map((info, index) => (
              <motion.a
                key={info.title}
                href={info.href}
                target={info.href.startsWith('http') ? '_blank' : undefined}
                rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 text-center hover-lift cursor-pointer group no-underline"
              >
                <div
                  className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-2xl mb-4 transition-all group-hover:scale-110"
                  style={{ background: `${info.color}15`, border: `2px solid ${info.color}40` }}
                  dangerouslySetInnerHTML={{ __html: info.icon }}
                />
                <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                <p className="text-gray-500 text-xs mb-2">{info.desc}</p>
                <p className="text-sm font-medium" style={{ color: info.color }}>{info.value}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h2>
              <p className="text-gray-600 mb-8">Fill out the form and we will get back to you within 24 hours.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Type */}
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-2 block">I am a</label>
                  <div className="flex gap-4">
                    {['student', 'parent', 'school'].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="userType"
                          value={type}
                          checked={formData.userType === type}
                          onChange={handleChange}
                          className="w-4 h-4 accent-blue-600"
                        />
                        <span className="text-gray-700 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-700 text-sm font-medium mb-2 block">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                      className="input-dark"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 text-sm font-medium mb-2 block">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      className="input-dark"
                    />
                  </div>
                </div>

                {/* Phone & Subject */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-700 text-sm font-medium mb-2 block">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                      className="input-dark"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 text-sm font-medium mb-2 block">Subject *</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="input-dark"
                    >
                      <option value="">Select subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="courses">Course Information</option>
                      <option value="pricing">Pricing & Plans</option>
                      <option value="technical">Technical Support</option>
                      <option value="school">School Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-gray-700 text-sm font-medium mb-2 block">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="How can we help you?"
                    className="input-dark resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="button button--mimas w-full py-4 no-underline"
                >
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>

                {/* Success Message */}
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-center"
                  >
                    Thank you for contacting us, we'll get back to you shortly.
                  </motion.div>
                )}
              </form>
            </motion.div>

            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Quick Contact */}
              <div className="glass-card p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Contact</h3>
                <div className="space-y-4">
                  <a href="mailto:hello@smartlearners.ai" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors no-underline">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl">&#x1F4E7;</div>
                    <div>
                      <p className="text-gray-900 font-medium">Email Support</p>
                      <p className="text-blue-600 text-sm">hello@smartlearners.ai</p>
                    </div>
                  </a>
                  <a href="https://wa.me/916303974827" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors no-underline">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-xl">&#x1F4AC;</div>
                    <div>
                      <p className="text-gray-900 font-medium">WhatsApp Support</p>
                      <p className="text-green-600 text-sm">Chat with us now</p>
                    </div>
                  </a>
                  <a href="tel:+916303974827" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors no-underline">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-xl">&#x1F4DE;</div>
                    <div>
                      <p className="text-gray-900 font-medium">Phone Support</p>
                      <p className="text-purple-600 text-sm">+91 6303974827</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Office Hours */}
              <div className="glass-card p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Office Hours</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="text-gray-900 font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="text-gray-900 font-medium">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="text-red-600 font-medium">Closed</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-blue-700 text-sm">
                    AI Chatbot support is available 24/7 for enrolled students!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-xl text-gray-600">Quick answers to common questions</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <span className={`text-blue-600 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}>
                    &#x25BC;
                  </span>
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
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
                <Link to="/courses" className="btn-secondary text-lg px-8 py-4 no-underline">
                  View Courses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
