import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaUser, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { marketingApi } from '../../api/axiosInstance'

export default function FreeTrial() {
  const [formData, setFormData] = useState({
    fullName: '',
    className: '',
    whatsappNumber: '',
    username: '',
    password: '',
    termsAccepted: false
  })

  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validateForm = () => {
    if (!formData.fullName || !formData.whatsappNumber || !formData.username || !formData.password) {
      toast.error('Please fill in all required fields')
      return false
    }
    if (!/^[0-9]{10}$/.test(formData.whatsappNumber)) {
      toast.error('Please enter a valid 10-digit WhatsApp number')
      return false
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return false
    }
    if (!formData.termsAccepted) {
      toast.error('Please accept the Terms and Conditions')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const payload = {
          fullname: formData.fullName,
          email: `${formData.username}@smartlearners.ai`,
          username: formData.username,
          phone_number: formData.whatsappNumber,
          payment_done: false,
          password: formData.password,
          ...(formData.className && { class_name: formData.className })
        }

        console.log('Starting free trial registration...', payload)

        const data = await marketingApi.createFreeTrialUser(payload)
        console.log('Registration successful:', data)

        if (data.success && data.status === 'success') {
          toast.success(
            <div className="flex flex-col gap-2">
              <div className="font-bold text-lg text-green-700">
                Free Trial Registration Successful!
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Username:</span>
                  <span className="text-blue-600 font-medium">{data.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Password:</span>
                  <span className="text-blue-600 font-medium">{formData.password}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Trial expires:</span>
                  <span className="text-gray-600">{new Date(data.trial_expiry_date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <a
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium underline text-sm"
                >
                  Login now →
                </a>
              </div>
            </div>,
            {
              duration: 8000,
              style: {
                maxWidth: '500px',
                padding: '16px',
              },
            }
          )
          // Reset form
          setFormData({
            fullName: '',
            className: '',
            whatsappNumber: '',
            username: '',
            password: '',
            termsAccepted: false
          })
        } else {
          throw new Error(data.detail || data.error || 'Registration failed')
        }
      } catch (error) {
        console.error('Error submitting form:', error)
        let errorMessage = 'Unknown error occurred'
        if (error instanceof Error) {
          errorMessage = error.message
        } else if (typeof error === 'string') {
          errorMessage = error
        }
        toast.error(errorMessage, {
          duration: 5000,
          style: {
            maxWidth: '500px',
          },
        })
      }
    }
  }

  return (
    <div className="min-h-screen pt-20 relative overflow-hidden">
      {/* Floating background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
        <div className="absolute rounded-full" style={{ width: 400, height: 400, background: '#e8f0fe', top: '10%', left: '-10%', filter: 'blur(80px)', opacity: 0.6 }} />
        <div className="absolute rounded-full" style={{ width: 300, height: 300, background: '#fce8f4', top: '60%', right: '-5%', filter: 'blur(80px)', opacity: 0.6 }} />
        <div className="absolute rounded-full" style={{ width: 250, height: 250, background: '#e6f4ea', bottom: '10%', left: '30%', filter: 'blur(80px)', opacity: 0.6 }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
            Start Your <span className="gradient-text">Free Trial</span>
          </h1>
          <p className="text-center text-gray-600 mb-8 text-lg">
            Experience Smart Learners AI-powered platform with a free trial - no payment required!
          </p>

          <div className="glass-card p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
                <FaUser />
              </div>
              <div className="ml-3">
                <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="input-dark"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Class Name
                </label>
                <select
                  name="className"
                  value={formData.className}
                  onChange={handleInputChange}
                  className="input-dark"
                >
                  <option value="">Select Class</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  WhatsApp Mobile Number *
                </label>
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleInputChange}
                  className="input-dark"
                  placeholder="10-digit WhatsApp number"
                  maxLength={10}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="input-dark"
                  placeholder="Choose a username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-dark pr-12"
                    placeholder="Minimum 8 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="mt-4">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleInputChange}
                    className="mt-1 mr-3 w-4 h-4 accent-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-300">
                    I agree to the{' '}
                    <Link
                      to="/terms"
                      className="text-blue-400 hover:text-blue-300 underline"
                      target="_blank"
                    >
                      Terms and Conditions
                    </Link>
                    {' '}and{' '}
                    <Link
                      to="/privacy"
                      className="text-blue-400 hover:text-blue-300 underline"
                      target="_blank"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={handleSubmit}
                className="button button--mimas flex items-center text-lg px-8 py-3"
              >
                <span className="flex items-center">Start Free Trial <FaArrowRight className="ml-2" /></span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
