import { useEffect, useState } from 'react';
import { getStellarHistory, getStellarStatsByPermisionario, type StellarRecord } from '../services/stellar';
import { getAllPermisionarios, getPermisionarioByLegajo, type Permisionario } from '../services/auth';

type Periodo = 'dia' | 'mes';

export default function Dashboard() {
  const [records, setRecords] = useState<StellarRecord[]>([]);
  const [periodo, setPeriodo] = useState<Periodo>('dia');
  const [searchLegajo, setSearchLegajo] = useState('');
  const [selectedPermisionario, setSelectedPermisionario] = useState<Permisionario | null>(null);
  const [permStats, setPermStats] = useState<{ total: number; recaudacion: number; digitales: number; efectivos: number; records: StellarRecord[] } | null>(null);

  useEffect(() => {
    setRecords(getStellarHistory());
    const interval = setInterval(() => {
      setRecords(getStellarHistory());
      if (selectedPermisionario) {
        setPermStats(getStellarStatsByPermisionario(selectedPermisionario.legajo));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedPermisionario]);

  function filteredRecords(): StellarRecord[] {
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    let filtrados = records;
    if (periodo === 'dia') filtrados = filtrados.filter((r) => r.timestamp >= inicioDia.getTime());
    else filtrados = filtrados.filter((r) => r.timestamp >= inicioMes.getTime());

    if (selectedPermisionario) {
      filtrados = filtrados.filter((r) => r.permisionario === selectedPermisionario.legajo);
    }

    return filtrados;
  }

  function handleSearch() {
    if (!searchLegajo.trim()) return;
    const p = getPermisionarioByLegajo(searchLegajo.trim());
    if (p) {
      setSelectedPermisionario(p);
      setPermStats(getStellarStatsByPermisionario(p.legajo));
    }
  }

  function clearFilter() {
    setSelectedPermisionario(null);
    setPermStats(null);
    setSearchLegajo('');
  }

  const filtrados = filteredRecords();
  const pctDigital = filtrados.length > 0 ? Math.round((filtrados.filter(r => r.medio === 'digital').length / filtrados.length) * 100) : 0;
  const recaudacionFiltrada = filtrados.reduce((s, r) => s + r.monto, 0);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 font-body">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-title text-2xl font-bold text-bordo-900">Dashboard Municipal</h1>
            <p className="text-sm text-muted mt-1">Control y trazabilidad en tiempo real</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Actualizado</p>
            <p className="text-sm font-medium text-dark">{new Date().toLocaleString('es-AR')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-muted font-medium">Recaudación {periodo === 'dia' ? 'del día' : 'del mes'}</p>
            <p className="mt-1 font-title text-3xl font-extrabold text-bordo-900">
              ${recaudacionFiltrada.toLocaleString('es-AR')}
            </p>
            <p className="mt-1 text-xs text-muted">{filtrados.length} tickets emitidos</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-muted font-medium">% Digital vs Efectivo</p>
            <div className="mt-2 flex items-end gap-3">
              <p className="font-title text-3xl font-extrabold text-bordo-900">{pctDigital}%</p>
              <p className="text-sm text-muted mb-1">digital</p>
            </div>
            <div className="mt-2 w-full bg-gray-100 rounded-full h-2.5">
              <div className="bg-bordo-700 h-2.5 rounded-full" style={{ width: `${pctDigital}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-xs text-muted">
              <span>Efectivo: {filtrados.filter(r => r.medio === 'efectivo').length}</span>
              <span>Digital: {filtrados.filter(r => r.medio === 'digital').length}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-muted font-medium">Registros en Stellar</p>
            <p className="mt-1 font-title text-3xl font-extrabold text-bordo-900">{filtrados.length}</p>
            <p className="mt-1 text-xs text-muted">transacciones inmutables</p>
            <p className="mt-0.5 text-xs text-success">Red: Stellar Testnet</p>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="font-title font-bold text-lg text-bordo-900">Filtros</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setPeriodo('dia')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${periodo === 'dia' ? 'bg-white shadow text-bordo-900' : 'text-muted'}`}
                >
                  Hoy
                </button>
                <button
                  onClick={() => setPeriodo('mes')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${periodo === 'mes' ? 'bg-white shadow text-bordo-900' : 'text-muted'}`}
                >
                  Este mes
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchLegajo}
                  onChange={(e) => setSearchLegajo(e.target.value)}
                  placeholder="Buscar permisionario (legajo)..."
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-bordo-500"
                />
                <button
                  onClick={handleSearch}
                  className="bg-bordo-900 text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-bordo-700 transition-colors"
                >
                  Buscar
                </button>
              </div>

              {selectedPermisionario && (
                <button
                  onClick={clearFilter}
                  className="text-xs text-muted hover:text-bordo-700 underline"
                >
                  Limpiar filtro: {selectedPermisionario.nombre}
                </button>
              )}
            </div>
          </div>

          {selectedPermisionario && permStats && (
            <div className="mb-4 p-3 bg-bordo-100 rounded-lg">
              <p className="font-semibold text-bordo-900">
                {selectedPermisionario.nombre} · Legajo {selectedPermisionario.legajo} · {selectedPermisionario.zona}
              </p>
              <div className="flex gap-6 mt-1 text-sm text-dark/70">
                <span>Tickets: {permStats.total}</span>
                <span>Recaudación: ${permStats.recaudacion.toLocaleString('es-AR')}</span>
                <span>Digital: {permStats.digitales} | Efectivo: {permStats.efectivos}</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-title font-bold text-lg text-bordo-900">Transacciones recientes</h2>
            <span className="text-xs text-muted">Hash Stellar simulados</span>
          </div>

          {filtrados.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <p className="text-lg">Aún no hay transacciones registradas</p>
              <p className="text-sm mt-1">Genere un ticket desde el módulo Permisionario para ver los registros aquí</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 font-semibold text-dark/60 whitespace-nowrap">Ticket</th>
                    <th className="pb-3 font-semibold text-dark/60 whitespace-nowrap">Patente</th>
                    <th className="pb-3 font-semibold text-dark/60 whitespace-nowrap">Monto</th>
                    <th className="pb-3 font-semibold text-dark/60 whitespace-nowrap">Medio</th>
                    <th className="pb-3 font-semibold text-dark/60 whitespace-nowrap">Permisionario</th>
                    <th className="pb-3 font-semibold text-dark/60 whitespace-nowrap">Bloque</th>
                    <th className="pb-3 font-semibold text-dark/60 whitespace-nowrap">Hash Stellar</th>
                    <th className="pb-3 font-semibold text-dark/60 whitespace-nowrap">Desde</th>
                    <th className="pb-3 font-semibold text-dark/60 whitespace-nowrap">Hasta</th>
                    <th className="pb-3 font-semibold text-dark/60 whitespace-nowrap">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.slice(0, 50).map((rec) => (
                    <tr key={rec.hash} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 font-mono text-xs text-dark whitespace-nowrap">{rec.ticketId}</td>
                      <td className="py-3 font-bold text-dark whitespace-nowrap">{rec.patente}</td>
                      <td className="py-3 whitespace-nowrap">${rec.monto.toLocaleString('es-AR')}</td>
                      <td className="py-3 whitespace-nowrap">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          rec.medio === 'digital' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rec.medio === 'digital' ? 'Digital' : 'Efectivo'}
                        </span>
                      </td>
                      <td className="py-3 text-xs text-muted whitespace-nowrap">{rec.permisionarioNombre}</td>
                      <td className="py-3 font-mono text-xs text-muted whitespace-nowrap">{rec.bloque}</td>
                      <td className="py-3 whitespace-nowrap">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-muted">
                          {rec.hash.substring(0, 16)}...
                        </code>
                      </td>
                      <td className="py-3 text-xs text-muted whitespace-nowrap">
                        {new Date(rec.desde).toLocaleTimeString('es-AR')}
                      </td>
                      <td className="py-3 text-xs text-muted whitespace-nowrap">
                        {new Date(rec.hasta).toLocaleTimeString('es-AR')}
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          rec.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {rec.activo ? 'Activo' : 'Expirado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-title font-bold text-bordo-900 mb-4">Ranking de Permisionarios</h3>
          {(() => {
            const todos = getAllPermisionarios().map((p) => {
              const s = getStellarStatsByPermisionario(p.legajo);
              return { ...p, ...s };
            }).sort((a, b) => b.recaudacion - a.recaudacion);

            return (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="pb-3 font-semibold text-dark/60">#</th>
                      <th className="pb-3 font-semibold text-dark/60">Permisionario</th>
                      <th className="pb-3 font-semibold text-dark/60">Zona</th>
                      <th className="pb-3 font-semibold text-dark/60">Tickets</th>
                      <th className="pb-3 font-semibold text-dark/60">Recaudación</th>
                      <th className="pb-3 font-semibold text-dark/60">Digital</th>
                      <th className="pb-3 font-semibold text-dark/60">Efectivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todos.map((p, i) => (
                      <tr
                        key={p.legajo}
                        className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          selectedPermisionario?.legajo === p.legajo ? 'bg-bordo-100' : ''
                        }`}
                        onClick={() => {
                          setSelectedPermisionario(p);
                          setSearchLegajo(p.legajo);
                          setPermStats(getStellarStatsByPermisionario(p.legajo));
                        }}
                      >
                        <td className="py-3 font-bold text-muted">{i + 1}</td>
                        <td className="py-3 font-medium text-dark">{p.nombre}</td>
                        <td className="py-3 text-xs text-muted">{p.zona}</td>
                        <td className="py-3">{p.total}</td>
                        <td className="py-3 font-semibold">${p.recaudacion.toLocaleString('es-AR')}</td>
                        <td className="py-3">{p.digitales}</td>
                        <td className="py-3">{p.efectivos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>

        <div className="mt-6 p-4 bg-white rounded-xl border border-bordo-100">
          <h3 className="font-title font-bold text-bordo-900">¿Por qué Stellar?</h3>
          <p className="mt-2 text-sm text-dark/70 leading-relaxed">
            Cada transacción genera un hash verificable en la blockchain de Stellar con ID, monto, timestamp y
            permisionario. Esto garantiza que ningún registro pueda ser alterado después de generarse —ni por el
            permisionario, ni por el operador del sistema, ni por la Municipalidad. La transparencia es inmutable.
          </p>
          <p className="mt-2 text-xs text-muted">
            Costo operativo mínimo · Finalidad en segundos · Red Stellar Testnet
          </p>
        </div>
      </div>
    </div>
  );
}
