import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { COLLEGE, EVENT } from '../config'

// Navigation: Home | Registration only — Support is now inside the registration form
const navLinks = [
  { label: 'Home',         action: 'home' },
  { label: 'Registration', action: 'registration' },
]

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  function handleNav(action) {
    setMenuOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        if (action === 'registration') {
          document.querySelector('#registration')?.scrollIntoView({ behavior: 'smooth' })
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }, 120)
    } else {
      if (action === 'registration') {
        document.querySelector('#registration')?.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 navbar-glass
          ${scrolled
            ? 'bg-navy-950/92 border-b border-navy-800/60 shadow-[0_2px_32px_rgba(0,0,0,0.4)]'
            : 'bg-transparent border-b border-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20
                        flex items-center justify-between">

          {/* Brand */}
          <button
            onClick={() => handleNav('home')}
            className="flex flex-col items-start gap-0 group cursor-pointer flex-shrink-0"
            aria-label="Go to home"
          >
            <span className="font-serif text-gold-400 text-base md:text-lg font-bold
                             leading-none tracking-wide group-hover:text-gold-300
                             transition-colors duration-200">
              Sarvagnya
            </span>
            <span className="font-sans text-ivory-300/55 text-[10px] tracking-[0.2em]
                             uppercase leading-none mt-0.5">
              2K26 · {COLLEGE.location}
            </span>
          </button>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNav(link.action)}
                className="font-sans text-xs font-semibold text-ivory-300/75
                           hover:text-gold-400 tracking-[0.18em] uppercase
                           transition-colors duration-200 relative
                           after:absolute after:-bottom-0.5 after:left-0 after:right-0
                           after:h-px after:bg-gold-500 after:scale-x-0
                           hover:after:scale-x-100 after:transition-transform after:duration-300"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => handleNav('registration')}
              className="btn-primary py-2.5 px-6 text-xs ml-2"
            >
              Register Now
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-ivory-200 hover:text-gold-400 transition-colors p-1"
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-40 bg-navy-950/98 navbar-glass flex flex-col"
          >
            <div className="h-16 flex items-center justify-between px-5">
              <button onClick={() => handleNav('home')} className="flex flex-col items-start">
                <span className="font-serif text-gold-400 text-base font-bold">Sarvagnya</span>
                <span className="font-sans text-ivory-400/50 text-[10px] tracking-[0.2em] uppercase">
                  2K26 · {COLLEGE.location}
                </span>
              </button>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-ivory-300 hover:text-gold-400 transition-colors p-1"
                aria-label="Close menu"
              >
                <X size={26} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-9 pb-16">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.4 }}
                className="text-center mb-2"
              >
                <p className="font-script text-gold-400 text-2xl">Welcome Back</p>
                <p className="font-sans text-ivory-400/50 text-xs tracking-[0.25em] uppercase mt-1">
                  2006 Batch · {EVENT.reunionYear}
                </p>
              </motion.div>

              {navLinks.map((link, i) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  onClick={() => handleNav(link.action)}
                  className="font-serif text-3xl text-ivory-100 hover:text-gold-400
                             transition-colors duration-200 tracking-wide"
                >
                  {link.label}
                </motion.button>
              ))}

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                onClick={() => handleNav('registration')}
                className="btn-primary mt-2 text-sm px-10 py-4"
              >
                Register for Reunion
              </motion.button>
            </div>

            <p className="text-center text-navy-600 text-xs pb-6 font-sans
                          tracking-widest uppercase">
              {COLLEGE.fullName}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
