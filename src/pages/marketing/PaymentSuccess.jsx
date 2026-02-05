import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaCheckCircle, FaUser, FaLock, FaCopy, FaSpinner, FaTimesCircle } from 'react-icons/fa'
import { marketingApi } from '../../api/axiosInstance'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')

  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [copied, setCopied] = useState({ username: false, password: false })

  useEffect(() => {
    if (orderId) {
      checkPaymentStatus()
    } else {
      setLoading(false)
    }
  }, [orderId])

  const checkPaymentStatus = async () => {
    try {
      console.log('Checking payment status for order:', orderId)
      const data = await marketingApi.checkPaymentStatus(orderId)
      console.log('Payment status data:', data)
      setPaymentStatus(data)
    } catch (error) {
      console.error('Error checking payment status:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopied({ ...copied, [field]: true })
    setTimeout(() => {
      setCopied({ ...copied, [field]: false })
    }, 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Dark Navy Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.15),transparent_50%)]" />
        </div>
        <div className="text-center relative z-10">
          <FaSpinner className="animate-spin text-5xl text-blue-500 mx-auto mb-4" />
          <p className="text-xl text-gray-900">Checking payment status...</p>
        </div>
      </div>
    )
  }

  if (!paymentStatus || !paymentStatus.success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        {/* Dark Navy Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(239,68,68,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.15),transparent_50%)]" />
        </div>

        <div className="relative z-10 px-4">
          <div className="glass-card max-w-md p-8 bg-white backdrop-blur-lg border border-gray-200">
            <div className="text-center">
              <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4 text-red-400">Payment Failed</h1>
              <p className="mb-6 text-gray-600">Your payment could not be processed. Please try again.</p>
              <Link to="/get-started" className="button button--mimas">
                <span>Try Again</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 relative overflow-hidden">
      {/* Dark Navy Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_50%)]" />
      </div>

      {/* Floating shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="max-w-2xl mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-card p-8 bg-[#1a1f3a]/90 backdrop-blur-lg shadow-2xl border border-gray-700/50">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FaCheckCircle className="text-4xl text-gray-900" />
                </div>
              </motion.div>

              <h1 className="text-3xl font-bold mb-2 text-gray-900">Payment Successful!</h1>
              <p className="text-gray-500">Welcome to Smart Learners! Your account has been created.</p>
            </div>

            <div className="bg-[#0f1628] rounded-xl p-6 mb-6 border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                <span className="w-2 h-2 bg-green-200 rounded-full mr-2"></span>
                Your Login Credentials
              </h2>

              <div className="space-y-4">
                {/* Username Field */}
                <div className="flex items-center justify-between bg-[#1a1f3a] rounded-lg p-4 border border-gray-600/50">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-4">
                      <FaUser className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="font-mono font-bold text-lg text-gray-900">{paymentStatus.credentials?.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(paymentStatus.credentials?.username, 'username')}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 hover:text-blue-300 transition-all flex items-center gap-2"
                  >
                    {copied.username ? (
                      <span className="text-green-400">Copied!</span>
                    ) : (
                      <>
                        <FaCopy />
                        <span className="hidden sm:inline">Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Password Field */}
                <div className="flex items-center justify-between bg-[#1a1f3a] rounded-lg p-4 border border-gray-600/50">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-200/20 rounded-lg flex items-center justify-center mr-4">
                      <FaLock className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Password</p>
                      <p className="font-mono font-bold text-lg text-gray-900">{paymentStatus.credentials?.password}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(paymentStatus.credentials?.password, 'password')}
                    className="px-4 py-2 bg-purple-200/20 hover:bg-purple-200/30 rounded-lg text-purple-400 hover:text-purple-300 transition-all flex items-center gap-2"
                  >
                    {copied.password ? (
                      <span className="text-green-400">Copied!</span>
                    ) : (
                      <>
                        <FaCopy />
                        <span className="hidden sm:inline">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-300">
                  <strong>Important:</strong> Please save these credentials securely. You can change your password after logging in.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" className="button button--mimas text-center" style={{ background: 'linear-gradient(135deg, #22c55e, #10b981)' }}>
                <span>Go to Login</span>
              </Link>
              <Link to="/" className="btn-secondary text-center">
                Go to Homepage
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
