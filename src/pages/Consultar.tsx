import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRecordsByPatente, type StellarRecord } from '../services/stellar';

type ModoConsulta = 'conductor' | 'permisionario';

export default function Consultar() {
  const [searchParams] = useSearchParams();
  const patenteUrl = searchParams.get('patente') || '';
  const dniUrl = searchParams.get('dni') || '';
  const [inputPatente, setInputPatente] = useState(patenteUrl);
  const [verificador, setVerificador] = useState(dniUrl);
  const [modo, setModo] = useState<ModoConsulta>('conductor');
  const [result, setResult] = useState<{ activos: StellarRecord[]; historial: StellarRecord[] } | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [ahora, setAhora] = useState(Date.now());

  useEffect(() => {
    if (patenteUrl) setModo('conductor');
  }, []);

  useEffect(() => {
    if (patenteUrl && dniUrl) {
      autoConsultar(patenteUrl, dniUrl);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  function autoConsultar(patente: string, dni: string) {
    const p = patente.toUpperCase().trim();
    setInputPatente(p);
    setVerificador(dni);
    setBusqueda(p);
    const records = getRecordsByPatente(p, dni.trim());
    if (records.length > 0) {
      const activos = records.filter((r) => r.activo);
      setResult({ activos, historial: records });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const p = inputPatente.toUpperCase().trim();
    if (!p || !verificador.trim()) {
      setError('Completá todos los campos');
      return;
    }
    setBusqueda(p);

    const records = modo === 'conductor'
      ? getRecordsByPatente(p, verificador.trim())
      : getRecordsByPatente(p, undefined, verificador.trim());

    if (records.length === 0) {
      setError(modo === 'conductor'
        ? 'No se encontraron registros para esa patente con el DNI ingresado'
        : 'No se encontraron registros para esa patente con ese legajo'
      );
      setResult(null);
      return;
    }

    const activos = records.filter((r) => r.activo);
    setResult({ activos, historial: records });
  }

  function tiempoRestante(hasta: number): string {
    const diff = Math.max(0, hasta - ahora);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
  }

  function formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString('es-AR');
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-cream font-body">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <img src="/logo.jfif" alt="Estacionar Salta" className="h-12 w-12 rounded-xl mx-auto object-cover" />
          <h1 className="mt-2 font-title text-xl font-bold text-bordo-900">Consultar estacionamiento</h1>
          <p className="text-sm text-muted mt-1">Ingresá tu patente y verificá tu identidad</p>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 mb-4 max-w-xs mx-auto">
          <button
            onClick={() => setModo('conductor')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              modo === 'conductor' ? 'bg-white shadow text-bordo-900' : 'text-muted hover:text-dark'
            }`}
          >
            Conductor (DNI)
          </button>
          <button
            onClick={() => setModo('permisionario')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              modo === 'permisionario' ? 'bg-white shadow text-bordo-900' : 'text-muted hover:text-dark'
            }`}
          >
            Permisionario (Legajo)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={inputPatente}
            onChange={(e) => setInputPatente(e.target.value.toUpperCase())}
            placeholder="Patente · Ej: AB123CD"
            className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-bordo-500"
            maxLength={7}
            autoFocus={!patenteUrl}
          />
          <input
            type="text"
            value={verificador}
            onChange={(e) => setVerificador(e.target.value)}
            placeholder={modo === 'conductor' ? 'DNI del conductor · Ej: 12345678' : 'Legajo del permisionario · Ej: 001'}
            maxLength={modo === 'conductor' ? 8 : 5}
            className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-bordo-500"
          />
          <button
            type="submit"
            className="w-full bg-bordo-900 text-white font-semibold py-3 rounded-lg hover:bg-bordo-700 transition-colors"
          >
            Consultar
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200 text-center">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {result && busqueda && (
          <div className="mt-6 space-y-4">
            {result.activos.length > 0 ? (
              result.activos.map((r) => (
                <div key={r.hash} className="bg-white rounded-xl shadow-md border border-green-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-3 h-3 bg-success rounded-full animate-pulse" />
                    <h2 className="font-title font-bold text-lg text-success">Estacionamiento Activo</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted">Patente</span>
                      <p className="font-bold text-lg text-dark">{r.patente}</p>
                    </div>
                    <div>
                      <span className="text-muted">Dirección</span>
                      <p className="font-bold text-dark">{r.direccion}</p>
                    </div>
                    <div>
                      <span className="text-muted">Desde</span>
                      <p className="font-semibold text-dark">{formatTime(r.desde)}</p>
                    </div>
                    <div>
                      <span className="text-muted">Hasta</span>
                      <p className="font-semibold text-dark">{formatTime(r.hasta)}</p>
                    </div>
                    <div>
                      <span className="text-muted">Tiempo pagado</span>
                      <p className="font-semibold text-dark">{Math.floor(r.duracionMinutos / 60)}h {r.duracionMinutos % 60}min</p>
                    </div>
                    <div>
                      <span className="text-muted">Monto</span>
                      <p className="font-semibold text-dark">${r.monto.toLocaleString('es-AR')}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-gray-50 rounded-xl text-center">
                    <span className="text-sm text-muted">Tiempo restante</span>
                    <p className="font-title text-3xl font-extrabold text-bordo-900 mt-1 tracking-wider">
                      {tiempoRestante(r.hasta)}
                    </p>
                  </div>
                </div>
              ))
            ) : result.historial.length > 0 ? (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
                <h2 className="font-title font-bold text-lg text-dark">Sin estacionamiento activo</h2>
                <p className="text-sm text-muted mt-1">
                  No tenés estacionamiento vigente en este momento.
                </p>
              </div>
            ) : null}

            {result.historial.length > 0 && (
              <div className="bg-white rounded-xl shadow-md border border-bordo-100 p-6">
                <h3 className="font-title font-bold text-bordo-900 mb-3">
                  {modo === 'conductor' ? 'Tu historial de estacionamientos' : 'Estacionamientos de esta patente'}
                </h3>
                <div className="space-y-2">
                  {result.historial.map((r) => (
                    <div key={r.hash} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0">
                      <div>
                        <span className="font-medium text-dark">{formatDate(r.desde)}</span>
                        <span className="text-muted ml-2">{formatTime(r.desde)} - {formatTime(r.hasta)}</span>
                        <span className="text-muted ml-2">· {r.direccion}</span>
                        {modo === 'permisionario' && (
                          <span className="text-muted ml-2">· DNI: {r.dni}</span>
                        )}
                      </div>
                      <span className="flex items-center gap-2">
                        <span className="text-muted">${r.monto.toLocaleString('es-AR')}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          r.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {r.activo ? 'Activo' : 'Expirado'}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-center text-muted">
              Los datos se actualizan en tiempo real · Registro inmutable en Stellar
            </p>
          </div>
        )}

        {!result && !patenteUrl && !error && (
          <div className="mt-8 text-center text-muted text-sm">
            <p>Ingresá tu patente y verificá tu identidad para consultar el estado del estacionamiento.</p>
            <div className="mt-4 flex justify-center">
              <img src="/logo.jfif" alt="" className="h-20 w-20 rounded-2xl opacity-30 object-cover" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
