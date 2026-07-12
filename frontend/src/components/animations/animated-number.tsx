import { useEffect, useRef, useState } from "react"

interface AnimatedNumberProps {
  value: number
  duration?: number
  className?: string
}

export function AnimatedNumber({ value, duration = 400, className }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const previousValue = useRef(value)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const startValue = previousValue.current
    const endValue = value
    const startTime = performance.now()

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      const current = Math.round(startValue + (endValue - startValue) * eased)
      setDisplayValue(current)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
    previousValue.current = value

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, duration])

  return <span className={className}>{displayValue}</span>
}

interface AnimatedPercentageProps {
  value: number
  duration?: number
  className?: string
}

export function AnimatedPercentage({ value, duration = 400, className }: AnimatedPercentageProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const previousValue = useRef(value)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const startValue = previousValue.current
    const endValue = value
    const startTime = performance.now()

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      const current = startValue + (endValue - startValue) * eased
      setDisplayValue(Math.round(current * 10) / 10)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
    previousValue.current = value

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, duration])

  return <span className={className}>{displayValue}%</span>
}