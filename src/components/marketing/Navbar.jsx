import { useState, useEffect, useContext } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthContext } from '../AuthContext'
import { ChevronDown, Menu, X, ArrowRight, LayoutGrid } from 'lucide-react'

export default function Navbar() {
  const { isAuthenticated, role, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'Courses', href: '/courses' },
    {
      name: 'Solutions',
      href: '#',
      submenu: [
        { name: 'For Students', href: '/students', desc: 'AI Chatbot, Gap Analysis, Test Prep', icon: '\uD83C\uDF93' },
        { name: 'For Schools', href: '/schools', desc: 'Assessment & Analytics Platform', icon: '\uD83C\uDFEB' },
      ]
    },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  const dashboardLinks = role === 'teacher' ? [
    { name: 'Dashboard', href: '/student-dash' },
    { name: 'Exam Correction', href: '/teacher-dash?tab=exam-correction' },
    { name: 'Homework', href: '/teacher-dash?tab=exercise' },
    { name: 'Analytics', href: '/teacher-dash?tab=class' },
  ] : [
    { name: 'Dashboard', href: '/student-dash' },
    { name: 'JEE Prep', href: '/jee-dashboard' },
    { name: 'Test Prep', href: '/exam-mode' },
    { name: 'Analytics', href: '/analytics' },
  ]

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      isScrolled ? 'bg-[#0B1120]/95 backdrop-blur-xl shadow-lg' : 'bg-[#0B1120]'
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
              <span className="text-xl lg:text-xl font-bold text-white group-hover:text-[#00A0E3] transition-colors">
                SmartLearners<span className="text-[#00A0E3]">.ai</span>
              </span>
              <span className="text-[9px] text-gray-400 -mt-0.5  sm:block">AI-Powered Learning</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className=" md:flex items-center gap-1">
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
                      activeDropdown === link.name ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}>
                      {link.name}
                      <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === link.name ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {activeDropdown === link.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-1 w-64 rounded-xl border border-gray-700 p-2 shadow-lg bg-[#0B1120]"
                        >
                          {link.submenu.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors group"
                            >
                              <span className="text-xl">{item.icon}</span>
                              <div>
                                <span className="font-medium text-white block group-hover:text-[#00A0E3] transition-colors">{item.name}</span>
                                <span className="text-xs text-gray-400">{item.desc}</span>
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
                        ? 'text-[#00A0E3] bg-[#00A0E3]/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Auth/Dashboard Section */}
          <div className=" md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown('dashboard')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1 rounded-lg ${
                    activeDropdown === 'dashboard' ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}>
                    <LayoutGrid className="w-4 h-4" />
                    My Learning
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'dashboard' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === 'dashboard' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-1 w-48 rounded-xl border border-gray-700 p-2 shadow-lg bg-[#0B1120]"
                      >
                        {dashboardLinks.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            {item.name}
                          </Link>
                        ))}
                        <div className="border-t border-gray-700 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          >
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={handleGoToDashboard}
                  className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all bg-[#00A0E3] hover:bg-[#0080B8] hover:shadow-md flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  Login
                </Link>
                <Link
                  to="/free-trial"
                  className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-all bg-[#00A0E3] hover:bg-[#0080B8] hover:shadow-md"
                >
                  Register
                </Link>
                <Link
                  to="/get-started"
                  className="px-4 py-2 text-sm font-semibold rounded-lg text-[#0B1120] transition-all bg-white hover:bg-gray-100 hover:shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 text-gray-300 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
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
            className="md:hidden bg-[#0B1120] border-t border-gray-800 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.submenu ? (
                    <div className="py-1">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === link.name ? null : link.name)}
                        className="w-full flex items-center justify-between px-4 py-3 font-medium text-white rounded-lg hover:bg-white/5 transition-colors"
                      >
                        {link.name}
                        <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === link.name ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {activeDropdown === link.name && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="ml-4 border-l-2 border-[#00A0E3] pl-4 mt-1 space-y-1"
                          >
                            {link.submenu.map((item) => (
                              <Link
                                key={item.name}
                                to={item.href}
                                className="flex items-center gap-3 py-2 px-3 text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
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
                          ? 'text-[#00A0E3] bg-[#00A0E3]/10'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}

              <div className="border-t border-gray-800 my-3"></div>

              {isAuthenticated ? (
                <>
                  <div className="py-1">
                    <span className="block px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {role === 'teacher' ? 'Teacher Dashboard' : 'My Learning'}
                    </span>
                    {dashboardLinks.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
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
                      className="w-full px-4 py-3 text-sm font-semibold rounded-xl text-white text-center bg-[#00A0E3] hover:bg-[#0080B8] flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Go to Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 rounded-xl border border-red-800 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-3 space-y-2">
                  <Link
                    to="/login"
                    className="block w-full px-4 py-3 rounded-xl border border-gray-700 text-sm text-center text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/free-trial"
                    className="block w-full px-4 py-3 text-sm font-semibold rounded-xl text-white text-center bg-[#00A0E3] hover:bg-[#0080B8]"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register Free
                  </Link>
                  <Link
                    to="/get-started"
                    className="block w-full px-4 py-3 text-sm font-semibold rounded-xl text-[#0B1120] text-center bg-white hover:bg-gray-100"
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
