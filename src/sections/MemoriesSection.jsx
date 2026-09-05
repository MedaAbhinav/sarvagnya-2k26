import React from 'react'
import { motion } from 'framer-motion'
import { ASSETS } from '../config'
import ScrollReveal from '../components/ScrollReveal'
import GoldDivider from '../components/GoldDivider'

const memoryCards = [
  { emoji: '🤝', label: 'Friendships', sub: 'Bonds that last a lifetime' },
  { emoji: '📚', label: 'Classrooms',  sub: 'Where futures were shaped' },
  { emoji: '🌿', label: 'Campus Life', sub: 'Every corner holds a story' },
  { emoji: '☕', label: 'Canteen',      sub: 'Tea, talks, and laughter' },
  { emoji: '🏠', label: 'Hostel',       sub: 'Home away from home' },
  { emoji: '✨', label: 'Dreams',       sub: 'The ambitions we carried' },
  { emoji: '🗺️', label: 'Adventures',  sub: 'Paths we walked together' },
  { emoji: '💛', label: 'Memories',    sub: 'Moments that never fade' },
]

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: 'easeOut' },
  }),
}

export default function MemoriesSection() {
  return (
    <section id="reunion" className="section-pad bg-navy-950 relative overflow-hidden">

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-gold-500/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-burgundy-700/10 blur-3xl pointer-events-none" />

      <div className="container-wide relative z-10">

        {/* Section header */}
        <ScrollReveal className="text-center mb-16">
          <p className="font-script text-gold-400 text-xl mb-3">Revisit. Remember. Rejoice.</p>
          <h2 className="heading-lg text-ivory-100 mb-4">
            Some Memories<br />
            <span className="text-gold-shimmer">Never Grow Old</span>
          </h2>
          <GoldDivider />
          <p className="font-sans text-ivory-300/70 text-base leading-relaxed max-w-2xl mx-auto mt-6">
            Years may have passed. Life may have taken everyone in different directions.
            But the friendships, laughter, dreams and memories created within these campus
            walls remain a part of who we are.
          </p>
        </ScrollReveal>

        {/* Group photograph — cinematic treatment */}
        <ScrollReveal delay={100} className="mb-20">
          <div className="relative max-w-4xl mx-auto">
            {/* Elegant frame */}
            <div className="absolute -inset-3 border border-gold-500/20 pointer-events-none z-10" />
            <div className="absolute -inset-6 border border-gold-500/10 pointer-events-none z-10" />

            <div className="relative overflow-hidden"
              style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(196,154,56,0.15)' }}>
              <img
                src={ASSETS.groupPhoto}
                alt="2006 Batch — JNTU College of Engineering, Pulivendula"
                className="w-full object-cover photo-vintage"
                style={{ maxHeight: '520px', objectPosition: 'center top' }}
              />
              {/* Cinematic bottom gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-navy-950/20 via-transparent to-navy-950/20" />

              {/* Caption overlay */}
              <div className="absolute bottom-0 left-0 right-0 px-6 py-5 text-center">
                <p className="font-serif text-ivory-100 text-lg font-semibold tracking-wide drop-shadow-lg">
                  2006 Batch — {/* College */}
                  <span className="text-gold-400">JNTU College of Engineering, Pulivendula</span>
                </p>
                <p className="font-sans text-ivory-300/70 text-xs tracking-[0.2em] uppercase mt-1">
                  The faces. The memories. The journey.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Memory cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {memoryCards.map((card, i) => (
            <motion.div
              key={card.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="premium-card text-center group cursor-default"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {card.emoji}
              </div>
              <p className="font-serif text-ivory-100 font-semibold text-base mb-1">
                {card.label}
              </p>
              <p className="font-sans text-ivory-400/60 text-xs leading-snug">
                {card.sub}
              </p>
              <div className="w-8 h-px bg-gold-500/30 mx-auto mt-3 group-hover:bg-gold-500/70 transition-colors duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
