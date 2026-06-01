import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const MIN_ZOOM = 0.5
const MAX_ZOOM = 8
const ZOOM_STEP = 0.2
const MIN_SELECTION_PX = 20
const VIEWPORT_PAD = 48
const IMAGE_WRAP_PAD = 24

export default function FigureZoom({ src, alt, caption, title, className = '' }) {
  const [open, setOpen] = useState(false)
  const [naturalSize, setNaturalSize] = useState(null)
  const [fitScale, setFitScale] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [tool, setTool] = useState('pan')
  const [selectRect, setSelectRect] = useState(null)

  const viewportRef = useRef(null)
  const imageWrapRef = useRef(null)
  const panning = useRef(false)
  const selecting = useRef(false)
  const panOrigin = useRef({ x: 0, y: 0, sl: 0, st: 0 })
  const selectStart = useRef(null)

  const close = useCallback(() => {
    setOpen(false)
    setZoom(1)
    setNaturalSize(null)
    setFitScale(1)
    setTool('pan')
    setSelectRect(null)
  }, [])

  const clampZoom = useCallback(
    (z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z)),
    []
  )

  const computeFitScale = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport || !naturalSize) return
    const availW = Math.max(100, viewport.clientWidth - VIEWPORT_PAD)
    const availH = Math.max(100, viewport.clientHeight - VIEWPORT_PAD)
    setFitScale(Math.min(availW / naturalSize.w, availH / naturalSize.h))
  }, [naturalSize])

  useEffect(() => {
    if (!open || !naturalSize) return undefined
    computeFitScale()
    window.addEventListener('resize', computeFitScale)
    return () => window.removeEventListener('resize', computeFitScale)
  }, [open, naturalSize, computeFitScale])

  const displayScale = fitScale * zoom
  const displayW = naturalSize ? Math.round(naturalSize.w * displayScale) : 0
  const displayH = naturalSize ? Math.round(naturalSize.h * displayScale) : 0

  const centerImage = useCallback(() => {
    const el = viewportRef.current
    if (!el || !naturalSize) return
    requestAnimationFrame(() => {
      const w = naturalSize.w * fitScale * zoom
      const h = naturalSize.h * fitScale * zoom
      el.scrollLeft = Math.max(0, (w + IMAGE_WRAP_PAD * 2 - el.clientWidth) / 2)
      el.scrollTop = Math.max(0, (h + IMAGE_WRAP_PAD * 2 - el.clientHeight) / 2)
    })
  }, [naturalSize, fitScale, zoom])

  const zoomIn = useCallback(() => setZoom((z) => clampZoom(z + ZOOM_STEP)), [clampZoom])
  const zoomOut = useCallback(() => setZoom((z) => clampZoom(z - ZOOM_STEP)), [clampZoom])

  const resetZoom = useCallback(() => {
    setZoom(1)
    setSelectRect(null)
    requestAnimationFrame(() => {
      const el = viewportRef.current
      if (!el || !naturalSize) return
      const w = naturalSize.w * fitScale
      const h = naturalSize.h * fitScale
      el.scrollLeft = Math.max(0, (w + IMAGE_WRAP_PAD * 2 - el.clientWidth) / 2)
      el.scrollTop = Math.max(0, (h + IMAGE_WRAP_PAD * 2 - el.clientHeight) / 2)
    })
  }, [naturalSize, fitScale])

  const applySelectionZoom = useCallback(
    (rect) => {
      const viewport = viewportRef.current
      if (!viewport || !naturalSize || !rect) return

      const x1 = Math.min(rect.x1, rect.x2)
      const y1 = Math.min(rect.y1, rect.y2)
      const x2 = Math.max(rect.x1, rect.x2)
      const y2 = Math.max(rect.y1, rect.y2)
      const sw = x2 - x1
      const sh = y2 - y1
      if (sw < MIN_SELECTION_PX || sh < MIN_SELECTION_PX) return

      const currentScale = fitScale * zoom
      const natW = sw / currentScale
      const natH = sh / currentScale
      const natX1 = x1 / currentScale
      const natY1 = y1 / currentScale

      const availW = Math.max(100, viewport.clientWidth - VIEWPORT_PAD)
      const availH = Math.max(100, viewport.clientHeight - VIEWPORT_PAD)
      const targetScale = Math.min(availW / natW, availH / natH)
      const newZoom = clampZoom(targetScale / fitScale)

      setZoom(newZoom)
      setSelectRect(null)

      const newDisplayScale = fitScale * newZoom
      requestAnimationFrame(() => {
        const selLeft = natX1 * newDisplayScale
        const selTop = natY1 * newDisplayScale
        const selW = natW * newDisplayScale
        const selH = natH * newDisplayScale
        viewport.scrollLeft = Math.max(
          0,
          IMAGE_WRAP_PAD + selLeft - (viewport.clientWidth - selW) / 2
        )
        viewport.scrollTop = Math.max(
          0,
          IMAGE_WRAP_PAD + selTop - (viewport.clientHeight - selH) / 2
        )
      })
    },
    [naturalSize, fitScale, zoom, clampZoom]
  )

  const getImagePoint = useCallback(
    (clientX, clientY, { clamp = false } = {}) => {
      const wrap = imageWrapRef.current
      if (!wrap || !displayW || !displayH) return null
      const rect = wrap.getBoundingClientRect()
      let x = clientX - rect.left
      let y = clientY - rect.top
      if (clamp) {
        return {
          x: Math.max(0, Math.min(displayW, x)),
          y: Math.max(0, Math.min(displayH, y)),
        }
      }
      if (x < 0 || y < 0 || x > displayW || y > displayH) return null
      return { x, y }
    },
    [displayW, displayH]
  )

  const blockNativeDrag = useCallback((e) => {
    e.preventDefault()
  }, [])

  useEffect(() => {
    if (!open) return undefined

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (selectRect) setSelectRect(null)
        else close()
      }
      if (e.key === '+' || e.key === '=') zoomIn()
      if (e.key === '-') zoomOut()
      if (e.key === '0') resetZoom()
      if (e.key === 'v' || e.key === 'V') setTool('pan')
      if (e.key === 'z' || e.key === 'Z') setTool('select')
    }

    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close, zoomIn, zoomOut, resetZoom, selectRect])

  useEffect(() => {
    const el = viewportRef.current
    if (!open || !el) return undefined

    const onWheel = (e) => {
      if (tool === 'select') return
      e.preventDefault()
      setZoom((z) => clampZoom(z + (e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP)))
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [open, clampZoom, tool])

  useEffect(() => {
    if (!open) return undefined
    document.addEventListener('dragstart', blockNativeDrag)
    document.addEventListener('selectstart', blockNativeDrag)
    return () => {
      document.removeEventListener('dragstart', blockNativeDrag)
      document.removeEventListener('selectstart', blockNativeDrag)
    }
  }, [open, blockNativeDrag])

  useEffect(() => {
    if (!open) return
    const img = new Image()
    img.src = src
    if (img.complete && img.naturalWidth) {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
    } else {
      img.onload = () => setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
    }
  }, [open, src])

  useEffect(() => {
    if (!open || !naturalSize || zoom !== 1) return
    centerImage()
  }, [open, naturalSize, fitScale, zoom, centerImage])

  const onImageLoad = useCallback((e) => {
    setNaturalSize({
      w: e.currentTarget.naturalWidth,
      h: e.currentTarget.naturalHeight,
    })
  }, [])

  const onViewportPointerDown = (e) => {
    if (e.button !== 0) return
    const el = viewportRef.current
    if (!el) return

    e.preventDefault()

    if (tool === 'select') {
      const pt = getImagePoint(e.clientX, e.clientY)
      if (!pt) return
      selecting.current = true
      selectStart.current = pt
      setSelectRect({ x1: pt.x, y1: pt.y, x2: pt.x, y2: pt.y })
      el.setPointerCapture(e.pointerId)
      return
    }

    if (tool === 'pan') {
      panning.current = true
      panOrigin.current = {
        x: e.clientX,
        y: e.clientY,
        sl: el.scrollLeft,
        st: el.scrollTop,
      }
      el.setPointerCapture(e.pointerId)
    }
  }

  const onViewportPointerMove = (e) => {
    if (panning.current) {
      e.preventDefault()
      const el = viewportRef.current
      if (!el) return
      el.scrollLeft = panOrigin.current.sl - (e.clientX - panOrigin.current.x)
      el.scrollTop = panOrigin.current.st - (e.clientY - panOrigin.current.y)
      return
    }

    if (selecting.current) {
      e.preventDefault()
      const pt = getImagePoint(e.clientX, e.clientY, { clamp: true })
      if (!pt || !selectStart.current) return
      setSelectRect({
        x1: selectStart.current.x,
        y1: selectStart.current.y,
        x2: pt.x,
        y2: pt.y,
      })
    }
  }

  const onViewportPointerUp = (e) => {
    if (panning.current) {
      panning.current = false
      viewportRef.current?.releasePointerCapture(e.pointerId)
      return
    }

    if (selecting.current) {
      selecting.current = false
      viewportRef.current?.releasePointerCapture(e.pointerId)
      const start = selectStart.current
      const end = getImagePoint(e.clientX, e.clientY, { clamp: true })
      selectStart.current = null
      setSelectRect(null)
      if (start && end) {
        applySelectionZoom({ x1: start.x, y1: start.y, x2: end.x, y2: end.y })
      }
    }
  }

  const selectionStyle = selectRect
    ? {
        left: Math.min(selectRect.x1, selectRect.x2),
        top: Math.min(selectRect.y1, selectRect.y2),
        width: Math.abs(selectRect.x2 - selectRect.x1),
        height: Math.abs(selectRect.y2 - selectRect.y1),
      }
    : null

  const zoomPercent = Math.round(zoom * 100)

  const modal = open && (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-slate-950/95 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={title || alt}
      onClick={close}
    >
      <div
        className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-emerald-500/15 bg-slate-900/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 flex-1">
          {title && <h3 className="text-sm font-bold text-slate-100 truncate">{title}</h3>}
          <p className="text-[10px] text-slate-500 mt-0.5">
            {tool === 'select'
              ? 'Dibuja un rectángulo sobre la zona a ampliar'
              : 'Arrastra para mover · Rueda para zoom · Z = selección'}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0 rounded-lg border border-slate-700 p-0.5 bg-slate-800/80">
          <button
            type="button"
            onClick={() => { setTool('pan'); setSelectRect(null) }}
            className={`px-2.5 h-8 rounded-md text-[10px] font-bold uppercase transition-colors ${
              tool === 'pan'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Pan (V)"
          >
            Pan
          </button>
          <button
            type="button"
            onClick={() => setTool('select')}
            className={`px-2.5 h-8 rounded-md text-[10px] font-bold uppercase transition-colors ${
              tool === 'select'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Zoom por selección (Z)"
          >
            Select
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={zoomOut}
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-lg border border-slate-700"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="text-xs font-mono text-emerald-400 w-14 text-center tabular-nums">
            {zoomPercent}%
          </span>
          <button
            type="button"
            onClick={zoomIn}
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-lg border border-slate-700"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={resetZoom}
            className="px-2.5 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-slate-700 uppercase"
          >
            Fit
          </button>
          <button
            type="button"
            onClick={close}
            className="px-3 h-9 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-bold border border-emerald-500/30"
          >
            ✕ Close
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="flex-1 min-h-0 overflow-auto bg-slate-950/50 select-none"
        style={{
          cursor: tool === 'select' ? 'crosshair' : zoom > 1 ? 'grab' : 'default',
          touchAction: tool === 'select' ? 'none' : 'pan-x pan-y',
        }}
        onClick={(e) => e.stopPropagation()}
        onDragStart={blockNativeDrag}
        onPointerDown={onViewportPointerDown}
        onPointerMove={onViewportPointerMove}
        onPointerUp={onViewportPointerUp}
        onPointerCancel={onViewportPointerUp}
      >
        <div
          className="inline-block p-6"
          style={{
            minWidth: displayW ? displayW + IMAGE_WRAP_PAD * 2 : '100%',
            minHeight: displayH ? displayH + IMAGE_WRAP_PAD * 2 : '100%',
          }}
        >
          <div
            ref={imageWrapRef}
            className="relative inline-block select-none"
            style={{
              width: displayW || undefined,
              height: displayH || undefined,
              WebkitUserDrag: 'none',
              userSelect: 'none',
            }}
            onDragStart={blockNativeDrag}
          >
            <img
              src={src}
              alt={alt}
              draggable={false}
              onDragStart={blockNativeDrag}
              onLoad={onImageLoad}
              width={displayW || undefined}
              height={displayH || undefined}
              className="block rounded-lg shadow-2xl shadow-black/50 select-none max-w-none max-h-none pointer-events-none"
              style={{
                width: displayW || 'auto',
                height: displayH || 'auto',
                WebkitUserDrag: 'none',
                userSelect: 'none',
              }}
            />
            {selectionStyle && (
              <div
                className="absolute border-2 border-emerald-400 bg-emerald-400/25 pointer-events-none rounded-sm"
                style={selectionStyle}
              />
            )}
          </div>
        </div>
      </div>

      {caption && (
        <p
          className="shrink-0 px-4 py-2 text-xs text-slate-400 border-t border-emerald-500/10 bg-slate-900/60 max-h-24 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {caption}
        </p>
      )}
    </div>
  )

  return (
    <>
      <figure className={`my-6 ${className}`}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group w-full text-left rounded-xl overflow-hidden border border-emerald-500/15 bg-slate-950/40 hover:border-emerald-500/35 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          aria-label={`Zoom: ${title || alt}`}
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            onDragStart={blockNativeDrag}
            className="w-full h-auto object-contain max-h-[420px] mx-auto bg-white/5 group-hover:opacity-95 transition-opacity select-none"
          />
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-emerald-950/30 border-t border-emerald-500/10">
            <span className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">
              Click to expand fullscreen
            </span>
            <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-wide">
              🔍 Expand
            </span>
          </div>
        </button>
        {caption && (
          <figcaption className="mt-3 text-xs text-slate-400 leading-relaxed italic px-1">
            {caption}
          </figcaption>
        )}
      </figure>

      {modal && createPortal(modal, document.body)}
    </>
  )
}
