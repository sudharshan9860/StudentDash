import { Toaster } from 'react-hot-toast'
import Navbar from '../marketing/Navbar'
import Footer from '../marketing/Footer'

export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#202124',
            border: '1px solid #e8eaed',
            boxShadow: '0 4px 12px rgba(60, 64, 67, 0.15)',
          },
          success: {
            iconTheme: {
              primary: '#1e8e3e',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#d93025',
              secondary: '#ffffff',
            },
          },
        }}
      />

      {/* Navigation */}
      <Navbar />

      {/* Main Content - Add padding for fixed navbar */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
