import { useState, useEffect } from 'react'

const ARDEN_IMAGES = {
  rest:           'https://raw.githubusercontent.com/cd6cdndpbp-sys/ArdenFit/main/images/AS3.png',
  ready:          'https://raw.githubusercontent.com/cd6cdndpbp-sys/ArdenFit/main/images/AS1.png',
  pr:             'https://raw.githubusercontent.com/cd6cdndpbp-sys/ArdenFit/main/images/AS2.png',
  full_intensity: 'https://raw.githubusercontent.com/cd6cdndpbp-sys/ArdenFit/main/images/AS4.png',
  low_sleep:      'https://raw.githubusercontent.com/cd6cdndpbp-sys/ArdenFit/main/images/AS5.png',
  overtraining:   'https://raw.githubusercontent.com/cd6cdndpbp-sys/ArdenFit/main/images/AS6.png',
}

const styles = {
  header: {
    position: 'relative',
    width: '100%',
    height: '200px',
    background: '#0e0e10',
    overflow: 'hidden',
    borderBottom: '1px solid #1e1e22',
  },
  left: {
    position: 'absolute',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    maxWidth: '58%',
    zIndex: 2,
  },
  greeting: {
    fontSize: '32px',
    fontWeight: 600,
    color: '#fff',
    margin: 0,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '13px',
    color: '#888',
    marginTop: '4px',
    marginBottom: '14px',
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#1a2e22',
    border: '0.5px solid #2a4a36',
    borderRadius: '20px',
    padding: '5px 12px',
    fontSize: '12px',
    color: '#3ecf8e',
  },
  topRight: {
    position: 'absolute',
    right: '20px',
    top: '16px',
    textAlign: 'right',
    zIndex: 3,
  },
  time: {
    fontSize: '18px',
    fontWeight: 500,
    color: '#fff',
    margin: 0,
  },
  date: {
    fontSize: '11px',
    color: '#555',
    marginTop: '2px',
  },
}

const fadeMask = [
  'linear-gradient(to right, transparent 0%, black 30%, black 100%)',
  'linear-gradient(to bottom, transparent 0%, black 45%, black 100%)',
].join(', ')

const getTime = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
const getDate = () => new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()
const getTimeOfDay = () => {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 24) return 'evening'
  return 'night'
}

export default function DashboardHeader({
  userName,
  subtitle,
  tomorrowWorkout,
  ardenState,
  theme,
}) {
  const [currentTime, setCurrentTime] = useState(getTime)
  const [currentDate, setCurrentDate] = useState(getDate)
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 600)

  useEffect(() => {
    const tick = () => { setCurrentTime(getTime()); setCurrentDate(getDate()); setTimeOfDay(getTimeOfDay()) }
    const id = setInterval(tick, 60 * 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 600)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  console.log('ARDEN KEY:', ardenState, '| URL:', ARDEN_IMAGES[ardenState])

  return (
    <header style={{ ...styles.header, background: theme.bg, transition: 'background-color 2s ease', height: isMobile ? '160px' : '200px' }}>
      <div style={styles.left}>
        <p style={{ ...styles.greeting, fontSize: isMobile ? '22px' : '32px' }}>Good {timeOfDay}, {userName}</p>
        <p style={styles.subtitle}>{subtitle}</p>
        <span style={{ ...styles.pill, background: theme.accentBg, border: `0.5px solid ${theme.accent}`, color: theme.accentText, transition: 'background-color 1.5s ease, border-color 1.5s ease, color 1.5s ease' }}>
          ⚡ {tomorrowWorkout}
        </span>
      </div>

      <div style={styles.topRight}>
        <p style={styles.time}>{currentTime}</p>
        <p style={styles.date}>{currentDate}</p>
      </div>

      {console.log('IMG SRC RENDERING:', ARDEN_IMAGES[ardenState])}
      <img
        src={ARDEN_IMAGES[ardenState] || ARDEN_IMAGES.rest}
        alt="Arden"
        style={{
          position: 'absolute',
          right: '-10px',
          bottom: '-10px',
          height: isMobile ? '140px' : '190px',
          width: 'auto',
          objectFit: 'contain',
          objectPosition: 'bottom right',
          zIndex: 1,
          maskImage: fadeMask,
          WebkitMaskImage: fadeMask,
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
        }}
      />
    </header>
  )
}
