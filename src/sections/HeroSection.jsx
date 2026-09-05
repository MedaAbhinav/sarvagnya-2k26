import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { ASSETS, COLLEGE, EVENT } from '../config'

export default function HeroSection() {
  const imgRef = useRef(null)
  const [imgLoaded, setImgLoaded] = useState(false)

  // Subtle parallax on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!imgRef.current) return
      const scrollY = window.scrollY
      imgRef.current.style.transform = `translateY(${scrollY * 0.28}px) scale(1.08)`
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToRegistration = () => {
    const el = document.querySelector('#registration')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollDown = () => {
    const el = document.querySelector('#reunion')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="home" className="relative w-full min-h-screen overflow-hidden flex items-center justify-center">

      {/* ── Background photograph ── */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          ref={imgRef}
          src={ASSETS.groupPhoto}
          alt="2006 Batch — JNTU College of Engineering, Pulivendula"
          className={`w-full h-full object-cover object-center photo-vintage scale-110
                      transition-opacity duration-1500
                      ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
          loading="eager"
        />

        {/* Multi-layer cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/60 via-transparent to-navy-950/60" />
        {/* Vignette */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,22,40,0.7) 100%)' }}
        />
      </div>

      {/* ── Hero content ── */}
      <div className="relative z-10 text-center px-4 md:px-8 max-w-4xl mx-auto pt-24 pb-32">

        {/* Batch badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-8 flex justify-center"
        >
          <span className="gold-badge">
            <span className="w-1 h-1 rounded-full bg-gold-400 inline-block" />
            2006 Batch · Twenty Years On
            <span className="w-1 h-1 rounded-full bg-gold-400 inline-block" />
          </span>
        </motion.div>

        {/* Script accent */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="font-script text-gold-400 text-2xl md:text-3xl mb-3"
        >
          Welcome Back
        </motion.p>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.65 }}
          className="font-serif font-black leading-none tracking-tight mb-6"
          style={{ fontSize: 'clamp(2.8rem, 8vw, 6rem)' }}
        >
          <span className="text-gold-shimmer block">It's Time to</span>
          <span className="text-ivory-100 block">Come Back Home</span>
        </motion.h1>

        {/* Supporting text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.85 }}
          className="font-sans text-ivory-300/80 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-10"
        >
          The campus that witnessed your dreams, friendships and countless unforgettable
          moments is ready to welcome you once again.
        </motion.p>

        {/* College + Date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.0 }}
          className="mb-12 space-y-1"
        >
          <p className="font-sans text-ivory-400/70 text-xs tracking-[0.3em] uppercase">
            {COLLEGE.name}
          </p>
          <p className="font-sans text-ivory-400/70 text-xs tracking-[0.3em] uppercase">
            {COLLEGE.location}
          </p>
          <div className="w-12 h-px bg-gold-500/50 mx-auto my-3" />
          <p className="font-serif text-gold-400 text-xl md:text-2xl font-semibold tracking-wide">
            {EVENT.alumniMeetDate}
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.15 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={scrollToRegistration}
            className="btn-primary text-sm px-10 py-4 group"
          >
            <span>Join the Reunion</span>
            <span className="inline-block group-hover:translate-x-1 transition-transform duration-200">→</span>
          </button>
          <button
            onClick={scrollDown}
            className="btn-outline text-xs px-8 py-4"
          >
            Discover More
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        onClick={scrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10
                   flex flex-col items-center gap-2 text-ivory-400/50 hover:text-gold-400
                   transition-colors duration-300 cursor-pointer"
        aria-label="Scroll down"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={24} />
        </motion.div>
      </motion.button>
    </section>
  )
}
