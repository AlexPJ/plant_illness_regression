import { useState } from 'react'
import AppConsole from './components/AppConsole'
import AnalysisArticle from './content/AnalysisArticle'
import ArchitectureTab from './content/ArchitectureTab'

const MAIN_TABS = [
  { id: 'app', label: 'App', icon: '🌱' },
  { id: 'analysis', label: 'Analysis', icon: '📝' },
  { id: 'architecture', label: 'Architecture', icon: '🏗️' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('app')

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 relative animate-float">
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

        <nav
          className="flex flex-wrap justify-center gap-2 mb-10"
          aria-label="Main sections"
        >
          {MAIN_TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === id
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'glass-panel text-slate-400 hover:text-slate-200 hover:border-emerald-500/20'
              }`}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {activeTab === 'app' && <AppConsole />}

        {activeTab === 'analysis' && (
          <div className="max-w-4xl mx-auto">
            <AnalysisArticle />
          </div>
        )}

        {activeTab === 'architecture' && <ArchitectureTab />}
      </div>
    </div>
  )
}
