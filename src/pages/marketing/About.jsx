import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const teamMembers = [
  {
    name: 'Preeti Kolhe',
    role: 'CEO & Founder',
    qualification: 'B.A',
    image: '&#x1F469;&#x200D;&#x1F4BC;',
    description: 'Visionary leader driving the mission to transform education through AI-powered learning solutions.',
    color: '#00A0E3'
  },
  {
    name: 'Praveen Jambholkar',
    role: 'CTO & Co-Founder',
    qualification: 'Ph.D',
    image: '&#x1F468;&#x200D;&#x1F4BB;',
    description: 'Technology expert leading the development of cutting-edge AI and machine learning systems.',
    color: '#a855f7'
  },
]

const values = [
  { icon: '&#x1F3AF;', title: 'Student-Centric', desc: 'Every decision we make puts students first.' },
  { icon: '&#x1F4A1;', title: 'Innovation', desc: 'Continuously improving with latest AI technology.' },
  { icon: '&#x1F30D;', title: 'Accessibility', desc: 'Quality education available to everyone.' },
  { icon: '&#x2B50;', title: 'Excellence', desc: 'Committed to the highest standards.' },
]

const milestones = [
  { year: '2021', title: 'Founded', desc: 'SmartLearners.ai was born with a vision to transform education' },
  { year: '2022', title: '10K Students', desc: 'Reached our first major milestone of 10,000 active students' },
  { year: '2023', title: '100+ Schools', desc: 'Partnered with over 100 schools across India' },
  { year: '2024', title: '50K+ Students', desc: 'Growing strong with 50,000+ students and 200+ schools' },
]

const VIDEO_PATHS = [
  '/videos/getstarted.mp4',
  '/getstarted.mp4',
]

