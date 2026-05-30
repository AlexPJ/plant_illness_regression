import { useState } from 'react'

export default function PredictionResult({ prediction }) {
  const diseaseRating = prediction.predicted_disease_rating || 0
  const affectedArea = prediction.affected_area_pct || 0
  const overlayImageBase64 = prediction.overlay_image_base64
  const healthyRefBase64 = prediction.healthy_ref_image_base64
  const verySickRefBase64 = prediction.very_sick_ref_image_base64

  const [activeTab, setActiveTab] = useState('grid') // 'grid' | 'healthy' | 'sick' | 'analyzed'
  const [modalImage, setModalImage] = useState(null) // { src, title, label }

  const ratingPercent = Math.max(0, Math.min(100, diseaseRating))

  const getHealthStatus = (rating) => {
    if (rating < 30) {
      return { 
        label: 'HEALTHY / STABLE', 
        color: 'text-emerald-400', 
        borderColor: 'border-emerald-500/20',
        bgColor: 'bg-emerald-950/20', 
        barColor: 'bg-emerald-500', 
        glow: 'glow-green',
        msg: 'The plant shows minimal to no signs of active disease. Cellular green pigmentation is standard.'
      }
    }
    if (rating < 60) {
      return { 
        label: 'WARNING / MODERATE DISTRESS', 
        color: 'text-amber-400', 
        borderColor: 'border-amber-500/20',
        bgColor: 'bg-amber-950/20', 
        barColor: 'bg-amber-500', 
        glow: 'glow-yellow',
        msg: 'Early indicators of necrosis or chlorosis detected. Fungal spots are emerging on the leaf structure.'
      }
    }
    return { 
      label: 'SEVERE ILLNESS DETECTED', 
      color: 'text-red-400', 
      borderColor: 'border-red-500/20',
      bgColor: 'bg-red-950/20', 
      barColor: 'bg-red-500', 
      glow: 'glow-red',
      msg: 'Critical chlorophyll loss and tissue death. Necrotic fungal legions span significant portions of the plant structure.'
    }
  }

  const status = getHealthStatus(ratingPercent)

  const formatB64 = (b64) => {
    if (!b64) return ''
    return b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`
  }

  const handleImageClick = (src, title, label) => {
    setModalImage({ src, title, label })
  }

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient corner */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 mb-6 border-b border-emerald-500/10 pb-4 flex items-center gap-2">
        🎯 Disease Assessment Report
      </h2>

      {/* Grid containing gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* Severity gauge */}
        <div className={`rounded-xl border ${status.borderColor} ${status.bgColor} p-5 relative overflow-hidden flex flex-col justify-between`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Severity Rating</h3>
            <span className={`text-3xl font-extrabold ${status.color}`}>
              {diseaseRating.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-800 p-0.5 mb-3">
            <div
              className={`h-2 rounded-full transition-all ${status.barColor} ${status.glow}`}
              style={{ width: `${ratingPercent}%` }}
            />
          </div>
          <div>
            <div className={`text-xs font-bold ${status.color} uppercase tracking-wider mb-1`}>
              Status: {status.label}
            </div>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              {status.msg}
            </p>
          </div>
        </div>

        {/* Affected Area gauge */}
        <div className="rounded-xl border border-blue-500/15 bg-blue-950/20 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider">Affected Area</h3>
            <span className="text-3xl font-extrabold text-blue-400">
              {affectedArea.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-800 p-0.5 mb-3">
            <div
              className="h-2 rounded-full bg-blue-500 glow-blue transition-all"
              style={{ width: `${Math.max(0, Math.min(100, affectedArea))}%` }}
            />
          </div>
          <div>
            <div className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">
              Tissue Necrosis Ratio
            </div>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              Percentage of total pixel mass exhibiting early and late stage disease symptoms.
            </p>
          </div>
        </div>
      </div>

      {/* THREE SIDE-BY-SIDE IMAGES (Sana vs Muy Enferma vs Analizada) */}
      <div className="rounded-xl border border-emerald-500/10 bg-emerald-950/10 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 border-b border-emerald-500/5 pb-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            🖼️ Specimen Comparison Grid
          </span>
          
          {/* TAB LAYOUT SELECTOR */}
          <div className="flex flex-wrap gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'grid' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
            >
              📋 Grid View
            </button>
            <button
              onClick={() => setActiveTab('healthy')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'healthy' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🟢 Healthy Ref
            </button>
            <button
              onClick={() => setActiveTab('sick')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'sick' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🔴 Sick Ref
            </button>
            <button
              onClick={() => setActiveTab('analyzed')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'analyzed' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🔵 Analyzed Leaf
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 mb-3 italic">
          💡 Tip: Click on any image to open it in full screen Zoom mode.
        </p>

        {/* CONDITIONALLY RENDER VIEWS */}
        {activeTab === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
            {/* Healthy Reference */}
            <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-850 flex flex-col items-center">
              <span className="text-xs text-emerald-400 font-bold mb-2">Referencia sana</span>
              <div className="text-[10px] text-emerald-500 bg-emerald-950/50 px-2 py-0.5 rounded-full font-bold mb-2 border border-emerald-500/10">
                Label = 1.0
              </div>
              {healthyRefBase64 ? (
                <img
                  src={formatB64(healthyRefBase64)}
                  alt="healthy reference"
                  className="w-full h-auto object-contain rounded border border-slate-800 bg-slate-950 aspect-square hover:scale-[1.03] transition-transform duration-300 cursor-zoom-in"
                  onClick={() => handleImageClick(formatB64(healthyRefBase64), 'Referencia sana', 'Label = 1.0')}
                />
              ) : (
                <div className="w-full aspect-square bg-slate-950 rounded flex items-center justify-center text-[10px] text-slate-500">
                  No healthy image
                </div>
              )}
            </div>

            {/* Very Sick Reference */}
            <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-850 flex flex-col items-center">
              <span className="text-xs text-red-400 font-bold mb-2">Referencia muy enferma</span>
              <div className="text-[10px] text-red-500 bg-red-950/50 px-2 py-0.5 rounded-full font-bold mb-2 border border-red-500/10">
                Label = 95.0
              </div>
              {verySickRefBase64 ? (
                <img
                  src={formatB64(verySickRefBase64)}
                  alt="very sick reference"
                  className="w-full h-auto object-contain rounded border border-slate-800 bg-slate-950 aspect-square hover:scale-[1.03] transition-transform duration-300 cursor-zoom-in"
                  onClick={() => handleImageClick(formatB64(verySickRefBase64), 'Referencia muy enferma', 'Label = 95.0')}
                />
              ) : (
                <div className="w-full aspect-square bg-slate-950 rounded flex items-center justify-center text-[10px] text-slate-500">
                  No sick image
                </div>
              )}
            </div>

            {/* Analyzed Image with Overlay */}
            <div className="bg-slate-900/50 p-2.5 rounded-lg border border-emerald-500/20 flex flex-col items-center shadow-md shadow-emerald-500/5">
              <span className="text-xs text-blue-400 font-bold mb-2">Imagen analizada</span>
              <div className="text-[10px] text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded-full font-bold mb-2 border border-blue-500/25">
                Pred = {diseaseRating.toFixed(1)}% | Mask = {affectedArea.toFixed(1)}%
              </div>
              {overlayImageBase64 ? (
                <img
                  src={formatB64(overlayImageBase64)}
                  alt="analyzed specimen overlay"
                  className="w-full h-auto object-contain rounded border border-slate-800 bg-slate-950 aspect-square glow-blue hover:scale-[1.03] transition-transform duration-300 cursor-zoom-in"
                  onClick={() => handleImageClick(formatB64(overlayImageBase64), 'Imagen analizada', `Predicción: ${diseaseRating.toFixed(1)}% | Zona marcada: ${affectedArea.toFixed(1)}%`)}
                />
              ) : (
                <div className="w-full aspect-square bg-slate-950 rounded flex items-center justify-center text-[10px] text-slate-500">
                  No overlay image
                </div>
              )}
            </div>
          </div>
        )}

        {/* FOCUS TAB: HEALTHY */}
        {activeTab === 'healthy' && (
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-center animate-fadeIn">
            <span className="text-sm font-bold text-emerald-400 block mb-2">Referencia sana (Label = 1.0)</span>
            {healthyRefBase64 ? (
              <img
                src={formatB64(healthyRefBase64)}
                alt="healthy reference focused"
                className="w-full max-w-xl mx-auto h-auto object-contain rounded-lg border border-slate-850 bg-slate-950 hover:scale-[1.01] transition-transform duration-300 cursor-zoom-in"
                onClick={() => handleImageClick(formatB64(healthyRefBase64), 'Referencia sana', 'Label = 1.0')}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">No healthy image available</div>
            )}
          </div>
        )}

        {/* FOCUS TAB: SICK */}
        {activeTab === 'sick' && (
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-center animate-fadeIn">
            <span className="text-sm font-bold text-red-400 block mb-2">Referencia muy enferma (Label = 95.0)</span>
            {verySickRefBase64 ? (
              <img
                src={formatB64(verySickRefBase64)}
                alt="very sick reference focused"
                className="w-full max-w-xl mx-auto h-auto object-contain rounded-lg border border-slate-850 bg-slate-950 hover:scale-[1.01] transition-transform duration-300 cursor-zoom-in"
                onClick={() => handleImageClick(formatB64(verySickRefBase64), 'Referencia muy enferma', 'Label = 95.0')}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">No sick image available</div>
            )}
          </div>
        )}

        {/* FOCUS TAB: ANALYZED */}
        {activeTab === 'analyzed' && (
          <div className="bg-slate-900/40 p-4 rounded-xl border border-emerald-500/20 text-center shadow-lg shadow-emerald-500/5 animate-fadeIn">
            <span className="text-sm font-bold text-blue-400 block mb-2">
              Imagen analizada (Predicción: {diseaseRating.toFixed(1)}% | Zona marcada: {affectedArea.toFixed(1)}%)
            </span>
            {overlayImageBase64 ? (
              <img
                src={formatB64(overlayImageBase64)}
                alt="analyzed leaf focused"
                className="w-full max-w-xl mx-auto h-auto object-contain rounded-lg border border-slate-850 bg-slate-950 glow-blue hover:scale-[1.01] transition-transform duration-300 cursor-zoom-in"
                onClick={() => handleImageClick(formatB64(overlayImageBase64), 'Imagen analizada', `Predicción: ${diseaseRating.toFixed(1)}% | Zona marcada: ${affectedArea.toFixed(1)}%`)}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">No overlay image available</div>
            )}
          </div>
        )}
      </div>

      {/* FULLSCREEN LIGHTBOX PORTAL / MODAL */}
      {modalImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
          onClick={() => setModalImage(null)}
        >
          <div 
            className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-5 max-w-3xl w-full shadow-2xl relative cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 bg-slate-950/60 p-2 rounded-full border border-slate-800 transition-colors font-bold text-xs"
              onClick={() => setModalImage(null)}
            >
              ✕ Close
            </button>

            {/* Header info */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-100">{modalImage.title}</h3>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/20 mt-1 inline-block">
                {modalImage.label}
              </span>
            </div>

            {/* Large Image */}
            <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 p-2 flex items-center justify-center max-h-[70vh]">
              <img 
                src={modalImage.src} 
                alt="fullscreen analysis zoom" 
                className="max-w-full max-h-[65vh] object-contain rounded-lg"
              />
            </div>

            {/* Footer zoom tips */}
            <p className="text-[10px] text-slate-500 text-center mt-3">
              Press Escape or click anywhere outside to close the specimen Zoom viewer.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
