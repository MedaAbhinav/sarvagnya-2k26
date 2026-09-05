import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import HeroSection from '../sections/HeroSection'
import MemoriesSection from '../sections/MemoriesSection'
import EventSection from '../sections/EventSection'
import RegistrationSection from '../sections/RegistrationSection'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy-950">
      <Navbar />
      <main>
        <HeroSection />
        <MemoriesSection />
        <EventSection />
        <RegistrationSection />
      </main>
      <Footer />
    </div>
  )
}
