interface FooterSectionProps {
  data?: {
    enabled?: boolean;
    brand?: string;
    description?: string;
    social_links?: Array<{
      label?: string;
      url?: string;
      icon?: string;
    }>;
    nav_producto?: Array<{
      label?: string;
      url?: string;
    }>;
    nav_legal?: Array<{
      label?: string;
      url?: string;
    }>;
    copyright?: string;
    version?: string;
    admin_link?: string;
  };
}

export function FooterSection({ data }: FooterSectionProps) {
  if (!data) return null;

  return (
    <footer className="bg-slate-950 text-slate-300 py-[48px] lg:py-[72px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              {data.brand || "🎫 TicketScan"}
            </div>
            <p className="max-w-xs text-slate-400">
              {data.description || "La app que escanea, categoriza y analiza tus tickets de supermercado automáticamente. Hecha en Argentina 🇦🇷"}
            </p>
            {data.social_links?.length && (
              <div className="flex gap-4 mt-5">
                {data.social_links.map((s, i) => (
                  <a
                    key={i}
                    href={s.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 transition-colors hover:text-white"
                    aria-label={s.label || ""}
                    style={{ textDecoration: "none" }}
                  >
                    <span className="text-lg" aria-hidden="true">{s.icon || "•"}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Producto</h4>
            <ul className="space-y-2 text-sm">
              {data.nav_producto?.map((item, i) => (
                <li key={i}>
                  <a
                    href={item.url || "#"}
                    className="transition-colors hover:text-primary"
                    style={{ textDecoration: "none" }}
                  >
                    {item.label || ""}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              {data.nav_legal?.map((item, i) => (
                <li key={i}>
                  <a
                    href={item.url || "#"}
                    className="transition-colors hover:text-primary"
                    style={{ textDecoration: "none" }}
                  >
                    {item.label || ""}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>{data.copyright || "© 2025 TicketScan. Hecho con ❤️ en Argentina."}</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">{data.version || "Versión 1.0.0-beta"}</span>
            <a
              href={data.admin_link || "https://admin-ticket-ar.netlify.app"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              style={{ textDecoration: "none" }}
            >
              Panel de administración
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
