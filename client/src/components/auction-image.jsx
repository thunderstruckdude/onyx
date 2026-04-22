import { useMemo, useState } from 'react'

function buildFallback (label) {
  const safeLabel = String(label || 'Onyx Listing').slice(0, 28).replace(/</g, '').replace(/>/g, '')
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#0b1220"/>
          <stop offset="55%" stop-color="#0f2942"/>
          <stop offset="100%" stop-color="#0d3f44"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="700" fill="url(#g)"/>
      <circle cx="1020" cy="90" r="180" fill="#34d39922"/>
      <circle cx="220" cy="650" r="260" fill="#22d3ee22"/>
      <text x="70" y="620" fill="#cbd5e1" font-size="56" font-family="Inter, Arial, sans-serif">${safeLabel}</text>
    </svg>
  `
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function AuctionImage ({ src, alt, className }) {
  const fallback = useMemo(() => buildFallback(alt), [alt])
  const [imageSrc, setImageSrc] = useState(src || fallback)

  return (
    <img
      src={imageSrc}
      alt={alt}
      loading="lazy"
      onError={() => setImageSrc(fallback)}
      className={className}
    />
  )
}
