import { motion } from 'framer-motion'
import { useUserType } from '../../contexts/UserTypeContext'

export default function UserTypeSelection() {
  const { setUserType } = useUserType()

  const handleSelection = (type) => {
    setUserType(type)
    // Scroll to top after selection to show the hero first
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="py-4 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-1 text-gray-900">
              Are you a <span className="gradient-text">Parent</span> or <span className="gradient-text">School Management</span>?
            </h2>
            <p className="text-sm text-gray-600">
              Select the option that best describes you
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {/* Parent / Student Option */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => handleSelection('parent')}
              className="cursor-pointer group relative overflow-hidden rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-lg"
            >
              <div className="relative z-10 p-4">
                {/* Image Container */}
                <div className="w-full h-28 md:h-32 relative mb-3 rounded-lg overflow-hidden group-hover:scale-[1.02] transition-transform duration-300 flex items-center justify-center bg-white/50">
                  <img
                    src="/images/parent-student.png"
                    alt="Parent and Student"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 text-center">
                  Parent / Student
                </h2>

                <div className="text-center">
                  <button className="px-5 py-2 rounded-lg font-semibold text-white text-sm transition-all bg-blue-600 hover:bg-blue-700 hover:shadow-md">
                    Select Parent/Student
                  </button>
                </div>
              </div>
            </motion.div>

            {/* School Management Option */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => handleSelection('school')}
              className="cursor-pointer group relative overflow-hidden rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg"
            >
              <div className="relative z-10 p-4">
                {/* Image Container */}
                <div className="w-full h-28 md:h-32 relative mb-3 rounded-lg overflow-hidden group-hover:scale-[1.02] transition-transform duration-300 flex items-center justify-center bg-white/50">
                  <img
                    src="/images/school-management.png"
                    alt="School Management"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 text-center">
                  School Management
                </h2>

                <div className="text-center">
                  <button className="px-5 py-2 rounded-lg font-semibold text-white text-sm transition-all bg-purple-600 hover:bg-purple-700 hover:shadow-md">
                    Select School
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
