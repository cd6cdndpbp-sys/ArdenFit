import { useState, useEffect } from 'react'
import { getTimeTheme, getSystemTheme } from '../themes/timeThemes'

const currentTheme = () => getTimeTheme(new Date().getHours(), getSystemTheme())

const useTheme = () => {
  const [theme, setTheme] = useState(currentTheme)

  useEffect(() => {
    const tick = setInterval(() => setTheme(currentTheme()), 60 * 1000)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setTheme(currentTheme())
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return theme
}

export default useTheme
