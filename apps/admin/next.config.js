/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Las páginas del admin hacen fetch a rutas relativas (/api/admin/*),
  // pero las rutas /api viven en el sitio de la API (ticket-ar.netlify.app).
  // El proxy se resuelve AQUÍ (rewrite de Next, solo en la app admin) y no
  // en netlify.toml: una regla [[redirects]] en netlify.toml sería leída
  // también por el sitio de la API si su base directory apunta a apps/admin
  // y secuestraría /api/* en producción (proxy hacia sí mismo → 404).
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
