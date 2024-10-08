import type {
  MetadataRoute
} from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Clay Curry',
    short_name: 'Clay Curry',
    description: 'Clay Curry',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}