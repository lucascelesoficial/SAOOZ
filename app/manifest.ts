import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SAOOZ',
    short_name: 'SAOOZ',
    description: 'Entenda para onde vai seu dinheiro em menos de 5 segundos.',
    start_url: '/central',
    display: 'standalone',
    background_color: '#1E3A8A',
    theme_color: '#1E3A8A',
    orientation: 'portrait',
    categories: ['finance', 'productivity'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
