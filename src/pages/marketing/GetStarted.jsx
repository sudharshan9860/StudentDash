import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCreditCard, FaCheckCircle, FaArrowLeft, FaArrowRight, FaQrcode, FaTimes } from 'react-icons/fa'
import { marketingApi } from '../../api/axiosInstance'

export default function GetStarted() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState('')

  const [formData, setFormData] = useState({
    studentName: '',
    studentClass: '',
    schoolName: '',
    mobileNumber: '',
    email: '',
    selectedCourse: '',
    howDidYouHear: '',
    otherSource: '',
    studentConsent: false,
    studentSignature: '',
    parentalConsent: false,
    parentSignature: '',
    termsAccepted: false
  })

  const courses = [
    { value: 'cbse-6-10', label: 'CBSE Class 6-10 - Rs.200/month', price: 200 },
    { value: 'cbse-11-12', label: 'CBSE Class 11-12 - Rs.300/month', price: 300 },
    { value: 'cbse-jee-foundation', label: 'CBSE+ JEE Foundation (Class 8-10) - Rs.500/month', price: 500 },
    { value: 'jee-mains', label: 'JEE Mains (Class 11-12) - Rs.800/month', price: 800 },
    { value: 'jee-advanced', label: 'JEE Advanced (Class 11-12) - Rs.1000/month', price: 1000 }
  ]

  const getSelectedCoursePrice = () => {
    const course = courses.find(c => c.value === formData.selectedCourse)
    return course?.price || 0
  }

  const getSelectedCourseName = () => {
    const course = courses.find(c => c.value === formData.selectedCourse)
    return course?.label.split(' - ')[0] || ''
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1)
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.selectedCourse) {
          alert('Please select a course')
          return false
        }
        return true
      case 2:
        if (!formData.studentConsent || !formData.parentalConsent || !formData.termsAccepted) {
          alert('Please accept all terms and provide consent')
          return false
        }
        if (!formData.studentSignature.trim()) {
          alert('Please provide student digital signature')
          return false
        }
        if (!formData.parentSignature.trim()) {
          alert('Please provide parent/guardian digital signature')
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    if (validateStep(2)) {
      try {
        const registrationPayload = {
          student_name: formData.studentName,
          email: formData.email,
          mobile_number: formData.mobileNumber,
          class_level: formData.studentClass,
          school_name: formData.schoolName,
          selected_course: formData.selectedCourse,
          how_did_you_hear: formData.howDidYouHear,
          other_source: formData.otherSource || null,
          student_consent: formData.studentConsent,
          parental_consent: formData.parentalConsent,
          terms_accepted: formData.termsAccepted,
          student_signature: formData.studentSignature,
          parent_signature: formData.parentSignature,
        }

        console.log('Starting registration...', registrationPayload)

        const registrationData = await marketingApi.registerUser(registrationPayload)
        console.log('Registration successful:', registrationData)

        if (!registrationData.success) {
          throw new Error('Registration failed')
        }

        console.log('Starting payment initiation...', {
          registration_id: registrationData.registration_id
        })

        const paymentData = await marketingApi.initiatePayment(registrationData.registration_id)
        console.log('Payment Response:', paymentData)

        if (paymentData.success && paymentData.redirect_url) {
          setPaymentUrl(paymentData.redirect_url)
          setShowPaymentModal(true)
        } else {
          const errorMsg = paymentData.error || paymentData.detail || 'Payment initiation failed'
          throw new Error(errorMsg)
        }
      } catch (error) {
        console.error('Error submitting form:', error)
        let errorMessage = 'Unknown error occurred'
        if (error instanceof Error) {
          errorMessage = error.message
        } else if (typeof error === 'string') {
          errorMessage = error
        }
        alert(`Error: ${errorMessage}`)
      }
    }
  }

  const steps = [
    { number: 1, title: 'Select Plan', icon: <FaCreditCard /> },
    { number: 2, title: 'Consent & Terms', icon: <FaCheckCircle /> }
  ]

  return (
    <div className="min-h-screen pt-20 relative overflow-hidden">
      {/* Dark Navy Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f1628] via-[#1a1f3a] to-[#0f1628]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(26,115,232,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,52,233,0.05),transparent_50%)]" />
      </div>

      {/* Floating shapes - Light Theme */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full filter blur-3xl opacity-40 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-100 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '4s' }} />

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold text-center mb-8 text-gray-900">
            Get Started with <span className="gradient-text">Smart Learners</span>
          </h1>
          <p className="text-center text-gray-600 mb-8 text-lg">
            Join thousands of students on their AI-powered learning journey
          </p>

          {/* Step Indicator */}
          <div className="flex justify-between items-center mb-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                    currentStep >= step.number
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-gray-900 shadow-lg scale-110'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.icon}
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${currentStep >= step.number ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                    Step {step.number}
                  </p>
                  <p className={`text-xs ${currentStep >= step.number ? 'text-gray-600' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${
                      currentStep > step.number ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="glass-card p-8 bg-white backdrop-blur-lg shadow-xl border border-gray-200">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-6 gradient-text">Select Your Plan</h2>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Choose a Course *
                    </label>
                    <select
                      name="selectedCourse"
                      value={formData.selectedCourse}
                      onChange={handleInputChange}
                      className="input-dark"
                      required
                    >
                      <option value="">Select a course</option>
                      {courses.map(course => (
                        <option key={course.value} value={course.value}>
                          {course.label}
                        </option>
                      ))}
                    </select>

                    {formData.selectedCourse && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-6 bg-gray-50 rounded-xl border border-blue-500/30 shadow-lg"
                      >
                        <h3 className="font-semibold text-lg mb-3 text-gray-900">Payment Information</h3>
                        <p className="text-gray-600 mb-2">
                          Selected Course: <span className="font-medium text-blue-400">
                            {courses.find(c => c.value === formData.selectedCourse)?.label}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Payment will be processed after form submission. Our team will contact you within 24 hours.
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-6 gradient-text">Consent & Terms</h2>
                  <div className="space-y-6">
                    {/* Student Consent with Privacy Policy */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-lg mb-3 text-gray-900">Student Consent & Privacy Policy</h3>

                      {/* Scrollable Privacy Policy */}
                      <div className="mb-4 p-4 bg-gray-100 rounded-lg border border-gray-200 h-48 overflow-y-auto">
                        <div className="text-sm text-gray-600 space-y-3">
                          <p><strong className="text-blue-400">1. Information We Collect</strong></p>
                          <p>When you register or use our services, we may collect: Full name and contact details (email, phone number), Educational background and class level, Parent/guardian details (for minors), Payment information (processed securely by trusted third-party providers).</p>

                          <p><strong className="text-blue-400">2. How We Use Your Information</strong></p>
                          <p>We process your information for: Personalized tutoring, study plans, certificates, progress tracking and performance analysis. Account notifications, updates, support, and (with consent) marketing offers.</p>

                          <p><strong className="text-blue-400">3. Data Sharing and Disclosure</strong></p>
                          <p>We never sell or rent your personal data. We may share it only with trusted vendors (e.g., cloud hosting, analytics, payment processors) bound by strict confidentiality agreements, or to comply with laws, court orders, or prevent fraud/abuse.</p>

                          <p><strong className="text-blue-400">4. Data Security</strong></p>
                          <p>We use industry-standard measures to secure your data: SSL/TLS encryption for all transmissions, Encrypted and access-controlled storage, Regular security audits and monitoring, Employee training and restricted access, Incident response protocols.</p>

                          <p><strong className="text-blue-400">5. Your Rights</strong></p>
                          <p>You may have the right to: Access your personal data, Correct or update your information, Request deletion of your account and data, Export your learning data, Opt out of marketing communications.</p>

                          <p><strong className="text-blue-400">6. Cookies and Tracking</strong></p>
                          <p>We use cookies to remember your login preferences, analyze platform usage, and personalize learning content. You can manage cookies via your browser settings.</p>

                          <p><strong className="text-blue-400">7. Data Retention</strong></p>
                          <p>We retain personal data only as long as necessary for educational services, legal obligations, or dispute resolution. After that, your data is securely deleted or anonymized.</p>

                          <p><strong className="text-blue-400">8. Contact Us</strong></p>
                          <p>Email: hello@smartlearners.ai | Phone: +91 6303974827 | Address: 4th Floor, Veer Chambers, Prakash Nagar, Hyderabad-500016, India</p>
                        </div>
                      </div>

                      {/* Checkbox */}
                      <label className="flex items-start cursor-pointer mb-4">
                        <input
                          type="checkbox"
                          name="studentConsent"
                          checked={formData.studentConsent}
                          onChange={handleInputChange}
                          className="mt-1 mr-3 accent-blue-500"
                        />
                        <p className="text-sm text-gray-600">
                          I, as a student, agree to use the Smart Learners platform responsibly and accept the privacy policy above.
                        </p>
                      </label>

                      {/* Student Digital Signature */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Student Digital Signature *
                        </label>
                        <input
                          type="text"
                          name="studentSignature"
                          value={formData.studentSignature}
                          onChange={handleInputChange}
                          className="input-dark"
                          placeholder="Type your full name as digital signature"
                          required
                        />
                      </div>
                    </div>

                    {/* Parental Consent */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-lg mb-3 text-gray-900">Parental Consent</h3>

                      {/* Checkbox */}
                      <label className="flex items-start cursor-pointer mb-4">
                        <input
                          type="checkbox"
                          name="parentalConsent"
                          checked={formData.parentalConsent}
                          onChange={handleInputChange}
                          className="mt-1 mr-3 accent-blue-500"
                        />
                        <p className="text-sm text-gray-600">
                          I, as a parent/guardian, consent to my child using the Smart Learners platform and agree to monitor their progress.
                        </p>
                      </label>

                      {/* Parent Digital Signature */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Parent/Guardian Digital Signature *
                        </label>
                        <input
                          type="text"
                          name="parentSignature"
                          value={formData.parentSignature}
                          onChange={handleInputChange}
                          className="input-dark"
                          placeholder="Type parent/guardian full name as digital signature"
                          required
                        />
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-lg mb-3 text-gray-900">Terms and Conditions</h3>

                      {/* Scrollable Terms and Conditions */}
                      <div className="mb-4 p-4 bg-gray-100 rounded-lg border border-gray-200 h-48 overflow-y-auto">
                        <div className="text-sm text-gray-600 space-y-3">
                          <p><strong className="text-blue-400">1. Legal Agreement</strong></p>
                          <p>These Terms constitute a binding legal agreement between you and Smart Learners.ai (Orcalex Technologies LLP).</p>

                          <p><strong className="text-blue-400">2. Description of Service</strong></p>
                          <p>Smart Learners.ai provides an AI-powered educational platform offering: Personalized learning experiences, AI-driven tutoring and assessments, Progress tracking and analytics, Interactive courses for Classes 6–12, JEE preparation materials and tests, Certificates and performance reports.</p>

                          <p><strong className="text-blue-400">3. User Registration and Accounts</strong></p>
                          <p>Users must provide accurate and complete information during registration. One account per user is allowed. Users under 18 may only register with verifiable parental or guardian consent. You are responsible for maintaining the confidentiality of your credentials.</p>

                          <p><strong className="text-blue-400">4. Acceptable Use Policy</strong></p>
                          <p>Permitted Uses: Access and use content for personal learning, Complete assignments honestly, Interact respectfully with AI tutors and peers. Prohibited: Share accounts or login credentials, Copy or distribute content without permission, Submit false information or cheat on assessments.</p>

                          <p><strong className="text-blue-400">5. Subscription and Payment Terms</strong></p>
                          <p>Free plan with limited access, Premium subscriptions with full access, Annual and monthly billing options. All payments are processed securely by third-party providers. Payments are non-refundable, except where required by law. Subscriptions renew automatically unless cancelled.</p>

                          <p><strong className="text-blue-400">6. Intellectual Property Rights</strong></p>
                          <p>All content, software, AI algorithms, design, trademarks, and technology are the property of Smart Learners.ai and protected by applicable laws. By submitting content, you grant us a non-exclusive, royalty-free, worldwide license to use and improve services.</p>

                          <p><strong className="text-blue-400">7. Privacy and Data Protection</strong></p>
                          <p>Your privacy is important to us. Our Privacy Policy explains what information we collect, how we use it, and your rights.</p>

                          <p><strong className="text-blue-400">8. Disclaimers and Limitations</strong></p>
                          <p>Smart Learners.ai is a supplementary tool. We do not guarantee specific academic outcomes or uninterrupted access. We are not liable for indirect, incidental, or consequential damages.</p>

                          <p><strong className="text-blue-400">9. Termination</strong></p>
                          <p>You may terminate your account at any time. We may suspend or terminate your account if Terms are violated, fraudulent activity is detected, or the account remains inactive.</p>

                          <p><strong className="text-blue-400">10. Contact Information</strong></p>
                          <p>Email: hello@smartlearners.ai | Phone: +91 6303974827 | Address: 4th Floor, Veer Chambers, Prakash Nagar, Hyderabad-500016, India | Support Hours: Mon–Sat, 9:00 AM – 6:00 PM IST</p>
                        </div>
                      </div>

                      {/* Checkbox */}
                      <label className="flex items-start cursor-pointer mt-4">
                        <input
                          type="checkbox"
                          name="termsAccepted"
                          checked={formData.termsAccepted}
                          onChange={handleInputChange}
                          className="mt-1 mr-3 accent-blue-500"
                        />
                        <p className="text-sm text-gray-600">
                          I agree to all terms and conditions as detailed above.
                        </p>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="btn-secondary flex items-center"
                >
                  <FaArrowLeft className="mr-2" />
                  Previous
                </button>
              )}

              <div className={currentStep === 1 ? 'ml-auto' : ''}>
                {currentStep < 2 ? (
                  <button
                    onClick={handleNext}
                    className="button button--mimas flex items-center"
                  >
                    <span>Next</span>
                    <FaArrowRight className="ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="button button--mimas text-lg px-8 py-3"
                  >
                    <span>Checkout</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1f3a] rounded-2xl p-8 max-w-md w-full shadow-2xl relative border border-gray-200"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete Payment</h3>
                <p className="text-gray-500">Scan QR code or pay via PhonePe</p>
              </div>

              {/* Order Summary */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500">Course:</span>
                  <span className="text-gray-900 font-medium">{getSelectedCourseName()}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-500">Student:</span>
                  <span className="text-gray-900">{formData.studentName}</span>
                </div>
                <hr className="border-gray-200 my-3" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-400">
                    Rs.{getSelectedCoursePrice()}
                  </span>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="text-center mb-6">
                <div className="bg-white p-4 rounded-xl inline-block mb-4">
                  <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <FaQrcode className="w-16 h-16 mx-auto mb-2 text-blue-500" />
                      <p className="text-sm text-gray-600">QR Code</p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-500 text-sm">Scan with any UPI app (GPay, PhonePe, Paytm)</p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <hr className="flex-1 border-gray-200" />
                <span className="text-gray-500 text-sm font-medium">OR</span>
                <hr className="flex-1 border-gray-200" />
              </div>

              {/* PhonePe Button */}
              <button
                onClick={() => window.location.href = paymentUrl}
                className="w-full py-4 rounded-xl bg-[#5f259f] hover:bg-[#4a1d7a] text-gray-900 font-semibold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg"
              >
                Pay with PhonePe
              </button>

              {/* Security Note */}
              <p className="text-center text-gray-500 text-xs mt-4">
                Secured by PhonePe Payment Gateway
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