export default function About() {
  const [showDemo, setShowDemo] = useState(false)
  const [videoUrl, setVideoUrl] = useState(null)
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoError, setVideoError] = useState(null)
  const videoRef = useRef(null)

  const loadVideo = useCallback(async () => {
    setVideoLoading(true)
    setVideoError(null)

    for (const path of VIDEO_PATHS) {
      try {
        const res = await fetch(path)
        const contentType = res.headers.get('content-type') || ''

        // Skip if server returned HTML instead of video
        if (contentType.includes('text/html')) continue

        if (res.ok && contentType.includes('video')) {
          const blob = await res.blob()
          const blobUrl = URL.createObjectURL(blob)
          setVideoUrl(blobUrl)
          setVideoLoading(false)
          return
        }
      } catch {
        continue
      }
    }

    // All paths failed — try Vite asset import as last resort
    try {
      const mod = await import('../../assets/videos/getstarted.mp4')
      const assetUrl = mod.default || mod
      const res = await fetch(assetUrl)
      const contentType = res.headers.get('content-type') || ''
      if (res.ok && !contentType.includes('text/html')) {
        const blob = await res.blob()
        setVideoUrl(URL.createObjectURL(blob))
        setVideoLoading(false)
        return
      }
    } catch {
      // ignore
    }

    setVideoError('Unable to load video. Please try again later.')
    setVideoLoading(false)
  }, [])

  useEffect(() => {
    if (showDemo && !videoUrl && !videoLoading) {
      loadVideo()
    }
  }, [showDemo, videoUrl, videoLoading, loadVideo])

  useEffect(() => {
    if (!showDemo && videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
    // Cleanup blob URL on unmount
    return () => {
      if (!showDemo && videoUrl) {
        URL.revokeObjectURL(videoUrl)
        setVideoUrl(null)
      }
    }
  }, [showDemo])

  return (
    <div className="min-h-screen bg-white overflow-hidden marketing-page-bg">
      {/* Floating Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="marketing-orb marketing-orb--purple" style={{ width: 500, height: 500, top: '5%', left: '-10%' }} />
        <div className="marketing-orb marketing-orb--cyan" style={{ width: 400, height: 400, top: '55%', right: '-8%' }} />
        <div className="marketing-orb marketing-orb--pink" style={{ width: 350, height: 350, bottom: '10%', left: '30%' }} />
      </div>

      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white relative hero-grid-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="badge badge-primary mb-6">
              About Us
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">
              Transforming Education with <span className="gradient-text">AI Technology</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              SmartLearners.ai is an initiative by <span className="text-blue-600 font-semibold">Orcalex Technologies LLP</span> to revolutionize how students learn and schools teach using artificial intelligence.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Company Info - Mission & Vision */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Our <span className="gradient-text">Mission</span></h2>
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                At SmartLearners.ai, we believe every student deserves access to personalized, high-quality education. Our AI-powered platform adapts to each learner's unique needs, making education more effective and engaging.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Developed by <span className="text-blue-600 font-semibold">Orcalex Technologies LLP</span>, we combine cutting-edge artificial intelligence with deep educational expertise to create learning experiences that truly make a difference.
              </p>
              <div className="flex items-center gap-4">
                <div className="glass-card-premium px-6 py-4 text-center">
                  <div className="text-3xl font-bold gradient-text">50K+</div>
                  <div className="text-gray-500 text-sm">Students</div>
                </div>
                <div className="glass-card-premium px-6 py-4 text-center">
                  <div className="text-3xl font-bold gradient-text">200+</div>
                  <div className="text-gray-500 text-sm">Schools</div>
                </div>
                <div className="glass-card-premium px-6 py-4 text-center">
                  <div className="text-3xl font-bold gradient-text">95%</div>
                  <div className="text-gray-500 text-sm">Success Rate</div>
                </div>
              </div>
            </div>
            <div className="glass-card-premium p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                To become India's most trusted AI-powered education platform, empowering millions of students to achieve their academic goals and build a brighter future.
              </p>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-blue-600 font-medium">Goal 2025</p>
                <p className="text-gray-700">Reach 1 million students across 1000+ schools in India</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Our <span className="gradient-text">Leadership Team</span></h2>
            <p className="text-xl text-gray-600">Meet the visionaries behind SmartLearners.ai</p>
            <p className="text-gray-500 mt-2">A product of <span className="text-blue-600">Orcalex Technologies LLP</span></p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card-premium p-8 text-center hover-lift"
              >
                {/* Avatar */}
                <div
                  className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl mb-6"
                  style={{ background: `${member.color}15`, border: `2px solid ${member.color}40` }}
                  dangerouslySetInnerHTML={{ __html: member.image }}
                />

                {/* Name & Role */}
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-semibold mb-1">{member.role}</p>
                <p className="text-gray-500 text-sm mb-4">{member.qualification}</p>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">{member.description}</p>

                {/* Decorative line */}
                <div className="mt-6 h-1 w-16 mx-auto rounded-full" style={{ background: `linear-gradient(90deg, ${member.color}, transparent)` }}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Orcalex Technologies Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card-premium p-8 md:p-12 text-center max-w-4xl mx-auto">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-600 flex items-center justify-center mb-6 shadow-lg">
              <span className="text-4xl text-white">O</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              <span className="gradient-text">Orcalex Technologies LLP</span>
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              The Parent Company Behind SmartLearners.ai
            </p>
            <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
              Orcalex Technologies LLP is a technology company focused on building innovative solutions
              that solve real-world problems. SmartLearners.ai is our flagship product in the EdTech space,
              designed to make quality education accessible to every student in India.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-6 py-3 rounded-full bg-blue-50 border border-blue-200 text-blue-600">
                EdTech Innovation
              </div>
              <div className="px-6 py-3 rounded-full bg-purple-50 border border-purple-200 text-purple-600">
                AI & Machine Learning
              </div>
              <div className="px-6 py-3 rounded-full bg-pink-50 border border-pink-200 text-pink-600">
                Educational Solutions
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Our Core <span className="gradient-text">Values</span></h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card-premium p-6 text-center hover-lift"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 flex items-center justify-center text-2xl mb-4" dangerouslySetInnerHTML={{ __html: value.icon }} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline / Journey */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Our <span className="gradient-text">Journey</span></h2>
            <p className="text-xl text-gray-600">Milestones that define our growth</p>
          </div>

          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-6 mb-8"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {milestone.year}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 h-full bg-gradient-to-b from-blue-400 to-transparent mt-2"></div>
                  )}
                </div>
                <div className="glass-card-premium p-6 flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cta-gradient p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-40 h-40 bg-blue-200/40 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-200/40 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Join Our Mission</h2>
              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">Be part of the education revolution. Start learning with SmartLearners.ai today.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/signup" className="button button--mimas text-lg px-8 py-4"><span>Get Started Free</span></Link>
                <button
                  onClick={() => setShowDemo(true)}
                  className="btn-secondary text-lg px-8 py-4"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  Watch Demo
                </button>
                <Link to="/contact" className="btn-secondary text-lg px-8 py-4">Contact Us</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Modal */}
      {showDemo && (
        <div
          onClick={() => setShowDemo(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%', maxWidth: '900px',
              borderRadius: '16px', overflow: 'hidden',
              background: '#000',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            }}
          >
            <button
              onClick={() => setShowDemo(false)}
              style={{
                position: 'absolute', top: '12px', right: '12px', zIndex: 10,
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)',
                border: 'none', color: '#fff', fontSize: '20px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              &times;
            </button>
            {videoLoading && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '80px 20px', color: '#fff', fontSize: '16px',
                flexDirection: 'column', gap: '16px',
              }}>
                <div style={{
                  width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.2)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                Loading video...
              </div>
            )}
            {videoError && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '80px 20px', color: '#f87171', fontSize: '16px',
                flexDirection: 'column', gap: '12px',
              }}>
                <span>{videoError}</span>
                <button onClick={loadVideo} style={{
                  padding: '8px 20px', borderRadius: '8px', border: '1px solid #f87171',
                  background: 'transparent', color: '#f87171', cursor: 'pointer',
                }}>Retry</button>
              </div>
            )}
            {videoUrl && !videoLoading && (
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                autoPlay
                playsInline
                style={{ width: '100%', display: 'block' }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
