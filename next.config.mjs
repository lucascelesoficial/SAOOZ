/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' }
    ]
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'saooz.com' }],
        destination: 'https://www.saooz.com/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
