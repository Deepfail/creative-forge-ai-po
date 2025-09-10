import React, { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ModernCardProps {
  children?: ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'gradient' | 'highlight'
  hover?: boolean
  onClick?: () => void
  delay?: number
}

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
}

export function ModernCard({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  onClick,
  delay = 0
}: ModernCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return 'glass-card border-border/30'
      case 'gradient':
        return 'bg-gradient-to-br from-card via-card to-muted/30 border-border/50'
      case 'highlight':
        return 'bg-gradient-to-br from-primary/5 via-card to-secondary/5 border-primary/20'
      default:
        return 'bg-card border-border/50'
    }
  }

  const hoverClasses = hover ? 'card-hover cursor-pointer' : ''
  
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      onClick={onClick}
    >
      <Card className={cn(
        'shadow-lg shadow-black/5 backdrop-blur-sm',
        getVariantClasses(),
        hoverClasses,
        className
      )}>
        {children}
      </Card>
    </motion.div>
  )
}

interface FeatureCardProps {
  title: string
  description: string
  icon: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'accent'
  delay?: number
}

export function FeatureCard({ 
  title, 
  description, 
  icon, 
  onClick, 
  variant = 'primary',
  delay = 0 
}: FeatureCardProps) {
  const getGradientClass = () => {
    switch (variant) {
      case 'primary':
        return 'from-primary/20 to-primary/5 border-primary/30 hover:shadow-primary/20'
      case 'secondary':
        return 'from-secondary/20 to-secondary/5 border-secondary/30 hover:shadow-secondary/20'
      case 'accent':
        return 'from-accent/20 to-accent/5 border-accent/30 hover:shadow-accent/20'
    }
  }

  return (
    <ModernCard
      variant="gradient"
      onClick={onClick}
      delay={delay}
      className={cn(
        'group bg-gradient-to-br transition-all duration-300',
        getGradientClass()
      )}
    >
      <CardContent className="p-6 text-center">
        <motion.div
          className="mx-auto mb-4 w-fit"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {icon}
        </motion.div>
        <CardTitle className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardContent>
    </ModernCard>
  )
}

interface InfoCardProps {
  title: string
  description: string
  features: string[]
  icon: ReactNode
  variant?: 'primary' | 'secondary'
  delay?: number
}

export function InfoCard({ 
  title, 
  description, 
  features, 
  icon, 
  variant = 'primary',
  delay = 0 
}: InfoCardProps) {
  const borderColor = variant === 'primary' ? 'border-primary/30 bg-primary/5' : 'border-secondary/30 bg-secondary/5'

  return (
    <ModernCard
      variant="highlight"
      delay={delay}
      className={cn('h-full', borderColor)}
      hover={false}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {icon}
          </motion.div>
          <CardTitle className="text-foreground">{title}</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {features.map((feature, index) => (
            <motion.li 
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.1 + (index * 0.1) }}
              className="flex items-center"
            >
              <span className="w-1 h-1 bg-primary rounded-full mr-2" />
              {feature}
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </ModernCard>
  )
}

export default ModernCard