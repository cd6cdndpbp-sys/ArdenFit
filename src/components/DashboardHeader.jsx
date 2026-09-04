import { useState, useEffect } from 'react'
import { useCrossfadeLayers } from '../hooks/useCrossfadeLayers'
import { freshnessLevel, formatSyncAge } from '../utils/dataFreshness'

const ARDEN_IMAGES = {
  rest:             'https://raw.githubusercontent.com/cd6cdndpbp-sys/ArdenFit/main/images/AS3.png',
  ready:            'https://raw.githubusercontent.com/cd6cdndpbp-sys/ArdenFit/main/images/AS1.png',
  pr:               'https://raw.githubusercontent.com/cd6cdndpbp-sys/ArdenFit/main/images/AS2.png',
  full_intensity:   'https://raw.githubusercontent.com/cd6cdndpbp-sys/ArdenFit/main/images/AS4.png',
  low_sleep:        'https://raw.githubusercontent.com/cd6cdndpbp-sys/ArdenFit/main/images/AS5.png',
  overtraining:     'https://raw.githubusercontent.com/cd6cdndpbp-sys/ArdenFit/main/images/AS6.png',
  off_baseline:     'https://raw.githubusercontent.com/cd6cdndpbp-sys/ArdenFit/main/images/AS7.png',
  streak_milestone: 'https://raw.githubusercontent.com/cd6cdndpbp-sys/ArdenFit/main/images/AS8.png',
}

const dataPillStyle = (theme) => ({
  display:        'inline-flex',
  alignItems:     'center',
  gap:            '6px',
  background:     theme.headerDataStripBg,
  border:         `0.5px solid ${theme.headerDataStripBorder}`,
  borderRadius:   '20px',
  padding:        '6px 14px',
  fontSize:       '13px',
  color:          theme.headerTextColor || theme.textPrimary,
})

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
  healthData,
}) {
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay)
  const [isMobile, setIsMobile]   = useState(() => window.innerWidth < 600)

  useEffect(() => {
    const id = setInterval(() => setTimeOfDay(getTimeOfDay()), 60 * 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 600)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const ardenLayers = useCrossfadeLayers(ARDEN_IMAGES[ardenState] || ARDEN_IMAGES.rest)

  const sleep      = healthData?.sleep?.total
  const hrv        = healthData?.hrv
  const restingHR  = healthData?.restingHR
  const sleepColor = sleep >= 7 ? theme.badgeGood.color : sleep >= 6 ? theme.textPrimary : theme.badgeWarn.color

  const SYNC_BADGE = { good: theme.badgeGood, warn: theme.badgeWarn, critical: theme.badgeCritical }
  const syncDotColor = SYNC_BADGE[freshnessLevel(healthData?.dataLastUpdated)].color
  const syncAgeLabel = formatSyncAge(healthData?.dataLastUpdated)

  return (
    <header
      className="dashboard-header"
      style={{
        position:     'relative',
        width:        '100%',
        background:   theme.bg,
        overflow:     'hidden',
        borderBottom: `1px solid ${theme.cardBorder}`,
        transition:   'background-color 2s ease',
      }}
    >
      {/* Greeting content */}
      <div style={{
        position:  'absolute',
        left:      isMobile ? '20px' : '28px',
        top:       '50%',
        transform: 'translateY(-50%)',
        maxWidth:  isMobile ? '58%' : '45%',
        zIndex:    2,
      }}>
        <p style={{
          fontSize:   isMobile ? '22px' : '36px',
          fontWeight: 600,
          color:      theme.textPrimary,
          margin:     0,
          lineHeight: 1.2,
        }}>
          Good {timeOfDay}, {userName}
        </p>
        <p style={{ fontSize: '13px', color: theme.textMuted, marginTop: '4px', marginBottom: '14px' }}>
          {subtitle}
        </p>
        <span style={{
          display:    'inline-flex',
          alignItems: 'center',
          gap:        '6px',
          background: theme.accentBg,
          border:     `0.5px solid ${theme.accent}`,
          borderRadius: '20px',
          padding:    '5px 12px',
          fontSize:   '12px',
          color:      theme.accentText,
          transition: 'background-color 1.5s ease, border-color 1.5s ease, color 1.5s ease',
        }}>
          ⚡ {tomorrowWorkout}
        </span>
      </div>

      {/* Live data strip — desktop only via CSS class */}
      <div className="header-data-strip">
        {sleep != null && (
          <div style={dataPillStyle(theme)}>
            <span style={{ fontSize: '14px', color: sleepColor }}>🌙</span>
            <span style={{ color: sleepColor }}>{sleep}h</span>
          </div>
        )}
        {hrv != null && (
          <div style={dataPillStyle(theme)}>
            <span style={{ fontSize: '14px', color: theme.accent }}>∿</span>
            <span style={{ color: theme.accent }}>{hrv} ms</span>
          </div>
        )}
        {restingHR != null && (
          <div style={dataPillStyle(theme)}>
            <span style={{ fontSize: '14px', color: theme.sparklineHR }}>♡</span>
            <span style={{ color: theme.sparklineHR }}>{restingHR} bpm</span>
          </div>
        )}
        <div style={dataPillStyle(theme)} title={syncAgeLabel}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: syncDotColor, transition: 'background-color 1.5s ease',
          }} />
        </div>
      </div>

      {/* Arden — height controlled by .arden-img CSS class, crossfades on state change */}
      {ardenLayers.map((layer, i, arr) => (
        <img
          key={layer.id}
          src={layer.src}
          alt="Arden"
          className={i === arr.length - 1 ? 'arden-img fade-in-layer' : 'arden-img'}
          style={{
            position:       'absolute',
            width:          'auto',
            objectFit:      'contain',
            objectPosition: 'bottom right',
            zIndex:         1,
          }}
        />
      ))}
    </header>
  )
}
