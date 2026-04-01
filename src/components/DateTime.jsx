import React, { useState, useEffect } from 'react'

function formatDateTime(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const day = days[date.getDay()]
  const month = months[date.getMonth()]
  const dateNum = date.getDate()
  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12 || 12

  return `${day} ${month} ${dateNum} ${hours}:${minutes}${ampm}`
}

function DateTime() {
  const [dateTime, setDateTime] = useState(formatDateTime(new Date()))

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(formatDateTime(new Date()))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div>
      <h6>{dateTime}</h6>
    </div>
  )
}

export default DateTime