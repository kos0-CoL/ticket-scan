import styles from './FeaturesSection.module.css';

interface FeaturesSectionProps {
  data?: {
    enabled?: boolean;
    headline?: string;
    subtext?: string;
    items?: Array<{
      icon?: string;
      title?: string;
      desc?: string;
    }>;
  };
}

export function FeaturesSection({ data }: FeaturesSectionProps) {
  if (!data || !data.items?.length) return null;

  const features = data.items.map((feature, i) => ({
    ...feature,
    icon: feature.icon || ['📷', '🏷️', '📊', '📄'][i] || '⚡',
  }));

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.headline}>
            {data.headline || "Todo lo que necesitas para "}
            <span className={styles.headlineHighlight}>controlar tus compras</span>
          </h2>
          <p className={styles.subtext}>
            {data.subtext || "Diseñada para el contexto argentino: supermercados locales, moneda ARS, facturación AFIP."}
          </p>
        </header>
        <div className={styles.grid}>
          {features.map((feature, i) => (
            <article
              key={feature.title || i}
              className={styles.card}
            >
              <div className={styles.iconWrapper} aria-hidden="true">
                <span className={styles.icon}>{feature.icon}</span>
              </div>
              <h3 className={styles.title}>{feature.title || "Sin título"}</h3>
              <p className={styles.description}>{feature.desc || "Descripción no disponible."}</p>
              <a href="#" className={styles.featureLink}>
                Ver más
                <svg className={styles.featureLinkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
