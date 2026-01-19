/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  rewrites: async () => {
    return [
      {
        source: '/',
        destination: '/about',
      },{
      source: '/writing',
        destination: '/blog'
      },
      {
        source: '/sitemap.xml',
        destination: 'https://claycurry.com/sitemap.xml',
      },
      {
        source: '/robots.txt',
        destination: 'https://claycurry.com/robots.txt',
      },
    ]
  }
 
}

export default nextConfig