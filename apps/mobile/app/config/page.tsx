'use client';
export default function ConfigPage() {
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Configuración</h1>
      <div className="bg-white rounded shadow p-4">
        <label className="block mb-2">Presupuesto mensual</label>
        <input className="w-full rounded border px-3 py-2" type="number" placeholder="500000" />
        <label className="block mb-2 mt-4">Alerta de presupuesto</label>
        <input className="w-full rounded border px-3 py-2" type="number" placeholder="80" />
      </div>
    </main>
  );
}