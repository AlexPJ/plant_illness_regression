import { useState } from 'react'
import ImageUpload from './components/ImageUpload'
import PredictionResult from './components/PredictionResult'
import FeatureComparison from './components/FeatureComparison'

export default function App() {
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 relative animate-float">
          {/* Subtle floating background blur behind header */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-24 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-emerald-950/60 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-400 mb-4 shadow-lg shadow-black/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AI DEEP LEARNING MODEL v2.1
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 tracking-tight">
            🌱 Plant Health AI
          </h1>
          <p className="text-base md:text-lg text-emerald-400/70 max-w-xl mx-auto mt-3 font-medium">
            Next-generation neural disease diagnosis and micro-spectral feature analysis.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Control Panel / Upload (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              {/* Background gradient light effect */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 mb-4 flex items-center gap-2">
                📸 Diagnostics Console
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Upload high-resolution photography of a leaf to perform complete spectral analysis and neural disease rating.
              </p>
              
              <ImageUpload
                onPrediction={setPrediction}
                setLoading={setLoading}
                setError={setError}
              />
            </div>

            {/* Quick Scientific Info Card */}
            <div className="glass-panel rounded-2xl p-5 border border-emerald-500/5 bg-slate-950/20 text-xs text-slate-400 leading-relaxed">
              <span className="font-bold text-emerald-400 block mb-1">🔬 SYSTEM PARAMETERS</span>
              <p className="mb-2">
                The model uses compact 57-dimensional feature vectors including Excess Green (ExG), HSV distribution, yellow/brown masks, and custom morphologic filters.
              </p>
              <div className="flex justify-between text-[10px] text-emerald-500 border-t border-emerald-500/5 pt-2 font-semibold">
                <span>MODEL: MLP-Regressor</span>
                <span>INPUT SIZE: 160px (Aug)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Results Dashboard (Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            {error && (
              <div className="bg-red-950/30 border border-red-500/20 rounded-2xl p-6 shadow-xl text-left animate-fadeIn">
                <h3 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                  ⚠️ Analysis Interrupted
                </h3>
                <p className="text-sm text-slate-300">{error}</p>
              </div>
            )}

            {loading && (
              <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[350px] shadow-2xl relative">
                <div className="relative mb-6">
                  {/* Outer glowing pulsing ring */}
                  <div className="absolute inset-0 w-20 h-20 rounded-full border border-emerald-500/20 animate-ping" />
                  {/* Spinning/pulsating plant icon */}
                  <div className="w-20 h-20 border-4 border-emerald-950 border-t-emerald-400 rounded-full animate-spin flex items-center justify-center shadow-lg shadow-emerald-500/10">
                    <span className="text-3xl animate-pulse">🌱</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-200 mb-1">Spectral Engine Working</h3>
                <p className="text-xs text-emerald-400/70 max-w-xs leading-relaxed animate-pulse">
                  Extracting channels, segmenting background masks, and computing color histogams...
                </p>
              </div>
            )}

            {prediction && !loading && (
              <div className="space-y-8 animate-fadeIn">
                <PredictionResult prediction={prediction} />
                <FeatureComparison prediction={prediction} />
              </div>
            )}

            {!prediction && !loading && !error && (
              <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[350px] shadow-2xl group border border-dashed border-emerald-500/10">
                <div className="text-6xl mb-4 opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-300">
                  🔬
                </div>
                <h3 className="text-lg font-bold text-slate-300 mb-1">Awaiting Specimen</h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Provide an image to the uploader console to launch the machine learning health diagnostics pipeline.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
