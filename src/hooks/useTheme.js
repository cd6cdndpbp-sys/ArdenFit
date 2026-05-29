import { useState, useEffect } from 'react'
import { getTimeTheme } from '../themes/timeThemes'

const useTheme = () => {
  const [theme, setTheme] = useState(getTimeTheme(new Date().getHours()))

  useEffect(() => {
    const interval = setInterval(() => {
      setTheme(getTimeTheme(new Date().getHours()))
    }, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return theme
}

export default useTheme
