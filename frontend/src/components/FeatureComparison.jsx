import { useState } from 'react'

const FEATURE_META = {
  excess_green_std: {
    title: "Green Uniformity Deviation",
    desc: "Measures leaf surface discoloration patches. High variance indicates uneven spots and localized disease damage.",
    emoji: "🟢",
    unit: "index"
  },
  excess_green_mean: {
    title: "Average Greenness Index",
    desc: "Quantifies the overall active green pigment density. Lower values reveal chlorosis (loss of chlorophyll).",
    emoji: "🍃",
    unit: "index"
  },
  hue_hist_bin_01: {
    title: "Yellow/Green Spectrum Transition",
    desc: "Measures light yellow-green pigments corresponding to early stage tissue stress and chlorosis.",
    emoji: "🌱",
    unit: "%"
  },
  hue_hist_bin_02: {
    title: "Yellowing Necrosis Ratio",
    desc: "Detects early stages of yellow-brown dry spot formation and nitrogen deficiency coloration.",
    emoji: "🟡",
    unit: "%"
  },
  hue_hist_bin_03: {
    title: "Brown Lesion Coverage",
    desc: "Specifically captures the hue signature of medium-brown fungal or bacterial spots.",
    emoji: "🟤",
    unit: "%"
  },
  yellow_brown_mask_std: {
    title: "Yellow-Brown Variance",
    desc: "Indicates how clustered or spread out the necrotic tissue spots are across the leaf.",
    emoji: "🎯",
    unit: "index"
  },
  excess_green_p90: {
    title: "Peak Health Pigment",
    desc: "Represents the greenest 10% of the leaf, showing the maximum healthy cell potential remaining.",
    emoji: "⚡",
    unit: "value"
  },
  hue_hist_bin_07: {
    title: "Deep Necrotic Spores",
    desc: "Corresponds to dark brown/black spots indicating advanced tissue decay or fungal spore collection.",
    emoji: "🔬",
    unit: "%"
  },
  yellow_brown_mask_mean: {
    title: "Necrotic Surface Coverage",
    desc: "Proportion of the leaf showing clear yellow or brown structural leaf decay.",
    emoji: "🍂",
    unit: "%"
  },
  hue_p90: {
    title: "Dominant Hue Limit",
    desc: "Detects standard color shifts on the edge of the leaf towards yellow/red spectrums.",
    emoji: "🌅",
    unit: "rad"
  },
  saturation_std: {
    title: "Color Saturation Variance",
    desc: "Measures loss of vibrant color uniformity across the leaf due to water or disease stress.",
    emoji: "📈",
    unit: "index"
  }
}

