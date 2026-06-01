import { useState } from 'react'
import ImageUpload from './ImageUpload'
import PredictionResult from './PredictionResult'
import FeatureComparison from './FeatureComparison'

export default function AppConsole() {
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
      <div className="lg:col-span-4 space-y-6">
        <div className="glass-panel rounded-2xl p-6 shadow-2xl relative overflow-hidden">
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

      <div className="lg:col-span-8 space-y-6">
        {error && (
          <div className="bg-red-950/30 border border-red-500/20 rounded-2xl p-6 shadow-xl text-left">
            <h3 className="font-bold text-red-400 mb-2 flex items-center gap-2">
              ⚠️ Analysis Interrupted
            </h3>
            <p className="text-sm text-slate-300">{error}</p>
          </div>
        )}

        {loading && (
          <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[350px] shadow-2xl relative">
            <div className="relative mb-6">
              <div className="absolute inset-0 w-20 h-20 rounded-full border border-emerald-500/20 animate-ping" />
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
          <div className="space-y-8">
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
  )
}
