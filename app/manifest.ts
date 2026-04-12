import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SAOOZ - Dashboard Financeiro',
    short_name: 'SAOOZ',
    description: 'Entenda para onde vai seu dinheiro em menos de 5 segundos.',
    start_url: '/central',
    display: 'standalone',
    background_color: '#080d28',
    theme_color: '#080d28',
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
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}
