import React, { useEffect, useRef, useState } from 'react'

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up', // 'up' | 'left' | 'right' | 'none'
  threshold = 0.15,
}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  const baseStyle = {
    transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
    opacity: visible ? 1 : 0,
    transform: visible
      ? 'none'
      : direction === 'up'
      ? 'translateY(32px)'
      : direction === 'left'
      ? 'translateX(-32px)'
      : direction === 'right'
      ? 'translateX(32px)'
      : 'none',
  }

  return (
    <div ref={ref} style={baseStyle} className={className}>
      {children}
    </div>
  )
}
