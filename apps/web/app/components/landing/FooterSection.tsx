interface FooterData {
  brand?: string;
  description?: string;
  nav?: Record<string, Array<{ label: string; href: string }>>;
  social?: Array<{ label: string; href: string; icon: string }>;
  copyright?: string;
}

export function FooterSection({ data }: { data: FooterData }) {
  const brand = data.brand || '🎫 TicketScan';
  const description = data.description || 'La app que escanea, categoriza y analiza tus tickets de supermercado automáticamente. Hecha en Argentina 🇦🇷';
  const nav = data.nav || {
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
  };
  const social = data.social || [
    { label: 'Twitter', href: '#', icon: '𝕏' },
    { label: 'GitHub', href: '#', icon: '⌘' },
    { label: 'Email', href: '#', icon: '✉️' },
  ];
  const copyright = data.copyright || '© 2025 TicketScan. Hecho con ❤️ en Argentina.';

  return (
    <footer className="bg-slate-900 text-slate-300 py-16" role="contentinfo">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl" aria-hidden="true">🎫</span>
              <span className="text-2xl font-bold text-white">TicketScan</span>
            </div>
            <p className="text-slate-400 max-w-md mb-6">{description}</p>
            <div className="flex gap-4" role="list" aria-label="Redes sociales">
              {social.map((social, index) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-primary transition-colors"
                  aria-label={social.label}
                  role="listitem"
                >
                  <span className="text-xl" aria-hidden="true">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Product navigation */}
          <nav aria-label="Producto" className="lg:col-span-1">
            <h3 className="font-semibold text-white mb-4">Producto</h3>
            <ul className="space-y-3" role="list">
              {nav.Producto.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-slate-400 hover:text-primary transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal navigation */}
          <nav aria-label="Legal" className="lg:col-span-1">
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3" role="list">
              {nav.Legal.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-slate-400 hover:text-primary transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">{copyright}</p>
            <div className="flex items-center gap-4">
              <a
                href="https://admin.ticket-ar.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                <span>Panel de administración</span>
              </a>
              <span className="text-slate-600">Versión 1.0.0-beta</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}