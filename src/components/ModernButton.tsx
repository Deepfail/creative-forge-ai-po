import React, { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ModernButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  loading?: boolean
  icon?: ReactNode
  glow?: boolean
}

export function ModernButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon,
  glow = false
}: ModernButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'gradient-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/25 border-0'
      case 'secondary':
        return 'gradient-secondary text-secondary-foreground hover:shadow-lg hover:shadow-secondary/25 border-0'
      case 'accent':
        return 'gradient-accent text-accent-foreground hover:shadow-lg hover:shadow-accent/25 border-0'
      case 'outline':
        return 'bg-transparent border-2 border-primary/50 text-primary hover:bg-primary/10 hover:border-primary'
      case 'ghost':
        return 'bg-transparent hover:bg-muted/50 text-foreground'
      default:
        return ''
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm'
      case 'lg':
        return 'px-8 py-4 text-lg'
      default:
        return 'px-6 py-3'
    }
  }

  const glowClasses = glow ? 'button-glow' : ''

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <Button
        onClick={onClick}
        disabled={disabled || loading}
        className={cn(
          'relative overflow-hidden transition-all duration-200 rounded-xl font-medium',
          getVariantClasses(),
          getSizeClasses(),
          glowClasses,
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {loading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '200%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        )}
        
        <span className="relative flex items-center gap-2">
          {icon && (
            <motion.span
              animate={loading ? { rotate: 360 } : {}}
              transition={loading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            >
              {icon}
            </motion.span>
          )}
          {children}
        </span>
      </Button>
    </motion.div>
  )
}

interface ModeButtonProps {
  title: string
  subtitle?: string
  icon: ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export function ModeButton({
  title,
  subtitle,
  icon,
  onClick,
  variant = 'primary',
  disabled = false
}: ModeButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <Button
        onClick={onClick}
        disabled={disabled}
        variant="outline"
        className={cn(
          'w-full h-auto p-4 flex-col gap-2 border-2 transition-all duration-300 rounded-xl',
          variant === 'primary' 
            ? 'border-primary/30 hover:border-primary hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/20' 
            : 'border-secondary/30 hover:border-secondary hover:bg-secondary/5 hover:shadow-lg hover:shadow-secondary/20',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {icon}
        </motion.div>
        <div className="text-center">
          <div className="font-medium text-sm">{title}</div>
          {subtitle && (
            <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
          )}
        </div>
      </Button>
    </motion.div>
  )
}

export default ModernButton