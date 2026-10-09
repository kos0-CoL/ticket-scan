/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Redirige la compilación para que el plugin de Netlify empaquete los CSS correctamente
  distDir: '../../apps/api/.next',

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