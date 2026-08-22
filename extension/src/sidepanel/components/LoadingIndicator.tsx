import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export function LoadingIndicator() {
  const reduceMotion = useReducedMotion()

  return (
    <span className="samjho-loading" role="presentation" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="samjho-loading__dot"
          animate={reduceMotion ? { opacity: 0.6 } : { opacity: [0.25, 1, 0.25] }}
          transition={reduceMotion ? undefined : { duration: 1.1, repeat: Infinity, delay: index * 0.18 }}
        />
      ))}
    </span>
  )
}
