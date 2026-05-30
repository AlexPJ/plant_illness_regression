import { useState, useRef } from 'react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config'

export default function ImageUpload({ onPrediction, setLoading, setError }) {
  const [preview, setPreview] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const processFile = async (file) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG or JPEG)')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Submit to API
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await axios.post(API_ENDPOINTS.predict, formData)
      onPrediction(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Illness prediction analysis failed.')
      setPreview(null)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    processFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    processFile(file)
  }

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="space-y-4 animate-fadeIn">
          <div className="relative rounded-xl overflow-hidden border border-emerald-500/10 shadow-lg shadow-black/40 bg-slate-950">
            <img
              src={preview}
              alt="preview"
              className="w-full h-72 object-contain bg-emerald-950/10"
            />
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur border border-emerald-500/20 rounded-lg px-2.5 py-1 text-xs text-emerald-400 font-bold uppercase tracking-wider">
              Selected Leaf Image
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3 px-4 rounded-xl transition duration-300 transform active:scale-[0.98] shadow-md shadow-emerald-500/20"
          >
            🔄 Select Different Plant Image
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 relative group overflow-hidden ${
            isDragOver 
              ? 'border-emerald-400 bg-emerald-950/30 scale-[1.02] shadow-xl shadow-emerald-500/10' 
              : 'border-emerald-500/20 bg-emerald-950/10 hover:border-emerald-500/50 hover:bg-emerald-950/20'
          }`}
        >
          {/* Decorative design elements */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="text-5xl mb-4 transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
            🌿
          </div>
          <p className="text-slate-100 font-bold text-lg mb-1 group-hover:text-emerald-400 transition-colors">
            Drop your leaf image here
          </p>
          <p className="text-slate-400 text-sm mb-4">
            or click to browse local files
          </p>
          <div className="inline-block px-3 py-1 bg-emerald-950/40 border border-emerald-500/10 rounded-full text-xs text-emerald-400/80 font-semibold">
            Supports JPEG, PNG & WebP (max 6MB)
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
