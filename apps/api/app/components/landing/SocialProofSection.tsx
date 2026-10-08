import styles from './SocialProofSection.module.css';

interface SocialProofSectionProps {
  data?: {
    enabled?: boolean;
    headline?: string;
    subtext?: string;
    testimonials?: Array<{
      name?: string;
      location?: string;
      text?: string;
      rating?: number;
    }>;
    stats?: Array<{
      value?: string | number;
      label?: string;
    }>;
  };
}

function StarRating({ rating = 5 }: { rating?: number }) {
  return [...Array(5)].map((_, i) => (
    <span
      key={i}
      aria-hidden="true"
      className={i < rating ? styles.starFilled : styles.starEmpty}
    >
      ★
    </span>
  ));
}

export function SocialProofSection({ data }: SocialProofSectionProps) {
  if (!data) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2
            className={styles.headline}
            dangerouslySetInnerHTML={{
              __html:
                data.headline || "Confiada por <span class='text-primary'>miles de familias</span> argentinas",
            }}
          />
          <p className={styles.subtext}>
            {data.subtext || "Únete a quienes ya llevan el control de su presupuesto sin esfuerzo."}
          </p>
        </header>

        <div className={styles.testimonialsGrid}>
          {data.testimonials?.map((t, i) => (
            <article
              key={t.name || i}
              className={styles.testimonialCard}
              style={{ animationDelay: `${800 + i * 100}ms` }}
            >
              <div className={styles.starRating} aria-label={`${t.rating || 5} de 5 estrellas`}>
                <StarRating rating={t.rating || 5} />
              </div>
              <p className={styles.testimonialText}>"{t.text || ""}"</p>
              <footer className={styles.testimonialFooter}>
                <span className={styles.testimonialName}>{t.name || "Anónimo"}</span>
                <span>·</span>
                <span className={styles.testimonialLocation}>{t.location || "Ubicación"}</span>
              </footer>
            </article>
          ))}
        </div>

        {data.stats?.length && (
          <div className={styles.statsContainer} style={{ animationDelay: "1100ms" }}>
            <div className={styles.statsRow}>
              {data.stats.map((s, i) => (
                <span key={i} className={styles.statItem}>
                  <span className={styles.statValue}>{s.value || ""}</span>
                  <span className={styles.statLabel}>{s.label || ""}</span>
                  {i < (data.stats?.length || 0) - 1 && <span className={styles.statDivider} />}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
