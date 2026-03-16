import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import AIDashboardHero from '../../components/marketing/AIDashboardHero'

const features = [
  {
    icon: '\u{1F916}',
    title: 'AI-Powered Learning',
    description:
      'Our AI analyzes every answer, identifies mistakes, and provides personalized explanations so your child learns from each error.',
    color: '#1a73e8',
    video: '/videos/ai-correction-demo.mp4',
  },
  {
    icon: '\u{1F4CA}',
    title: 'Gap Analysis',
    description:
      'Automatically identifies weak areas across subjects and creates targeted improvement plans to close knowledge gaps fast.',
    color: '#00A0E3',
    video: '/videos/exam-correction-demo.mp4',
  },
  {
    icon: '\u{1F4F1}',
    title: 'WhatsApp Updates',
    description:
      "Parents receive real-time updates on their child's progress directly on WhatsApp — no app install needed.",
    color: '#1e8e3e',
    video: '/videos/whatsapp-parental-demo.mp4',
  },
  {
    icon: '\u{1F4DD}',
    title: 'Step-by-Step Solutions',
    description:
      'Every question comes with detailed, step-by-step AI-generated solutions that teach the concept, not just the answer.',
    color: '#f9ab00',
    video: '/videos/self study.mp4',
  },
  {
    icon: '\u{1F4AC}',
    title: '24/7 AI Chatbot',
    description:
      'Ask doubts anytime and get instant, accurate answers from our AI tutor — available round the clock.',
    color: '#00bcd4',
    video: '/videos/chatbot-demo.mp4',
  },
]

export default function Features() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const videoRef = useRef(null)
  const timerRef = useRef(null)

  const AUTO_PLAY_DURATION = 8000 // 8 seconds per slide

  const goToSlide = useCallback(
    (index) => {
      setActiveIndex(index)
      setProgress(0)
    },
    []
  )

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % features.length)
    setProgress(0)
  }, [])

  // Auto-advance timer
  useEffect(() => {
    if (isPaused) return

    const interval = 50
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNext()
          return 0
        }
        return prev + (interval / AUTO_PLAY_DURATION) * 100
      })
    }, interval)

    return () => clearInterval(timerRef.current)
  }, [isPaused, activeIndex, goToNext])

  // Reset video when slide changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().catch(() => {})
    }
  }, [activeIndex])

  const active = features[activeIndex]

  return (
    <div className="min-h-screen bg-white marketing-page-bg">
      {/* Floating Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="marketing-orb marketing-orb--purple" style={{ width: 500, height: 500, top: '3%', left: '-12%' }} />
        <div className="marketing-orb marketing-orb--cyan" style={{ width: 400, height: 400, top: '45%', right: '-8%' }} />
        <div className="marketing-orb marketing-orb--pink" style={{ width: 350, height: 350, bottom: '5%', left: '20%' }} />
        <div className="marketing-orb marketing-orb--blue" style={{ width: 280, height: 280, top: '25%', right: '30%' }} />
      </div>

      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white hero-grid-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="badge badge-primary mb-6">Features</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Powerful Features for{' '}
              <span className="gradient-text">Smart Learning</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Everything your child needs to excel in academics, powered by
              cutting-edge AI technology.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Feature Showcase Carousel ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ── Tab Navigation ── */}
          <div className="feat-tabs">
            {features.map((f, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`feat-tab ${i === activeIndex ? 'feat-tab--active' : ''}`}
                style={
                  i === activeIndex
                    ? { '--tab-color': f.color }
                    : undefined
                }
              >
                <span className="feat-tab__icon">{f.icon}</span>
                <span className="feat-tab__label">{f.title}</span>
                {/* progress bar under active tab */}
                {i === activeIndex && (
                  <span
                    className="feat-tab__progress"
                    style={{ width: `${progress}%`, background: f.color }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── Slide Content ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="feat-slide"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Video */}
              <div className="feat-slide__video-wrap">
                <video
                  ref={videoRef}
                  className="feat-slide__video"
                  src={active.video}
                  muted
                  autoPlay
                  loop
                  playsInline
                />
                {/* Slide counter pill */}
                <span className="feat-slide__counter glass-pill-dark">
                  {activeIndex + 1} / {features.length}
                </span>
              </div>

              {/* Info */}
              <div className="feat-slide__info">
                <span
                  className="feat-slide__badge"
                  style={{ background: `${active.color}14`, color: active.color }}
                >
                  {active.icon} {active.title}
                </span>
                <h3 className="feat-slide__title">{active.title}</h3>
                <p className="feat-slide__desc">{active.description}</p>

                {/* Navigation arrows */}
                <div className="feat-slide__nav">
                  <button
                    onClick={() =>
                      goToSlide(
                        (activeIndex - 1 + features.length) % features.length
                      )
                    }
                    className="feat-slide__arrow"
                    aria-label="Previous feature"
                  >
                    &#8592;
                  </button>
                  <button
                    onClick={() => goToSlide((activeIndex + 1) % features.length)}
                    className="feat-slide__arrow"
                    aria-label="Next feature"
                  >
                    &#8594;
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── Dot indicators (mobile) ── */}
          <div className="feat-dots">
            {features.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`feat-dot ${i === activeIndex ? 'feat-dot--active' : ''}`}
                style={
                  i === activeIndex
                    ? { background: features[i].color }
                    : undefined
                }
                aria-label={`Go to feature ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <AIDashboardHero />

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cta-gradient p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Experience These Features?
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Start your free trial today and see the difference AI-powered
              learning can make.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/free-trial"
                className="button button--mimas text-lg px-8 py-4"
              >
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
