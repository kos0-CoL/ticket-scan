import styles from './Hero.module.css';

interface HeroSectionProps {
  data?: {
    enabled?: boolean;
    badge?: string;
    headline?: string;
    subtext?: string;
    cta_primary_text?: string;
    cta_primary_url?: string;
    cta_secondary_text?: string;
    cta_secondary_url?: string;
    cta_secondary_disabled?: boolean;
    footnote?: string;
  };
}

function parseHeadline(html: string) {
  // Split by <span class='highlight'> and </span>
  const parts = html.split(/<span class='highlight'>|<\/span>/);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <span key={i} className={styles.headlineHighlight}>{part}</span>
      : <span key={i}>{part}</span>
  );
}

export function HeroSection({ data }: HeroSectionProps) {
  if (!data) return null;

  const headline = data.headline || "Escanea, categoriza y analiza tus <span class='highlight'>tickets de supermercado</span>";

  return (
    <section className={styles.section}>
      <div className={styles.blobTop} aria-hidden="true" />
      <div className={styles.blobBottom} aria-hidden="true" />
      <div className={styles.floatElement} aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3, color: 'var(--color-primary)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className={styles.floatElement} aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.25, color: 'var(--color-primary)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12a2 2 0 100-4h14a2 2 0 110 4M5 12a2 2 0 100-4h14a2 2 0 100-4zm0 0v12" />
        </svg>
      </div>
      <div className={styles.floatElement} aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.2, color: 'var(--color-primary)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </div>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.badge}>
            <span className={styles.badgeIcon} aria-hidden="true" style={{ fontSize: '1.5rem' }}>🎫</span>
            {data.badge || "TicketScan"}
          </span>
          <h1 className={styles.headline}>
            {parseHeadline(headline)}
          </h1>
          <p className={styles.subtext}>
            {data.subtext ||
              "La app que usa IA para leer tus tickets, organizar tus gastos por categoría y mostrarte gráficos claros de tu presupuesto familiar."}
          </p>
          <div className={styles.ctaGroup}>
            <a
              href={data.cta_primary_url || "https://mediafire.com"}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaPrimary}
            >
              <svg className={styles.ctaPrimaryIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {data.cta_primary_text || "Descargar APK"}
            </a>
            {!data.cta_secondary_disabled && (
              <a
                href={data.cta_secondary_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaSecondary}
              >
                {data.cta_secondary_text || "Próximamente en Play Store"}
              </a>
            )}
            {data.cta_secondary_disabled && (
              <button
                disabled
                className={styles.ctaSecondaryDisabled}
              >
                {data.cta_secondary_text || "Próximamente en Play Store"}
              </button>
            )}
          </div>
          <p className={styles.footnote}>
            <span className={styles.footnoteItem}>
              <span className={styles.footnoteDot} aria-hidden="true" />
              Versión beta
            </span>
            <span className={styles.footnoteItem}>
              <span className={styles.footnoteDot} aria-hidden="true" />
              Sin anuncios
            </span>
            <span className={styles.footnoteItem}>
              <span className={styles.footnoteDot} aria-hidden="true" />
              Datos 100% tuyos
            </span>
          </p>
          <div className={styles.trustBar} role="img" aria-label="Indicadores de confianza">
            <div className={styles.trustItem}>
              <svg className={styles.trustIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              99% precisión OCR
            </div>
            <div className={styles.trustItem}>
              <svg className={styles.trustIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12a2 2 0 100-4h14a2 2 0 110 4M5 12a2 2 0 100-4h14a2 2 0 100-4zm0 0v12" /></svg>
              Seguro y privado
            </div>
            <div className={styles.trustItem}>
              <svg className={styles.trustIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Hecho en Argentina 🇦🇷
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}