/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_URL || 'https://ticket-ar.netlify.app';
    return [
      {
        source: '/api/:path*',
        destination: `${api}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;