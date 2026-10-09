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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function SocialProofSection({ data }: SocialProofSectionProps) {
  if (!data) return null;

  const testimonials = data.testimonials?.length
    ? data.testimonials
    : [
        { name: 'María G.', location: 'Buenos Aires', text: 'Ahorro 2 horas por semana cargando gastos. El OCR es increíblemente preciso.', rating: 5 },
        { name: 'Carlos R.', location: 'Córdoba', text: 'Por fin sé exactamente en qué se me va el sueldo. Los gráficos son muy útiles.', rating: 5 },
        { name: 'Lucía M.', location: 'Rosario', text: 'La exportación a Excel me salvó para la declaración de ganancias. 10/10.', rating: 5 },
      ];

  const stats = data.stats?.length
    ? data.stats
    : [
        { value: '10K+', label: 'Descargas en beta' },
        { value: '4.8★', label: 'Rating promedio' },
        { value: '99%', label: 'Precisión OCR' },
      ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.headline}>
            Confiada por <span className={styles.headlineHighlight}>miles de familias</span> argentinas
          </h2>
          <p className={styles.subtext}>
            {data.subtext || "Únete a quienes ya llevan el control de su presupuesto sin esfuerzo."}
          </p>
        </header>

        <div className={styles.testimonialsGrid}>
          {testimonials.map((t, i) => (
            <article
              key={t.name || i}
              className={styles.testimonialCard}
            >
              <div className={styles.starRating} aria-label={`${t.rating || 5} de 5 estrellas`}>
                {[...Array(5)].map((_, idx) => (
                  <svg
                    key={idx}
                    className={`${styles.star} ${idx < (t.rating || 5) ? styles.starFilled : styles.starEmpty}`}
                    viewBox="0 0 24 24"
                    fill={idx < (t.rating || 5) ? 'currentColor' : 'none'}
                    stroke={idx < (t.rating || 5) ? 'none' : 'currentColor'}
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className={styles.testimonialText}>
                "{t.text || ''}"
              </p>
              <footer className={styles.testimonialFooter}>
                <div className={styles.testimonialAvatar} aria-hidden="true">
                  {getInitials(t.name || 'Anónimo')}
                </div>
                <div className={styles.testimonialInfo}>
                  <span className={styles.testimonialName}>{t.name || 'Anónimo'}</span>
                  <span className={styles.testimonialLocation}>{t.location || 'Ubicación'}</span>
                </div>
              </footer>
            </article>
          ))}
        </div>

        {stats.length > 0 && (
          <div className={styles.statsContainer}>
            <div className={styles.statsRow}>
              {stats.map((s, i) => (
                <div key={i} className={styles.statItem}>
                  <span className={styles.statValue}>{s.value || ''}</span>
                  <span className={styles.statLabel}>{s.label || ''}</span>
                  {i < stats.length - 1 && <span className={styles.statDivider} />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
