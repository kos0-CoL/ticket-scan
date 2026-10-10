'use client';

interface Testimonial {
  text: string;
  author: string;
  location: string;
  rating: number;
}

interface SocialProofData {
  testimonials?: Testimonial[];
}

export function SocialProofSection({ data }: { data: SocialProofData }) {
  const testimonials = data.testimonials || [
    {
      text: 'Ahorro 2 horas por semana cargando gastos. El OCR es increíblemente preciso.',
      author: 'María G.',
      location: 'Buenos Aires',
      rating: 5,
    },
    {
      text: 'Por fin sé exactamente en qué se me va el sueldo. Los gráficos son muy útiles.',
      author: 'Carlos R.',
      location: 'Córdoba',
      rating: 5,
    },
    {
      text: 'La exportación a Excel me salvó para la declaración de ganancias. 10/10.',
      author: 'Lucía M.',
      location: 'Rosario',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-slate-50" aria-labelledby="social-proof-heading">
      <div className="max-w-6xl mx-auto px-4">
        <header className="text-center mb-16">
          <h2 id="social-proof-heading" className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Confiada por <span className="text-primary">miles de familias</span> argentinas
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Únete a quienes ya llevan el control de su presupuesto sin esfuerzo.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <article
              key={testimonial.author}
              className="bg-white rounded-2xl border border-slate-100 p-8 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex gap-1 mb-4" aria-label={`${testimonial.rating} de 5 estrellas`}>
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                  </svg>
                ))}
              </div>
              <p className="text-slate-700 mb-6 italic leading-relaxed">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <footer className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-semibold">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block">{testimonial.author}</span>
                  <span className="text-sm text-slate-500 block">{testimonial.location}</span>
                </div>
              </footer>
            </article>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <span className="text-4xl md:text-5xl font-bold text-primary">10K+</span>
            <p className="text-slate-600 mt-1">Descargas en beta</p>
          </div>
          <div className="text-center border-x border-slate-200">
            <span className="text-4xl md:text-5xl font-bold text-primary">4.8★</span>
            <p className="text-slate-600 mt-1">Rating promedio</p>
          </div>
          <div className="text-center">
            <span className="text-4xl md:text-5xl font-bold text-primary">99%</span>
            <p className="text-slate-600 mt-1">Precisión OCR</p>
          </div>
        </div>
      </div>
    </section>
  );
}