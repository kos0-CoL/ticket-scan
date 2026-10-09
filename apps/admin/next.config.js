/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,

  async rewrites() {
    const api = process.env.API_URL || 'https://ticket-ar.netlify.app';
    return [
      {
        source: '/api/:path*',
        destination: `${api}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;