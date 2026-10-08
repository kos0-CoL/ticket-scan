export default function NotFound() {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: 28 }}>404 — Página no encontrada</h1>
      <p style={{ color: '#555' }}>La ruta solicitada no existe en la API de TicketScan.</p>
      <a href="/">← Volver al inicio</a>
    </main>
  );
}
