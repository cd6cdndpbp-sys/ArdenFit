import { useState, useEffect, useRef } from 'react'

// Dependency-free crossfade: each src change adds a new top layer that fades in via CSS
// (see .fade-in-layer in index.css); the previous layer is dropped once the fade completes,
// so it never grows past two DOM nodes at a time.
export function useCrossfadeLayers(src, fadeMs = 600) {
  const [layers, setLayers] = useState(() => [{ src, id: 0 }])
  const nextId = useRef(1)

  useEffect(() => {
    setLayers(prev => prev[prev.length - 1].src === src ? prev : [...prev, { src, id: nextId.current++ }])
  }, [src])

  useEffect(() => {
    if (layers.length < 2) return
    const t = setTimeout(() => setLayers(l => l.slice(-1)), fadeMs)
    return () => clearTimeout(t)
  }, [layers, fadeMs])

  return layers
}
