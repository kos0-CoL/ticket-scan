import styles from './FooterSection.module.css';

interface FooterSectionProps {
  data?: {
    enabled?: boolean;
    brand?: string;
    description?: string;
    social_links?: Array<{
      label?: string;
      url?: string;
      icon?: string;
    }>;
    nav_producto?: Array<{
      label?: string;
      url?: string;
    }>;
    nav_legal?: Array<{
      label?: string;
      url?: string;
    }>;
    copyright?: string;
    version?: string;
    admin_link?: string;
  };
}

export function FooterSection({ data }: FooterSectionProps) {
  if (!data) return null;

  const socialLinks = data.social_links?.length
    ? data.social_links
    : [
        { label: 'Twitter', url: 'https://twitter.com/ticketscan', icon: '✦' },
        { label: 'GitHub', url: 'https://github.com/ticketscan', icon: '⌘' },
        { label: 'Email', url: 'mailto:hola@ticketscan.ar', icon: '✉' },
      ];

  const navProducto = data.nav_producto?.length
    ? data.nav_producto
    : [
        { label: 'Características', url: '#features' },
        { label: 'Descargar', url: '#download' },
        { label: 'Precios', url: '#pricing' },
        { label: 'Changelog', url: '#changelog' },
      ];

  const navLegal = data.nav_legal?.length
    ? data.nav_legal
    : [
        { label: 'Privacidad', url: '/privacidad' },
        { label: 'Términos', url: '/terminos' },
        { label: 'Cookies', url: '/cookies' },
      ];

  return (
    <footer className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brandColumn}>
            <div className={styles.brandBadge}>
              <span className={styles.brandBadgeIcon} aria-hidden="true">🎫</span>
              {data.brand || "TicketScan"}
            </div>
            <p className={styles.brandDescription}>
              {data.description || "La app que escanea, categoriza y analiza tus tickets de supermercado automáticamente. Hecha en Argentina 🇦🇷"}
            </p>
            <div className={styles.socialLinks} role="list" aria-label="Redes sociales">
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={s.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label={s.label || ""}
                  role="listitem"
                >
                  <span className={styles.socialIcon} aria-hidden="true">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>

          <div className={styles.navColumn}>
            <h4 className={styles.navTitle}>Producto</h4>
            <ul className={styles.navList}>
              {navProducto.map((item, i) => (
                <li key={i}>
                  <a
                    href={item.url || "#"}
                    className={styles.navItem}
                  >
                    {item.label || ""}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav className={styles.navColumn}>
            <h4 className={styles.navTitle}>Legal</h4>
            <ul className={styles.navList}>
              {navLegal.map((item, i) => (
                <li key={i}>
                  <a
                    href={item.url || "#"}
                    className={styles.navItem}
                  >
                    {item.label || ""}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className={styles.divider}>
          <p className={styles.copyright}>
            {data.copyright || "© 2025 TicketScan. Hecho con ❤️ en Argentina."}
          </p>
          <div className={styles.footerBottom}>
            <span className={styles.version}>
              <span className={styles.versionDot} aria-hidden="true" />
              {data.version || "Versión 1.0.0-beta"}
            </span>
            <a
              href={data.admin_link || "https://admin-ticket-ar.netlify.app"}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.adminLink}
            >
              <svg className={styles.adminLinkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Panel de administración
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
