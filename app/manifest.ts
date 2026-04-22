import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pear Finance',
    short_name: 'Pear',
    description: 'Finanças inteligentes para um futuro mais brilhante.',
    start_url: '/central',
    display: 'standalone',
    background_color: '#0E2C58',
    theme_color: '#74A93D',
    orientation: 'portrait',
    categories: ['finance', 'productivity'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/pear-finance-logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}
