import { NextResponse } from 'next/server';

export async function GET() {
  // Landing page configuration - this would come from DB in production
  const config = {
    hero: {
      enabled: true,
      title: 'Escanea, categoriza y analiza tus',
      subtitle: 'tickets de supermercado',
      cta_text: 'Descargar APK',
      cta_url: 'https://mediafire.com',
      badge: 'Versión Beta',
      image: '/hero-illustration.svg',
    },
    features: {
      enabled: true,
      title: 'Todo lo que necesitas para',
      subtitle: 'controlar tus compras',
      items: [
        { icon: '📷', title: 'Escaneo OCR Inteligente', description: 'Apunta la cámara a tu ticket y extraemos automáticamente productos, precios y totales con IA avanzada.' },
        { icon: '🏷️', title: 'Categorización Automática', description: 'Cada producto se clasifica en categorías (alimentos, limpieza, bebidas, etc.) para que veas en qué gastas.' },
        { icon: '📊', title: 'Gráficos de Gasto', description: 'Visualiza tu evolución mensual, compara supermercados y detecta donde ahorrar con charts interactivos.' },
        { icon: '📄', title: 'Exportar a PDF/Excel', description: 'Descarga tus tickets procesados en PDF o Excel para llevar el control contable o compartir con tu contador.' },
      ],
    },
    'social-proof': {
      enabled: true,
      title: 'Confiada por miles de familias argentinas',
      subtitle: 'Únete a quienes ya llevan el control de su presupuesto sin esfuerzo.',
      testimonials: [
        { text: 'Ahorro 2 horas por semana cargando gastos. El OCR es increíblemente preciso.', author: 'María G.', location: 'Buenos Aires', rating: 5 },
        { text: 'Por fin sé exactamente en qué se me va el sueldo. Los gráficos son muy útiles.', author: 'Carlos R.', location: 'Córdoba', rating: 5 },
        { text: 'La exportación a Excel me salvó para la declaración de ganancias. 10/10.', author: 'Lucía M.', location: 'Rosario', rating: 5 },
      ],
    },
    'cta-download': {
      enabled: true,
      title: '¿Listo para empezar a ahorrar?',
      subtitle: 'Descarga la APK ahora y escanea tu primer ticket en segundos. Sin registro, sin anuncios, tus datos nunca salen de tu teléfono.',
      primary_cta: 'Descargar APK',
      secondary_cta: 'Play Store',
    },
    footer: {
      enabled: true,
      brand: 'TicketScan',
      description: 'La app que escanea, categoriza y analiza tus tickets de supermercado automáticamente. Hecha en Argentina 🇦🇷',
      nav: {
        Producto: [
          { label: 'Características', href: '#' },
          { label: 'Descargar', href: '#' },
          { label: 'Changelog', href: '#' },
          { label: 'Roadmap', href: '#' },
        ],
        Legal: [
          { label: 'Privacidad', href: '/privacidad' },
          { label: 'Términos', href: '/terminos' },
          { label: 'Cookies', href: '/cookies' },
        ],
      },
      social: [
        { label: 'Twitter', href: '#', icon: '𝕏' },
        { label: 'GitHub', href: '#', icon: '⌘' },
        { label: 'Email', href: '#', icon: '✉️' },
      ],
      copyright: '© 2025 TicketScan. Hecho con ❤️ en Argentina.',
    },
  };

  return NextResponse.json({ ok: true, config });
}