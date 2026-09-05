import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import SupportPage from './pages/SupportPage'
import AdminPage from './pages/AdminPage'

// Registration context — pass data from page 1 to page 2
export const RegistrationContext = React.createContext(null)

export default function App() {
  const [registrationData, setRegistrationData] = useState(null)

  return (
    <RegistrationContext.Provider value={{ registrationData, setRegistrationData }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RegistrationContext.Provider>
  )
}
