'use client';

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  link?: string;
}

interface FeaturesData {
  items?: FeatureItem[];
}

export function FeaturesSection({ data }: { data: FeaturesData }) {
  const features = data.items || [
    {
      icon: '📷',
      title: 'Escaneo OCR Inteligente',
      description: 'Apunta la cámara a tu ticket y extraemos automáticamente productos, precios y totales con IA avanzada.',
      link: '#',
    },
    {
      icon: '🏷️',
      title: 'Categorización Automática',
      description: 'Cada producto se clasifica en categorías (alimentos, limpieza, bebidas, etc.) para que veas en qué gastas.',
      link: '#',
    },
    {
      icon: '📊',
      title: 'Gráficos de Gasto',
      description: 'Visualiza tu evolución mensual, compara supermercados y detecta donde ahorrar con charts interactivos.',
      link: '#',
    },
    {
      icon: '📄',
      title: 'Exportar a PDF/Excel',
      description: 'Descarga tus tickets procesados en PDF o Excel para llevar el control contable o compartir con tu contador.',
      link: '#',
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-white" aria-labelledby="features-heading">
      <div className="max-w-6xl mx-auto px-4">
        <header className="text-center mb-16">
          <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Todo lo que necesitas para <span className="text-primary">controlar tus compras</span>
            <span className="block text-primary mt-1">controlar tus compras</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Diseñada para el contexto argentino: supermercados locales, moneda ARS, facturación AFIP.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="group relative bg-white rounded-2xl border border-slate-100 p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="text-2xl" aria-hidden="true">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">{feature.description}</p>
              {feature.link && (
                <a
                  href={feature.link}
                  className="inline-flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all"
                >
                  Ver más
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}