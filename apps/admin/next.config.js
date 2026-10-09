/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,

  async rewrites() {
    const api = process.env.API_URL || 'https://netlify.app';
    return [
      {
        source: '/api/:path*',
        destination: `${api}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;