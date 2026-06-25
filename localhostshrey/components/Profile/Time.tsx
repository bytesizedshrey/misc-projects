"use client"

import { useState, useEffect } from 'react'

export default function Time() {
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState<Date>(() => new Date())

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [mounted])

  const formatDateTime = (date: Date) => {
    const formattedDate = date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    })
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
    return `${formattedDate}, ${formattedTime}`
  }

  return (
    <div className="flex items-center justify-center">
      <time
        className="text-[10px] font-light text-zinc-500 font-mono tabular-nums tracking-wider "
        dateTime={mounted ? time.toISOString() : undefined}
        aria-label="Current time"
      >
        {mounted ? formatDateTime(time) : '\u2013'}
      </time>
    </div>
  )
}
