import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { getWeightTarget } from '../utils/trainingPlan'

const CARD_TRANSITION = 'background-color 1.5s ease, border-color 1.5s ease'

const MIN_POINTS_FOR_CHART = 3

const fmtDate = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

const LegendDot = ({ color, label, theme }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color }} />
    <span style={{ color: theme.textMuted }}>{label}</span>
  </span>
)

export default function BodyCompTrendCard({ theme, healthData }) {
  const history      = healthData?.bodyCompHistory ?? []
  const weightTarget = getWeightTarget(healthData?.currentWeight)
  const hasChart      = history.length >= MIN_POINTS_FOR_CHART

  return (
    <div style={{
      background:   theme.cardBg,
      border:       `0.5px solid ${theme.cardBorder}`,
      borderRadius: '10px',
      padding:      '14px',
      transition:   CARD_TRANSITION,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ fontSize: '10px', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Body Composition
        </div>
        {hasChart && (
          <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
            <LegendDot color={theme.sparklineHR}  label="Weight (lbs)"    theme={theme} />
            <LegendDot color={theme.sparklineHRV} label="Body Fat (%)"    theme={theme} />
          </div>
        )}
      </div>

      {!hasChart ? (
        <div style={{
          padding: '28px 10px', textAlign: 'center',
          fontSize: '13px', color: theme.textMuted,
        }}>
          Building history — {history.length} {history.length === 1 ? 'reading' : 'readings'} logged so far. Check back as more data comes in.
        </div>
      ) : (
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 4, right: 6, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={theme.cardBorder} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={fmtDate}
                tick={{ fontSize: 11, fill: theme.textMuted }}
                stroke={theme.cardBorder}
                minTickGap={28}
              />
              <YAxis
                yAxisId="weight"
                domain={['dataMin - 2', 'dataMax + 2']}
                tick={{ fontSize: 11, fill: theme.textMuted }}
                stroke={theme.cardBorder}
                width={42}
              />
              <YAxis
                yAxisId="bodyFat"
                orientation="right"
                domain={['dataMin - 1', 'dataMax + 1']}
                tick={{ fontSize: 11, fill: theme.textMuted }}
                stroke={theme.cardBorder}
                width={38}
              />
              <Tooltip
                contentStyle={{
                  background:   theme.cardBg,
                  border:       `0.5px solid ${theme.cardBorder}`,
                  borderRadius: '8px',
                  fontSize:     '12px',
                }}
                labelStyle={{ color: theme.textPrimary }}
                labelFormatter={fmtDate}
                formatter={(value, name) => value == null
                  ? ['—', name === 'weight' ? 'Weight' : 'Body Fat']
                  : name === 'weight' ? [`${value} lbs`, 'Weight'] : [`${value}%`, 'Body Fat']}
                cursor={{ stroke: theme.textMuted }}
              />
              {weightTarget?.targetWeight != null && (
                <ReferenceLine
                  yAxisId="weight"
                  y={weightTarget.targetWeight}
                  stroke={theme.textMuted}
                  strokeDasharray="4 4"
                  label={{
                    value:    `Target ${weightTarget.targetWeight} lbs`,
                    fontSize: 10,
                    fill:     theme.textMuted,
                    position: 'insideTopRight',
                  }}
                />
              )}
              <Line
                yAxisId="weight"
                type="monotone"
                dataKey="weight"
                name="weight"
                stroke={theme.sparklineHR}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                yAxisId="bodyFat"
                type="monotone"
                dataKey="bodyFatPct"
                name="bodyFatPct"
                stroke={theme.sparklineHRV}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
