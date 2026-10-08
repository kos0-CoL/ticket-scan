const links: Array<{ href: string; label: string; desc: string }> = [
  { href: '/api/health', label: '/api/health', desc: 'Estado del servidor, variables y conexión a la base' },
  { href: '/api/auth/session', label: '/api/auth/session', desc: 'Sesión actual (user o null)' },
  { href: '/api/tickets', label: '/api/tickets', desc: 'Tickets (requiere ?userId=)' },
];

export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: 32, marginTop: 0 }}>TicketScan API</h1>
      <p style={{ color: '#555' }}>Servidor de tickets de supermercado — Argentina.</p>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
        {links.map((l) => (
          <li key={l.href} style={{ border: '1px solid #e5e5e5', borderRadius: 8, padding: 12 }}>
            <a href={l.href} style={{ fontFamily: 'monospace', fontWeight: 600 }}>{l.label}</a>
            <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>{l.desc}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
