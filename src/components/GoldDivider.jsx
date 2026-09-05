import React from 'react'

export default function GoldDivider({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 justify-center my-6 ${className}`}>
      <div className="w-16 h-px bg-gradient-to-r from-transparent to-gold-500" />
      <div className="w-1.5 h-1.5 rotate-45 bg-gold-500 flex-shrink-0" />
      <div className="w-16 h-px bg-gradient-to-l from-transparent to-gold-500" />
    </div>
  )
}
