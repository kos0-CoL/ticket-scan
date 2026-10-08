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

  return (
    <footer className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brandColumn}>
            <div className={styles.brandBadge}>
              {data.brand || "🎫 TicketScan"}
            </div>
            <p className={styles.brandDescription}>
              {data.description || "La app que escanea, categoriza y analiza tus tickets de supermercado automáticamente. Hecha en Argentina 🇦🇷"}
            </p>
            {data.social_links?.length && (
              <div className={styles.socialLinks}>
                {data.social_links.map((s, i) => (
                  <a
                    key={i}
                    href={s.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                    aria-label={s.label || ""}
                  >
                    <span className={styles.socialIcon} aria-hidden="true">{s.icon || "•"}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className={styles.navColumn}>
            <h4 className={styles.navTitle}>Producto</h4>
            <ul className={styles.navList}>
              {data.nav_producto?.map((item, i) => (
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
              {data.nav_legal?.map((item, i) => (
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
          <p className={styles.copyright}>{data.copyright || "© 2025 TicketScan. Hecho con ❤️ en Argentina."}</p>
          <div className={styles.footerBottom}>
            <span className={styles.version}>{data.version || "Versión 1.0.0-beta"}</span>
            <a
              href={data.admin_link || "https://admin-ticket-ar.netlify.app"}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.adminLink}
            >
              Panel de administración
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
