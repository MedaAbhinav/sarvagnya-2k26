import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Star, Heart } from 'lucide-react'
import { COLLEGE, EVENT } from '../config'
import ScrollReveal from '../components/ScrollReveal'
import GoldDivider from '../components/GoldDivider'

export default function EventSection() {
  return (
    <section className="section-pad relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #102a43 0%, #0d2238 50%, #102a43 100%)' }}
    >
      {/* Decorative */}
      <div className="absolute inset-0 grain-overlay pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[600px] h-[600px] rounded-full
                      bg-gold-500/3 blur-3xl pointer-events-none" />

      <div className="container-wide relative z-10">

        {/* Header */}
        <ScrollReveal className="text-center mb-20">
          <span className="gold-badge mb-6 inline-flex">
            <Calendar size={12} />
            Event Schedule
          </span>
          <h2 className="heading-lg text-ivory-100 mb-4">
            Mark Your <span className="text-gold-shimmer">Calendar</span>
          </h2>
          <GoldDivider />
          <p className="font-sans text-ivory-300/70 text-base mt-6 max-w-xl mx-auto">
            Two memorable days of celebrations, culminating in a dedicated day
            for the 2006 Batch to come home.
          </p>
        </ScrollReveal>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto">

          {/* College Fest */}
          <ScrollReveal delay={100}>
            <motion.div
              whileHover={{ x: 4 }}
              className="flex gap-6 mb-4 group cursor-default"
            >
              <div className="flex flex-col items-center pt-1">
                <div className="w-10 h-10 rounded-full border border-navy-600 bg-navy-900
                                flex items-center justify-center flex-shrink-0
                                group-hover:border-gold-500/50 transition-colors duration-300">
                  <Star size={16} className="text-navy-400 group-hover:text-gold-500/70 transition-colors duration-300" />
                </div>
                <div className="w-px flex-1 bg-navy-700/50 mt-2 min-h-[60px]" />
              </div>
              <div className="pb-10 pt-1">
                <p className="font-sans text-xs text-ivory-400/50 tracking-[0.25em] uppercase mb-1">
                  College Fest
                </p>
                <h3 className="font-serif text-ivory-200 text-2xl md:text-3xl font-bold mb-2">
                  8 & 9 October 2026
                </h3>
                <p className="font-sans text-ivory-400/70 text-sm leading-relaxed">
                  The annual college fest will bring students together for two days
                  of vibrant celebrations, cultural events, and competitions at
                  {' '}{COLLEGE.fullName}.
                </p>
              </div>
            </motion.div>
          </ScrollReveal>

          {/* Alumni Meet — FEATURED */}
          <ScrollReveal delay={200}>
            <motion.div
              whileHover={{ x: 4 }}
              className="flex gap-6 group cursor-default"
            >
              <div className="flex flex-col items-center pt-1">
                <motion.div
                  animate={{ boxShadow: ['0 0 0 0 rgba(196,154,56,0.4)', '0 0 0 14px rgba(196,154,56,0)', '0 0 0 0 rgba(196,154,56,0)'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
                  className="w-14 h-14 rounded-full border-2 border-gold-500 bg-gold-500/10
                              flex items-center justify-center flex-shrink-0"
                >
                  <Heart size={20} className="text-gold-400" fill="currentColor" />
                </motion.div>
              </div>
              <div className="pt-1">
                {/* Featured badge */}
                <div className="inline-flex items-center gap-2 bg-gold-500/15 border border-gold-500/40
                                px-3 py-1 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                  <span className="font-sans text-gold-400 text-xs font-semibold tracking-widest uppercase">
                    2006 Batch · Dedicated Day
                  </span>
                </div>

                <h3 className="font-serif font-black leading-none mb-3"
                  style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}>
                  <span className="text-gold-shimmer">10 October</span>
                  <span className="text-ivory-100 block text-2xl md:text-3xl font-bold mt-1 tracking-wide">
                    2006 Batch Alumni Meet
                  </span>
                </h3>

                <div className="premium-card inline-block mt-4">
                  <p className="font-sans text-ivory-300/80 text-sm leading-relaxed max-w-md">
                    <strong className="text-gold-400 font-semibold">October 10 is dedicated entirely</strong> to
                    welcoming the 2006 Batch back to campus. Reconnect with
                    batchmates, relive your years, and walk through those familiar
                    corridors once more.
                  </p>
                </div>
              </div>
            </motion.div>
          </ScrollReveal>

        </div>

        {/* CTA */}
        <ScrollReveal delay={300} className="text-center mt-16">
          <p className="font-script text-gold-400 text-xl mb-4">
            Will you be there?
          </p>
          <button
            onClick={() => document.querySelector('#registration')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary"
          >
            Reserve Your Place
          </button>
        </ScrollReveal>

      </div>
    </section>
  )
}
