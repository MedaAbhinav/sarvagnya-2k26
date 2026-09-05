import React from 'react'
import { motion } from 'framer-motion'
import { COLLEGE, EVENT } from '../config'

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-navy-800/60 py-16 px-4 text-center relative overflow-hidden">

      {/* Decorative top line */}
      <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mb-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="space-y-4"
      >
        <p className="font-serif text-gold-400 text-2xl font-bold tracking-wide">
          {COLLEGE.name}
        </p>
        <p className="font-sans text-ivory-300/60 text-sm tracking-[0.2em] uppercase">
          {COLLEGE.location}
        </p>

        <div className="w-16 h-px bg-gold-500/40 mx-auto my-6" />

        <p className="font-serif text-ivory-200 text-lg italic">
          {EVENT.title}
        </p>
        <p className="font-sans text-gold-400 text-base font-semibold tracking-widest uppercase">
          {EVENT.alumniMeetDate}
        </p>

        <div className="w-16 h-px bg-gold-500/40 mx-auto my-6" />

        <p className="font-script text-ivory-300/70 text-lg">
          Some journeys take us away.
        </p>
        <p className="font-script text-ivory-300/70 text-lg">
          Some memories always bring us back.
        </p>

        <div className="w-16 h-px bg-gold-500/40 mx-auto my-6" />

        <p className="font-serif text-gold-400 text-xl font-bold">
          See You On Campus ❤️
        </p>

        <p className="font-sans text-navy-500 text-xs tracking-widest uppercase mt-8">
          © {EVENT.reunionYear} · {COLLEGE.fullName} · 2006 Batch Alumni Reunion
        </p>
      </motion.div>
    </footer>
  )
}
