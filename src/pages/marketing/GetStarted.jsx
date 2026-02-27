import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaCreditCard,
  FaCheckCircle,
  FaArrowLeft,
  FaArrowRight,
  FaShoppingCart,
  FaTimes,
  FaTag,
  FaSpinner,
  FaBook,
  FaCalendarAlt,
  FaLock,
  FaShieldAlt,
  FaCheck,
} from 'react-icons/fa'
import { AuthContext } from '../../components/AuthContext'
import {
  useGetCommerceItemsQuery,
  useCreateOrderMutation,
  useCreatePaymentMutation,
} from '../../store/api/commerceApi'

export default function GetStarted() {
  const { isAuthenticated } = useContext(AuthContext)
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedItems, setSelectedItems] = useState([])
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponError, setCouponError] = useState('')

  const [formData, setFormData] = useState({
    studentConsent: false,
    studentSignature: '',
    parentalConsent: false,
    parentSignature: '',
    termsAccepted: false,
  })

  // RTK Query hooks
  const {
    data: items = [],
    isLoading: itemsLoading,
    error: itemsError,
  } = useGetCommerceItemsQuery()

  const [createOrder, { isLoading: orderLoading }] = useCreateOrderMutation()
  const [createPayment, { isLoading: paymentLoading }] = useCreatePaymentMutation()

  const isProcessing = orderLoading || paymentLoading

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      alert('Please login first to proceed.')
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  // Cart helpers
  const toggleItem = (item) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.id === item.id)
      if (exists) return prev.filter((i) => i.id !== item.id)
      return [...prev, item]
    })
  }

  const removeItem = (itemId) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  const isSelected = (itemId) => selectedItems.some((i) => i.id === itemId)

  const getTotal = () => selectedItems.reduce((sum, item) => sum + item.price, 0)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }
    setCouponApplied(true)
    setCouponError('')
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setCouponApplied(false)
    setCouponError('')
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (selectedItems.length === 0) {
          alert('Please select at least one course or subscription')
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

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const handleCheckout = async () => {
    try {
      const itemIds = selectedItems.map((item) => item.id)
      const orderPayload = { item_ids: itemIds }
      if (couponApplied && couponCode.trim()) {
        orderPayload.coupon_code = couponCode.trim()
      }

      const orderResult = await createOrder(orderPayload).unwrap()

      if (!orderResult.order_id) {
        throw new Error('Failed to create order')
      }

      const paymentResult = await createPayment({
        order_id: orderResult.order_id,
      }).unwrap()

      if (paymentResult.payment_url) {
        window.location.href = paymentResult.payment_url
      } else {
        throw new Error('Payment URL not received')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      const message =
        error?.data?.detail || error?.data?.error || error?.message || 'Checkout failed. Please try again.'
      alert(`Error: ${message}`)
    }
  }

  const steps = [
    { number: 1, title: 'Select', icon: <FaShoppingCart /> },
    { number: 2, title: 'Consent', icon: <FaCheckCircle /> },
    { number: 3, title: 'Pay', icon: <FaCreditCard /> },
  ]

  return (
    <div className="min-h-screen pt-20 bg-gray-50/80 relative overflow-hidden marketing-page-bg">
      {/* Floating Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="marketing-orb marketing-orb--blue" style={{ width: 500, height: 500, top: '-5%', left: '20%' }} />
        <div className="marketing-orb marketing-orb--purple" style={{ width: 400, height: 400, bottom: '10%', right: '-5%' }} />
        <div className="marketing-orb marketing-orb--pink" style={{ width: 300, height: 300, top: '40%', left: '-8%' }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

          {/* Header — compact */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Get Started with <span className="gradient-text">Smart Learners</span>
            </h1>
            <p className="mt-2 text-gray-500 text-sm sm:text-base max-w-lg mx-auto">
              Choose your courses, accept terms, and checkout — all in under a minute.
            </p>
          </div>

          {/* Step indicator — pill style */}
          <div className="flex items-center justify-center gap-1 mb-8">
            {steps.map((step, index) => {
              const isActive = currentStep === step.number
              const isDone = currentStep > step.number
              return (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-gray-900 text-white shadow-sm'
                        : isDone
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isDone ? (
                      <FaCheck className="w-2.5 h-2.5" />
                    ) : (
                      <span className="w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold border border-current">
                        {step.number}
                      </span>
                    )}
                    <span className="hidden sm:inline">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-6 sm:w-10 h-px mx-1 ${isDone ? 'bg-green-300' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>

          <AnimatePresence mode="wait">
            {/* ──────── STEP 1: Browse & Select ──────── */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                {/* Section label */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Available plans
                    {!itemsLoading && (
                      <span className="ml-2 text-xs font-normal text-gray-400">
                        {items.length} {items.length === 1 ? 'plan' : 'plans'}
                      </span>
                    )}
                  </h2>
                </div>

                {/* Loading */}
                {itemsLoading && (
                  <div className="flex items-center justify-center py-16">
                    <FaSpinner className="animate-spin text-2xl text-gray-400 mr-2" />
                    <span className="text-gray-500 text-sm">Loading plans...</span>
                  </div>
                )}

                {/* Error */}
                {itemsError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                    <p className="text-red-600 text-sm font-medium">Failed to load plans.</p>
                    <p className="text-red-400 text-xs mt-1">Please refresh the page.</p>
                  </div>
                )}

                {/* Empty */}
                {!itemsLoading && !itemsError && items.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
                    <p className="text-gray-400 text-sm">No plans available right now.</p>
                  </div>
                )}

                {/* ── Course list — compact rows on mobile, grid on md+ ── */}
                {!itemsLoading && !itemsError && items.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {items.map((item, i) => {
                      const selected = isSelected(item.id)
                      const isSub = item.item_type === 'SUBSCRIPTION'
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.04 }}
                          onClick={() => toggleItem(item)}
                          className={`group relative flex items-center gap-3 p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                            selected
                              ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500/20'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          {/* Checkbox circle */}
                          <div
                            className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              selected
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300 group-hover:border-gray-400'
                            }`}
                          >
                            {selected && <FaCheck className="text-white text-[8px]" />}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-gray-900 truncate">{item.name}</span>
                              <span
                                className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${
                                  isSub ? 'bg-purple-100 text-purple-600' : 'bg-sky-100 text-sky-600'
                                }`}
                              >
                                {isSub ? <FaCalendarAlt className="w-2 h-2" /> : <FaBook className="w-2 h-2" />}
                                {isSub ? 'Sub' : 'Course'}
                              </span>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="shrink-0 text-right">
                            <span className="text-sm font-bold text-gray-900">{formatPrice(item.price)}</span>
                            {isSub && <span className="text-[10px] text-gray-400 block">/mo</span>}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}

                {/* ── Sticky bottom cart bar ── */}
                <AnimatePresence>
                  {selectedItems.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.2 }}
                      className="mt-6 rounded-xl border border-gray-200 bg-white shadow-lg p-4"
                    >
                      {/* Cart items — horizontal scrollable chips on mobile, list on larger */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedItems.map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700"
                          >
                            {item.name}
                            <span className="font-bold text-gray-900 ml-0.5">{formatPrice(item.price)}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removeItem(item.id)
                              }}
                              className="ml-0.5 p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <FaTimes className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">
                            {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'}
                          </span>
                          <span className="text-lg font-bold text-gray-900">{formatPrice(getTotal())}</span>
                        </div>
                        <button
                          onClick={handleNext}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm"
                        >
                          Continue
                          <FaArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-gray-400">
                        <FaLock className="w-2.5 h-2.5" />
                        Secured by PhonePe
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ──────── STEP 2: Consent & Terms ──────── */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="max-w-2xl mx-auto"
              >
                <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-8 shadow-sm space-y-5">
                  <h2 className="text-lg font-semibold text-gray-900">Consent & Terms</h2>

                  {/* Privacy Policy */}
                  <details className="group rounded-lg border border-gray-200 overflow-hidden">
                    <summary className="flex items-center justify-between cursor-pointer px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-900">
                      Student Consent & Privacy Policy
                      <FaArrowRight className="w-3 h-3 text-gray-400 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="px-4 py-3 max-h-52 overflow-y-auto text-xs text-gray-500 leading-relaxed space-y-2 border-t border-gray-100">
                      <p><strong className="text-gray-700">1. Information We Collect</strong> — Full name, contact details, educational background, parent/guardian details, payment information.</p>
                      <p><strong className="text-gray-700">2. How We Use Your Information</strong> — Personalized tutoring, study plans, certificates, progress tracking, notifications, and support.</p>
                      <p><strong className="text-gray-700">3. Data Sharing</strong> — We never sell your data. Shared only with trusted vendors under strict confidentiality.</p>
                      <p><strong className="text-gray-700">4. Data Security</strong> — SSL/TLS encryption, access-controlled storage, regular audits, incident response.</p>
                      <p><strong className="text-gray-700">5. Your Rights</strong> — Access, correct, delete, export your data, or opt out of marketing.</p>
                      <p><strong className="text-gray-700">6. Cookies</strong> — Used for login, analytics, and personalization. Manage via browser settings.</p>
                      <p><strong className="text-gray-700">7. Data Retention</strong> — Retained only as long as necessary; then securely deleted or anonymized.</p>
                      <p><strong className="text-gray-700">8. Contact</strong> — hello@smartlearners.ai | +91 6303974827 | 4th Floor, Veer Chambers, Prakash Nagar, Hyderabad-500016</p>
                    </div>
                  </details>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" name="studentConsent" checked={formData.studentConsent} onChange={handleInputChange} className="mt-0.5 accent-gray-900 w-4 h-4 rounded" />
                    <span className="text-sm text-gray-600 leading-snug">I, as a student, agree to use Smart Learners responsibly and accept the privacy policy.</span>
                  </label>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Student digital signature *</label>
                    <input type="text" name="studentSignature" value={formData.studentSignature} onChange={handleInputChange} className="input-dark" placeholder="Type your full name" required />
                  </div>

                  <hr className="border-gray-100" />

                  {/* Parental */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" name="parentalConsent" checked={formData.parentalConsent} onChange={handleInputChange} className="mt-0.5 accent-gray-900 w-4 h-4 rounded" />
                    <span className="text-sm text-gray-600 leading-snug">I, as a parent/guardian, consent to my child using Smart Learners and agree to monitor their progress.</span>
                  </label>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Parent/Guardian digital signature *</label>
                    <input type="text" name="parentSignature" value={formData.parentSignature} onChange={handleInputChange} className="input-dark" placeholder="Type parent/guardian full name" required />
                  </div>

                  <hr className="border-gray-100" />

                  {/* T&C */}
                  <details className="group rounded-lg border border-gray-200 overflow-hidden">
                    <summary className="flex items-center justify-between cursor-pointer px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-900">
                      Terms and Conditions
                      <FaArrowRight className="w-3 h-3 text-gray-400 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="px-4 py-3 max-h-52 overflow-y-auto text-xs text-gray-500 leading-relaxed space-y-2 border-t border-gray-100">
                      <p><strong className="text-gray-700">1. Legal Agreement</strong> — Binding agreement between you and Smart Learners.ai (Orcalex Technologies LLP).</p>
                      <p><strong className="text-gray-700">2. Service</strong> — AI-powered tutoring, assessments, analytics, courses for Classes 6-12 & JEE.</p>
                      <p><strong className="text-gray-700">3. Accounts</strong> — Accurate info required. One account per user. Under-18 needs parental consent.</p>
                      <p><strong className="text-gray-700">4. Acceptable Use</strong> — Personal learning only. No sharing credentials or distributing content.</p>
                      <p><strong className="text-gray-700">5. Payments</strong> — Secure third-party processing. Non-refundable except where required by law. Auto-renew unless cancelled.</p>
                      <p><strong className="text-gray-700">6. IP Rights</strong> — All content owned by Smart Learners.ai and protected by law.</p>
                      <p><strong className="text-gray-700">7-8. Privacy & Disclaimers</strong> — See privacy policy. No guarantee of specific academic outcomes.</p>
                      <p><strong className="text-gray-700">9. Termination</strong> — You may terminate anytime. We may suspend for violations or inactivity.</p>
                      <p><strong className="text-gray-700">10. Contact</strong> — hello@smartlearners.ai | +91 6303974827 | Mon-Sat, 9 AM - 6 PM IST</p>
                    </div>
                  </details>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleInputChange} className="mt-0.5 accent-gray-900 w-4 h-4 rounded" />
                    <span className="text-sm text-gray-600 leading-snug">I agree to all terms and conditions.</span>
                  </label>

                  {/* Nav */}
                  <div className="flex items-center justify-between pt-2">
                    <button onClick={handlePrevious} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
                      <FaArrowLeft className="w-3 h-3" /> Back
                    </button>
                    <button onClick={handleNext} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm">
                      Continue <FaArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ──────── STEP 3: Checkout ──────── */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="max-w-lg mx-auto"
              >
                <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-8 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-5">Order summary</h2>

                  {/* Items */}
                  <div className="divide-y divide-gray-100">
                    {selectedItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`shrink-0 w-1.5 h-1.5 rounded-full ${
                              item.item_type === 'SUBSCRIPTION' ? 'bg-purple-400' : 'bg-sky-400'
                            }`}
                          />
                          <span className="text-sm text-gray-700 truncate">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 shrink-0 ml-4">{formatPrice(item.price)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Coupon */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {couponApplied ? (
                      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center gap-2 text-xs">
                          <FaTag className="text-green-500 w-3 h-3" />
                          <span className="font-mono font-semibold text-green-700">{couponCode}</span>
                          <span className="text-green-600">applied</span>
                        </div>
                        <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                          placeholder="Coupon code"
                          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
                        />
                        <button onClick={handleApplyCoupon} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                          Apply
                        </button>
                      </div>
                    )}
                    {couponError && <p className="text-red-500 text-xs mt-1.5">{couponError}</p>}
                  </div>

                  {/* Total */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Total</span>
                    <span className="text-xl font-bold text-gray-900">{formatPrice(getTotal())}</span>
                  </div>

                  {/* Pay button */}
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className={`mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white transition-all shadow-sm ${
                      isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <FaSpinner className="animate-spin w-3.5 h-3.5" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaLock className="w-3 h-3" />
                        Pay {formatPrice(getTotal())}
                      </>
                    )}
                  </button>

                  {/* Trust bar */}
                  <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1"><FaShieldAlt className="w-2.5 h-2.5" /> SSL Encrypted</span>
                    <span className="flex items-center gap-1"><FaLock className="w-2.5 h-2.5" /> Secured by PhonePe</span>
                  </div>

                  {/* Back link */}
                  <div className="text-center mt-4">
                    <button onClick={handlePrevious} className="text-xs text-gray-400 hover:text-gray-700 transition-colors font-medium">
                      <FaArrowLeft className="w-2.5 h-2.5 inline mr-1" />Back to consent
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
