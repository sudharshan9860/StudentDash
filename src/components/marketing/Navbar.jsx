import { useState, useEffect, useContext } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthContext } from '../AuthContext'

export default function Navbar() {
  const { isAuthenticated, role, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)

  // All navigation links - always visible
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'Courses', href: '/courses' },
    {
      name: 'Solutions',
      href: '#',
      submenu: [
        { name: 'For Students', href: '/students', desc: 'AI Chatbot, Gap Analysis, Exam Prep', icon: '🎓' },
        { name: 'For Schools', href: '/schools', desc: 'Assessment & Analytics Platform', icon: '🏫' },
      ]
    },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  // Dashboard navigation links for authenticated users
  const dashboardLinks = role === 'teacher' ? [
    { name: 'Dashboard', href: '/student-dash' },
    { name: 'Exam Correction', href: '/teacher-dash?tab=exam-correction' },
    { name: 'Homework', href: '/teacher-dash?tab=exercise' },
    { name: 'Analytics', href: '/teacher-dash?tab=class' },
  ] : [
    { name: 'Dashboard', href: '/student-dash' },
    { name: 'JEE Prep', href: '/jee-dashboard' },
    { name: 'Exam Mode', href: '/exam-mode' },
    { name: 'Analytics', href: '/analytics' },
  ]

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu and scroll to top on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  const handleGoToDashboard = () => {
    if (role === 'teacher') {
      navigate('/teacher-dash')
    } else {
      navigate('/student-dash')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMobileMenuOpen(false)
  }

  const isActiveLink = (href) => {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 [&_a]:no-underline ${
      isScrolled ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm' : 'bg-white/80 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-xl overflow-hidden flex items-center justify-center p-1">
              <img
                src="/logo.png"
                alt="SmartLearners.ai"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl lg:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                SmartLearners<span className="text-blue-600">.ai</span>
              </span>
              <span className="text-[9px] text-gray-500 -mt-0.5 hidden sm:block">AI-Powered Learning</span>
            </div>
          </Link>

          {/* Desktop Navigation - visible on screens >= 768px */}
          <div className="desktop-nav-links">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => link.submenu && setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {link.submenu ? (
                  <>
                    <button className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1 rounded-lg ${
                      activeDropdown === link.name ? 'text-gray-900 bg-gray-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}>
                      {link.name}
                      <svg className={`w-4 h-4 transition-transform ${activeDropdown === link.name ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {activeDropdown === link.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-1 w-64 rounded-xl border border-gray-200 p-2 shadow-lg bg-white"
                        >
                          {link.submenu.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                              <span className="text-xl">{item.icon}</span>
                              <div>
                                <span className="font-medium text-gray-900 block group-hover:text-blue-600 transition-colors">{item.name}</span>
                                <span className="text-xs text-gray-500">{item.desc}</span>
                              </div>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    to={link.href}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActiveLink(link.href)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Auth/Dashboard Section */}
          <div className="desktop-auth-section">
            {isAuthenticated ? (
              <>
                {/* Quick Dashboard Links Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown('dashboard')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1 rounded-lg ${
                    activeDropdown === 'dashboard' ? 'text-gray-900 bg-gray-100' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    My Learning
                    <svg className={`w-4 h-4 transition-transform ${activeDropdown === 'dashboard' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <AnimatePresence>
                    {activeDropdown === 'dashboard' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-1 w-48 rounded-xl border border-gray-200 p-2 shadow-lg bg-white"
                      >
                        {dashboardLinks.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                          >
                            {item.name}
                          </Link>
                        ))}
                        <div className="border-t border-gray-200 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                          >
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Go to Dashboard Button */}
                <button
                  onClick={handleGoToDashboard}
                  className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all bg-green-600 hover:bg-green-700 hover:shadow-md flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/free-trial"
                  className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-all bg-green-600 hover:bg-green-700 hover:shadow-md"
                >
                  Register
                </Link>
                <Link
                  to="/get-started"
                  className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mobile-menu-container bg-white border-t border-gray-200 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {/* Main Navigation Links */}
              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.submenu ? (
                    <div className="py-1">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === link.name ? null : link.name)}
                        className="w-full flex items-center justify-between px-4 py-3 font-medium text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {link.name}
                        <svg className={`w-4 h-4 transition-transform ${activeDropdown === link.name ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <AnimatePresence>
                        {activeDropdown === link.name && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="ml-4 border-l-2 border-blue-200 pl-4 mt-1 space-y-1"
                          >
                            {link.submenu.map((item) => (
                              <Link
                                key={item.name}
                                to={item.href}
                                className="flex items-center gap-3 py-2 px-3 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <span>{item.icon}</span>
                                <div>
                                  <span className="block font-medium">{item.name}</span>
                                  <span className="text-xs text-gray-500">{item.desc}</span>
                                </div>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      to={link.href}
                      className={`block px-4 py-3 font-medium rounded-lg transition-colors ${
                        isActiveLink(link.href)
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}

              {/* Divider */}
              <div className="border-t border-gray-200 my-3"></div>

              {/* Auth Section */}
              {isAuthenticated ? (
                <>
                  {/* Dashboard Quick Links */}
                  <div className="py-1">
                    <span className="block px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {role === 'teacher' ? 'Teacher Dashboard' : 'My Learning'}
                    </span>
                    {dashboardLinks.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  <div className="pt-3 space-y-2">
                    <button
                      onClick={() => {
                        handleGoToDashboard()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full px-4 py-3 text-sm font-semibold rounded-xl text-white text-center bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      Go to Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 rounded-xl border border-red-200 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-3 space-y-2">
                  <Link
                    to="/login"
                    className="block w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/free-trial"
                    className="block w-full px-4 py-3 text-sm font-semibold rounded-xl text-white text-center bg-green-600 hover:bg-green-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register Free
                  </Link>
                  <Link
                    to="/get-started"
                    className="block w-full px-4 py-3 text-sm font-semibold rounded-xl text-white text-center bg-blue-600 hover:bg-blue-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Subscription
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
