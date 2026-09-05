import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AdminPage from './pages/AdminPage'

// Support/contribution is now embedded inside the registration form.
// The separate /support route is removed.
export const RegistrationContext = React.createContext(null)

export default function App() {
  const [registrationData, setRegistrationData] = useState(null)

  return (
    <RegistrationContext.Provider value={{ registrationData, setRegistrationData }}>
      <Routes>
        <Route path="/"      element={<LandingPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*"      element={<Navigate to="/" replace />} />
      </Routes>
    </RegistrationContext.Provider>
  )
}
