import React, { createContext, useContext, useState, useEffect } from 'react'

// UserType can be 'parent', 'school', or null
const UserTypeContext = createContext(undefined)

export function UserTypeProvider({ children }) {
  const [userType, setUserTypeState] = useState(null)

  useEffect(() => {
    // Load user type from localStorage on mount
    const savedType = localStorage.getItem('userType')
    if (savedType) {
      setUserTypeState(savedType)
    }
  }, [])

  const setUserType = (type) => {
    setUserTypeState(type)
    if (type) {
      localStorage.setItem('userType', type)
    } else {
      localStorage.removeItem('userType')
    }
  }

  return (
    <UserTypeContext.Provider value={{ userType, setUserType }}>
      {children}
    </UserTypeContext.Provider>
  )
}

export function useUserType() {
  const context = useContext(UserTypeContext)
  if (context === undefined) {
    throw new Error('useUserType must be used within a UserTypeProvider')
  }
  return context
}

export default UserTypeContext
