import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaCheckCircle, FaSpinner, FaTimesCircle, FaArrowRight } from 'react-icons/fa'
import { useGetPaymentStatusQuery } from '../../store/api/commerceApi'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const paymentId = searchParams.get('payment_id')

  const [countdown, setCountdown] = useState(5)

  const {
    data: paymentStatus,
    isLoading,
    isError,
  } = useGetPaymentStatusQuery(paymentId, {
    skip: !paymentId,
  })

  const isSuccess = paymentStatus?.payment_status === 'SUCCESS'

  // Auto-redirect countdown
  useEffect(() => {
    if (!isSuccess) return
    if (countdown <= 0) {
      navigate('/student-dash')
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [isSuccess, countdown, navigate])

  const formatPrice = (price) => {
    if (!price) return ''
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.15),transparent_50%)]" />
        </div>
        <div className="text-center relative z-10">
          <FaSpinner className="animate-spin text-5xl text-blue-500 mx-auto mb-4" />
          <p className="text-xl text-gray-900">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  if (!paymentId || isError || !paymentStatus || !isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(239,68,68,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.15),transparent_50%)]" />
        </div>

        <div className="relative z-10 px-4">
          <div className="glass-card-premium max-w-md p-8 bg-white backdrop-blur-lg border border-gray-200">
            <div className="text-center">
              <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2 text-gray-900">Payment {paymentStatus?.payment_status === 'PENDING' ? 'Pending' : 'Failed'}</h1>
              <p className="mb-2 text-gray-600">
                {paymentStatus?.payment_status === 'PENDING'
                  ? 'Your payment is still being processed. Please check back in a few moments.'
                  : 'Your payment could not be processed. Please try again.'}
              </p>
              {paymentStatus?.order_status && (
                <p className="text-sm text-gray-500 mb-6">Order status: {paymentStatus.order_status}</p>
              )}
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
    <div className="min-h-screen pt-20 relative overflow-hidden marketing-page-bg">
      {/* Floating Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="marketing-orb marketing-orb--blue" style={{ width: 400, height: 400, top: '10%', left: '-5%' }} />
        <div className="marketing-orb marketing-orb--purple" style={{ width: 350, height: 350, bottom: '10%', right: '-5%' }} />
        <div className="marketing-orb marketing-orb--cyan" style={{ width: 280, height: 280, top: '40%', right: '15%' }} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="glass-card-premium p-8 bg-white backdrop-blur-lg shadow-xl border border-gray-200">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FaCheckCircle className="text-4xl text-white" />
                </div>
              </motion.div>

              <h1 className="text-3xl font-bold mb-2 text-gray-900">Payment Successful!</h1>
              <p className="text-gray-500">Your enrollment is confirmed. Welcome to Smart Learners!</p>
            </div>

            {/* Payment Details */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Payment Details
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Payment Status</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    <FaCheckCircle className="w-3 h-3" />
                    {paymentStatus.payment_status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Order Status</span>
                  <span className="font-medium text-gray-900">{paymentStatus.order_status}</span>
                </div>
                {paymentStatus.amount && (
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-gray-900 font-semibold">Amount Paid</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(paymentStatus.amount)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Auto-redirect notice */}
            <div className="text-center mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700">
                Redirecting to your dashboard in{' '}
                <span className="font-bold text-blue-900">{countdown}</span> seconds...
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/student-dash"
                className="button button--mimas text-center flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #22c55e, #10b981)' }}
              >
                <span>Go to Dashboard</span>
                <FaArrowRight />
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
