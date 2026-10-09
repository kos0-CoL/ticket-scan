import styles from './CTADownloadSection.module.css';

interface CTADownloadSectionProps {
  data?: {
    enabled?: boolean;
    headline?: string;
    subtext?: string;
    cta_primary_text?: string;
    cta_primary_url?: string;
    cta_secondary_text?: string;
    cta_secondary_url?: string;
    cta_secondary_disabled?: boolean;
  };
}

export function CTADownloadSection({ data }: CTADownloadSectionProps) {
  if (!data) return null;

  return (
    <section className={styles.section}>
      <div className={styles.orb} aria-hidden="true" />
      <div className={styles.orb1} aria-hidden="true" />
      <div className={styles.orb2} aria-hidden="true" />
      <div className={styles.orb3} aria-hidden="true" />
      <div className={styles.blobTop} aria-hidden="true" />
      <div className={styles.blobBottom} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.headline}>
            ¿Listo para empezar a <span className={styles.headlineHighlight}>ahorrar?</span>
          </h2>
          <p className={styles.subtext}>
            {data.subtext || "Descarga la APK ahora y escanea tu primer ticket en segundos. Sin registro, sin anuncios, tus datos nunca salen de tu teléfono."}
          </p>
        </div>
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
              {data.cta_secondary_text || "Play Store (Próximamente)"}
            </a>
          )}
          {data.cta_secondary_disabled && (
            <button
              disabled
              className={styles.ctaSecondaryDisabled}
            >
              {data.cta_secondary_text || "Play Store (Próximamente)"}
            </button>
          )}
        </div>
        <div className={styles.featuresHighlight} role="list" aria-label="Características de la app">
          <div className={styles.featureHighlightItem} role="listitem">
            <span className={styles.featureHighlightIcon} aria-hidden="true">📱</span>
            Funciona offline
          </div>
          <div className={styles.featureHighlightItem} role="listitem">
            <span className={styles.featureHighlightIcon} aria-hidden="true">🔒</span>
            Datos en tu teléfono
          </div>
          <div className={styles.featureHighlightItem} role="listitem">
            <span className={styles.featureHighlightIcon} aria-hidden="true">⚡</span>
            Escaneo instantáneo
          </div>
          <div className={styles.featureHighlightItem} role="listitem">
            <span className={styles.featureHighlightIcon} aria-hidden="true">📊</span>
            Gráficos automáticos
          </div>
        </div>
        <div className={styles.phonePreview} aria-hidden="true">
          <div className={styles.phonePreviewFrame}>
            <div className={styles.phonePreviewScreen}>
              <div className={styles.phonePreviewContent}>
                <div className={styles.previewCard}>
                  <div className={styles.previewCardHeader}>
                    <span className={styles.previewCardTitle}>Último ticket</span>
                  </div>
                  <div className={styles.previewCardAmount}>$47.890</div>
                  <div className={styles.previewCardMeta}>
                    <span>🏪 Coto</span>
                    <span>·</span>
                    <span>Hace 2h</span>
                  </div>
                </div>
                <div className={styles.previewCard}>
                  <div className={styles.previewCardHeader}>
                    <span className={styles.previewCardTitle}>Este mes</span>
                  </div>
                  <div className={styles.previewCardAmount}>$182.450</div>
                  <div className={styles.previewCardMeta}>
                    <span>📈 +12%</span>
                    <span>·</span>
                    <span>vs mes anterior</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
