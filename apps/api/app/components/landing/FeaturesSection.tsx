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
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2
            className={styles.headline}
            dangerouslySetInnerHTML={{
              __html: data.headline || "Todo lo que necesitas para <span class='text-primary'>controlar tus compras</span>",
            }}
          />
          <p className={styles.subtext}>
            {data.subtext || "Diseñada para el contexto argentino: supermercados locales, moneda ARS, facturación AFIP."}
          </p>
        </header>
        <div className={styles.grid}>
          {data.items.map((feature, i) => (
            <article
              key={feature.title || i}
              className={styles.card}
              style={{ animationDelay: `${600 + i * 100}ms` }}
            >
              <div className={styles.icon} aria-hidden="true">
                {feature.icon || "⚡"}
              </div>
              <h3 className={styles.title}>
                {feature.title || "Sin título"}
              </h3>
              <p className={styles.description}>
                {feature.desc || "Descripción no disponible."}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
