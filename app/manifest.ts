import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PearFy — Gestão Financeira PF e PJ',
    short_name: 'PearFy',
    description: 'Gerencie sua vida financeira pessoal e empresarial com inteligência artificial.',
    start_url: '/central',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#026648',
    orientation: 'portrait',
    categories: ['finance', 'productivity'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
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
