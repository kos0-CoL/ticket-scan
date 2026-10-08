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
      <div className={styles.container}>
        <div className={styles.header}>
          <h2
            className={styles.headline}
            dangerouslySetInnerHTML={{
              __html: data.headline || "¿Listo para empezar a ahorrar?",
            }}
          />
          <p className={styles.subtext} style={{ animationDelay: "150ms" }}>
            {data.subtext || "Descarga la APK ahora y escanea tu primer ticket en segundos. Sin registro, sin anuncios, tus datos nunca salen de tu teléfono."}
          </p>
        </div>
        <div className={styles.ctaGroup} style={{ animationDelay: "300ms" }}>
          <a
            href={data.cta_primary_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaPrimary}
          >
            {data.cta_primary_text || "Descargar APK desde MediaFire"}
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
      </div>
      <div className={styles.blobTop} aria-hidden="true" />
      <div className={styles.blobBottom} aria-hidden="true" />
    </section>
  );
}
