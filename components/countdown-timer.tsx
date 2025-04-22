"use client"

import { useEffect, useState } from "react"

interface CountdownTimerProps {
  targetDate: Date
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const target = targetDate.getTime()

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = target - now

      if (distance < 0) {
        clearInterval(interval)
        setDays(0)
        setHours(0)
        setMinutes(0)
        setSeconds(0)
        return
      }

      setDays(Math.floor(distance / (1000 * 60 * 60 * 24)))
      setHours(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))
      setMinutes(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)))
      setSeconds(Math.floor((distance % (1000 * 60)) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      <div className="flex flex-col">
        <div className="rounded-md bg-white p-2 text-2xl font-bold shadow-sm">{days.toString().padStart(2, "0")}</div>
        <div className="mt-1 text-xs uppercase text-muted-foreground">Days</div>
      </div>
      <div className="flex flex-col">
        <div className="rounded-md bg-white p-2 text-2xl font-bold shadow-sm">{hours.toString().padStart(2, "0")}</div>
        <div className="mt-1 text-xs uppercase text-muted-foreground">Hours</div>
      </div>
      <div className="flex flex-col">
        <div className="rounded-md bg-white p-2 text-2xl font-bold shadow-sm">
          {minutes.toString().padStart(2, "0")}
        </div>
        <div className="mt-1 text-xs uppercase text-muted-foreground">Minutes</div>
      </div>
      <div className="flex flex-col">
        <div className="rounded-md bg-white p-2 text-2xl font-bold shadow-sm">
          {seconds.toString().padStart(2, "0")}
        </div>
        <div className="mt-1 text-xs uppercase text-muted-foreground">Seconds</div>
      </div>
    </div>
  )
}
