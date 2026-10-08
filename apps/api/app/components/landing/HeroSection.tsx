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

export function HeroSection({ data }: HeroSectionProps) {
  if (!data) return null;
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.badge} style={{ animationDelay: "100ms" }}>
            {data.badge || "🎫 TicketScan"}
          </span>
          <h1 className={styles.headline} style={{ animationDelay: "200ms" }}>
            <span
              dangerouslySetInnerHTML={{
                __html:
                  data.headline ||
                  "Escanea, categoriza y analiza tus <span class='text-primary'>tickets de supermercado</span>",
              }}
            />
          </h1>
          <p className={styles.subtext} style={{ animationDelay: "300ms" }}>
            {data.subtext ||
              "La app que usa IA para leer tus tickets, organizar tus gastos por categoría y mostrarte gráficos claros de tu presupuesto familiar."}
          </p>
          <div className={styles.ctaGroup} style={{ animationDelay: "400ms" }}>
            <a
              href={data.cta_primary_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaPrimary}
            >
              {data.cta_primary_text || "Descargar APK (MediaFire)"}
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
          <p className={styles.footnote} style={{ animationDelay: "500ms" }}>
            {data.footnote || "Versión beta • Sin anuncios • Datos 100% tuyos"}
          </p>
        </div>
      </div>
      <div className={styles.blobTop} aria-hidden="true" />
      <div className={styles.blobBottom} aria-hidden="true" />
    </section>
  );
}
