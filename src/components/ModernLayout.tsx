import React, { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModernLayoutProps {
  children: ReactNode
  className?: string
  showBackground?: boolean
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
}

export function ModernLayout({ children, className = '', showBackground = true }: ModernLayoutProps) {
  return (
    <motion.div 
      className={`min-h-screen relative overflow-hidden ${className}`}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {showBackground && (
        <div className="fixed inset-0 -z-10">
          {/* Animated background gradients */}
          <motion.div
            className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-bl from-secondary/20 to-transparent rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      )}
      
      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

interface PageTransitionProps {
  children: ReactNode
  mode: string
}

export function PageTransition({ children, mode }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mode}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default ModernLayout