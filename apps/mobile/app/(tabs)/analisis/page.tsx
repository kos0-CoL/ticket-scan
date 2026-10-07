'use client';
export default function AnalisisPage() {
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Análisis</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-medium">Gasto del mes</h2>
        <p className="text-3xl font-bold text-blue-600">$0</p>
      </div>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-medium">Por categoría</h2>
        <p className="text-gray-400">Gráfico de torta (próximamente)</p>
      </div>
      <button className="w-full rounded border py-3 text-sm">📄 Descargar PDF del mes</button>
    </main>
  );
}