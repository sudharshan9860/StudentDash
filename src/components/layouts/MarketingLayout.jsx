import { Toaster } from 'react-hot-toast'
import Navbar from '../marketing/Navbar'
import Footer from '../marketing/Footer'

export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen bg-white text-[#0B1120] font-sans">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#0B1120',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(11, 17, 32, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />

      <Navbar />

      <main className="pt-20">
        {children}
      </main>

      <Footer />
    </div>
  )
}