export default function FeatureComparison({ prediction }) {
  const featureComparison = prediction.feature_comparison || {}
  const topFeaturesCompared = prediction.top_features_compared || []
  const [expandedFeature, setExpandedFeature] = useState(null)
  const [hoveredBar, setHoveredBar] = useState(null) // { featureName, type, value }

  if (topFeaturesCompared.length === 0) {
    return null
  }

  // Calculate overall metrics for a quick health diagnosis summary card
  let closerToHealthyCount = 0
  let closerToSickCount = 0
  let totalValid = 0

  topFeaturesCompared.forEach((name) => {
    const feat = featureComparison[name]
    if (feat && feat.current_pct !== null && feat.healthy_pct !== null && feat.sick_pct !== null) {
      totalValid++
      const distToHealthy = Math.abs(feat.current_pct - feat.healthy_pct)
      const distToSick = Math.abs(feat.current_pct - feat.sick_pct)
      if (distToHealthy < distToSick) {
        closerToHealthyCount++
      } else {
        closerToSickCount++
      }
    }
  })

  const healthScore = totalValid > 0 ? (closerToHealthyCount / totalValid) * 100 : 50

  // SVG CHART GEOMETRY DEFINITION
  const svgWidth = 760
  const svgHeight = 310
  const paddingLeft = 55
  const paddingRight = 20
  const paddingTop = 35
  const paddingBottom = 75

  const chartWidth = svgWidth - paddingLeft - paddingRight
  const chartHeight = svgHeight - paddingTop - paddingBottom

  const yTicks = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-emerald-500/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
            📊 AI Feature Fingerprint Analysis
          </h2>
          <p className="text-emerald-400/70 text-sm mt-1">
            Comparing micro-spectral plant features against certified scientific baselines.
          </p>
        </div>

        {totalValid > 0 && (
          <div className="flex items-center gap-3 bg-emerald-950/60 border border-emerald-500/20 px-4 py-2 rounded-xl">
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">Feature Concordance</div>
              <div className="text-sm font-semibold text-slate-100">
                {closerToHealthyCount} of {totalValid} healthy patterns
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-emerald-500 flex items-center justify-center text-sm font-bold text-emerald-400 shadow-md shadow-emerald-900/30">
              {Math.round(healthScore)}%
            </div>
          </div>
        )}
      </div>

      {/* GROUPED BAR CHART: EXACT REPRODUCTION OF MATPLOTLIB CELL */}
      <div className="bg-slate-950/65 rounded-xl border border-emerald-500/10 p-5 mb-8 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 border-b border-slate-900 pb-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            📈 Features clave: sana vs muy enferma vs imagen analizada
          </span>
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-400/20" />
              <span className="text-slate-300">Sana</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-rose-600 border border-rose-500/20" />
              <span className="text-slate-300">Muy enferma</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-blue-500 border border-blue-400/20" />
              <span className="text-slate-300">Imagen analizada</span>
            </div>
          </div>
        </div>

        {/* Responsive Chart Container */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[680px]">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto text-slate-400 select-none">
              {/* Tooltip text display inside chart */}
              {hoveredBar && (
                <g transform="translate(100, 15)">
                  <rect rx="4" width="400" height="20" fill="#0f172a" stroke="#10b981" strokeWidth="0.5" className="opacity-90" />
                  <text x="10" y="14" className="text-[10px] font-bold fill-slate-200">
                    {hoveredBar.feature} ({hoveredBar.type}): {hoveredBar.value.toFixed(4)} ({Math.round(hoveredBar.pct)}% normalizado)
                  </text>
                </g>
              )}

              {/* Y Axis Grid lines & Ticks */}
              {yTicks.map((tick, idx) => {
                const y = paddingTop + chartHeight - tick * chartHeight
                return (
                  <g key={idx}>
                    {/* Line */}
                    <line 
                      x1={paddingLeft} 
                      y1={y} 
                      x2={svgWidth - paddingRight} 
                      y2={y} 
                      stroke="#1e293b" 
                      strokeWidth="1"
                      strokeDasharray={tick === 0 ? "none" : "3,3"}
                    />
                    {/* Label */}
                    <text 
                      x={paddingLeft - 10} 
                      y={y + 4} 
                      className="text-[10px] font-semibold text-right fill-slate-400"
                      textAnchor="end"
                    >
                      {tick.toFixed(1)}
                    </text>
                  </g>
                )
              })}

              {/* Y Axis Label */}
              <text 
                transform={`rotate(-90) translate(${-paddingTop - chartHeight/2}, 16)`}
                className="text-[10px] font-bold uppercase tracking-wider fill-slate-500"
                textAnchor="middle"
              >
                Valor normalizado (0-1)
              </text>

              {/* Draw Groups for each feature */}
              {topFeaturesCompared.map((name, i) => {
                const feat = featureComparison[name]
                if (!feat) return null

                // Group X position
                const groupWidth = chartWidth / topFeaturesCompared.length
                const groupX = paddingLeft + i * groupWidth

                // Standard heights normalized (0 to 1) based on percents
                const sanaVal = (feat.healthy_pct ?? 0) / 100
                const sickVal = (feat.sick_pct ?? 0) / 100
                const currentVal = (feat.current_pct ?? 0) / 100

                // Geometry mapping for bars
                const barWidth = 14
                const barSpacing = 2
                const groupCenterOffset = (groupWidth - (barWidth * 3 + barSpacing * 2)) / 2
                
                const sanaX = groupX + groupCenterOffset
                const sickX = sanaX + barWidth + barSpacing
                const currentX = sickX + barWidth + barSpacing

                const sanaH = sanaVal * chartHeight
                const sickH = sickVal * chartHeight
                const currentH = currentVal * chartHeight

                const baseLineY = paddingTop + chartHeight

                // Hover handlers
                const onHover = (type, val, rawVal) => {
                  setHoveredBar({ feature: name, type, value: rawVal, pct: val * 100 })
                }

                return (
                  <g key={i} className="group/feat-group">
                    {/* Background hover highlight */}
                    <rect 
                      x={groupX + 5} 
                      y={paddingTop - 5} 
                      width={groupWidth - 10} 
                      height={chartHeight + 10} 
                      fill="rgba(16, 185, 129, 0.02)"
                      rx="6"
                      className="opacity-0 group-hover/feat-group:opacity-100 transition-opacity duration-200"
                    />

                    {/* Sana Bar (Green) */}
                    <rect
                      x={sanaX}
                      y={baseLineY - sanaH}
                      width={barWidth}
                      height={Math.max(1, sanaH)}
                      fill="url(#sanaGrad)"
                      rx="2"
                      className="transition-all duration-300 hover:brightness-125 cursor-pointer"
                      onMouseEnter={() => onHover('Sana', sanaVal, feat.healthy_val)}
                      onMouseLeave={() => setHoveredBar(null)}
                    />

                    {/* Sick Bar (Red) */}
                    <rect
                      x={sickX}
                      y={baseLineY - sickH}
                      width={barWidth}
                      height={Math.max(1, sickH)}
                      fill="url(#sickGrad)"
                      rx="2"
                      className="transition-all duration-300 hover:brightness-125 cursor-pointer"
                      onMouseEnter={() => onHover('Muy enferma', sickVal, feat.sick_val)}
                      onMouseLeave={() => setHoveredBar(null)}
                    />

                    {/* Current Bar (Blue) */}
                    <rect
                      x={currentX}
                      y={baseLineY - currentH}
                      width={barWidth}
                      height={Math.max(1, currentH)}
                      fill="url(#currentGrad)"
                      rx="2"
                      className="transition-all duration-300 hover:brightness-125 cursor-pointer shadow-md"
                      onMouseEnter={() => onHover('Imagen analizada', currentVal, feat.current_val)}
                      onMouseLeave={() => setHoveredBar(null)}
                    />

                    {/* Rotated Feature Label */}
                    <text
                      transform={`translate(${groupX + groupWidth/2}, ${baseLineY + 12}) rotate(18)`}
                      className="text-[9.5px] font-semibold text-slate-400 fill-slate-400 group-hover/feat-group:fill-emerald-400 transition-colors"
                      textAnchor="start"
                    >
                      {name}
                    </text>
                  </g>
                )
              })}

              {/* Gradients */}
              <defs>
                <linearGradient id="sanaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="sickGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#be123c" />
                </linearGradient>
                <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        <p className="text-[10px] text-center text-slate-500 mt-2 italic">
          💡 Tip: Hover over the bars to see the exact values and normalized percentages inside the black display box.
        </p>
      </div>

      {/* Feature Slider Detail Cards */}
      <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 border-b border-emerald-500/5 pb-2">
        🔍 Individual Diagnostic Indicators
      </h3>

      <div className="grid grid-cols-1 gap-5">
        {topFeaturesCompared.map((featureName, idx) => {
          const feature = featureComparison[featureName]
          if (!feature) return null

          const meta = FEATURE_META[featureName] || {
            title: featureName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            desc: "Specific plant leaf coloration signature and texture analysis metric.",
            emoji: "⚡",
            unit: "val"
          }

          const healthy = feature.healthy_val ?? 0
          const sick = feature.sick_val ?? 0
          const current = feature.current_val ?? 0
          const healthyPct = feature.healthy_pct ?? null
          const sickPct = feature.sick_pct ?? null
          const currentPct = feature.current_pct ?? null
          const hasReference = healthyPct !== null && sickPct !== null && currentPct !== null

          // Determine relationship (Closer to healthy or sick)
          let statusLabel = "No baseline"
          let statusColor = "text-slate-400 bg-slate-800/50 border-slate-700/50"
          let isHealthyCloser = true

          if (hasReference) {
            const distToHealthy = Math.abs(currentPct - healthyPct)
            const distToSick = Math.abs(currentPct - sickPct)
            isHealthyCloser = distToHealthy < distToSick
            
            const dangerLevel = Math.max(0, Math.min(100, currentPct))
            if (isHealthyCloser) {
              statusLabel = "🟢 Healthy range"
              statusColor = "text-emerald-400 bg-emerald-950/40 border-emerald-500/20"
            } else if (dangerLevel > 70) {
              statusLabel = "🔴 Danger: Sick range"
              statusColor = "text-red-400 bg-red-950/40 border-red-500/20 shadow-sm shadow-red-950/50"
            } else {
              statusLabel = "🟡 Warning: Approaching sick"
              statusColor = "text-amber-400 bg-amber-950/40 border-amber-500/20"
            }
          }

          const isExpanded = expandedFeature === featureName

          return (
            <div 
              key={idx} 
              className="bg-emerald-950/20 rounded-xl border border-emerald-500/10 p-5 hover:border-emerald-500/25 transition-all duration-300 relative group overflow-hidden"
            >
              {/* Feature Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-emerald-900/30 border border-emerald-500/10 group-hover:scale-110 transition-transform">
                    {meta.emoji}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                        {meta.title}
                      </h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {meta.desc}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/5">
                  <span className="text-[10px] text-emerald-400 uppercase font-semibold">Analyzed Value</span>
                  <span className="text-xl font-extrabold text-slate-200">
                    {current.toFixed(4)} <span className="text-xs font-normal text-slate-400">{meta.unit}</span>
                  </span>
                </div>
              </div>

              {/* Slider Visual representation */}
              {hasReference ? (
                <div className="my-4 bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/5">
                  <div className="relative h-6 flex items-center mb-1">
                    {/* Line path */}
                    <div className="absolute left-0 right-0 h-1.5 rounded-full bg-slate-800 border border-slate-700/30" />
                    
                    {/* Track between references */}
                    <div 
                      className={`absolute h-1.5 opacity-30 rounded-full bg-gradient-to-r ${healthyPct < sickPct ? 'from-emerald-500 to-red-500' : 'from-red-500 to-emerald-500'}`}
                      style={{
                        left: `${Math.min(healthyPct, sickPct)}%`,
                        right: `${100 - Math.max(healthyPct, sickPct)}%`
                      }}
                    />

                    {/* Healthy range point */}
                    <div 
                      className="absolute w-4 h-4 -ml-2 rounded-full bg-emerald-500 border-2 border-slate-900 shadow shadow-emerald-500/50 flex items-center justify-center cursor-help group/healthy z-10"
                      style={{ left: `${healthyPct}%` }}
                      title={`Healthy Reference Baseline: ${healthy.toFixed(4)}`}
                    >
                      <div className="hidden group-hover/healthy:block absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 text-emerald-400 text-[10px] py-1 px-2 rounded border border-emerald-500/30 whitespace-nowrap z-20">
                        Healthy Ref: {healthy.toFixed(3)}
                      </div>
                    </div>

                    {/* Sick range point */}
                    <div 
                      className="absolute w-4 h-4 -ml-2 rounded-full bg-red-500 border-2 border-slate-900 shadow shadow-red-500/50 flex items-center justify-center cursor-help group/sick z-10"
                      style={{ left: `${sickPct}%` }}
                      title={`Sick Reference Baseline: ${sick.toFixed(4)}`}
                    >
                      <div className="hidden group-hover/sick:block absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950 text-red-400 text-[10px] py-1 px-2 rounded border border-red-500/30 whitespace-nowrap z-20">
                        Sick Ref: {sick.toFixed(3)}
                      </div>
                    </div>

                    {/* Current value marker */}
                    <div 
                      className="absolute -ml-3 -mt-3.5 z-20 cursor-help group/current"
                      style={{ left: `${Math.max(0, Math.min(100, currentPct))}%` }}
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-500 border-4 border-slate-900 glow-blue flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-100" />
                      </div>
                      <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-blue-950 text-blue-200 text-[10px] py-1 px-2 rounded border border-blue-500/50 whitespace-nowrap font-bold shadow-lg">
                        Analyzed: {current.toFixed(3)}
                      </div>
                    </div>
                  </div>

                  {/* Range Labels - Dynamically aligned based on feature scale orientation */}
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold px-1">
                    {healthyPct < sickPct ? (
                      <>
                        <span className="text-emerald-500/80">Sana (Ref)</span>
                        <span className="text-blue-400 font-bold">Imagen actual</span>
                        <span className="text-red-500/80">Enferma (Ref)</span>
                      </>
                    ) : (
                      <>
                        <span className="text-red-500/80">Enferma (Ref)</span>
                        <span className="text-blue-400 font-bold">Imagen actual</span>
                        <span className="text-emerald-500/80">Sana (Ref)</span>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="my-2 p-2 bg-yellow-950/20 border border-yellow-500/10 rounded text-xs text-yellow-500/80">
                  ⚠️ No comparative baseline range is available for this feature.
                </div>
              )}

              {/* Explanatory Toggle Button */}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-emerald-500/5">
                <button
                  onClick={() => setExpandedFeature(isExpanded ? null : featureName)}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
                >
                  {isExpanded ? "Collapse Details ▲" : "Scientific Details ▼"}
                </button>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Healthy: <strong className="text-slate-300">{healthy.toFixed(3)}</strong></span>
                  <span>Sick: <strong className="text-slate-300">{sick.toFixed(3)}</strong></span>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="mt-3 p-3 bg-emerald-950/30 rounded-lg border border-emerald-500/10 text-xs leading-relaxed text-slate-300 animate-fadeIn">
                  <p className="font-semibold text-emerald-400 mb-1">Spectral Significance:</p>
                  <p>{meta.desc}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] bg-slate-950/30 p-2 rounded">
                    <div>
                      <span className="text-slate-500 block">Raw code variable:</span>
                      <code className="text-emerald-300">{featureName}</code>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Health Deviation score:</span>
                      <span className="text-slate-300">{hasReference ? `${Math.round(Math.abs(currentPct - healthyPct))}% off-perfect` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
