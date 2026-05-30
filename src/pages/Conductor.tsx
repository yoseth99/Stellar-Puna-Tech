import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function Conductor() {
  const [searchParams] = useSearchParams();
  const ticket = searchParams.get('ticket');
  const patenteParam = searchParams.get('patente');
  const montoParam = searchParams.get('monto');

  const [pagado, setPagado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState<number | null>(null);
  const [pagoIniciado, setPagoIniciado] = useState(false);

  const monto = montoParam ? Number(montoParam) : 700;
  const montoConDescuento = Math.round(monto * 0.8);
  const ahorro = monto - montoConDescuento;

  useEffect(() => {
    if (pagado && tiempoRestante !== null && tiempoRestante > 0) {
      const timer = setInterval(() => {
        setTiempoRestante((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [pagado, tiempoRestante]);

  function iniciarPago() {
    setPagoIniciado(true);
    setTimeout(() => {
      setPagado(true);
      setTiempoRestante(3600);
    }, 2000);
  }

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-cream font-body flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {!pagado ? (
          <div className="bg-white rounded-2xl shadow-lg border border-bordo-100 p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-bordo-900 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-2xl font-bold">ES</span>
              </div>
              <h1 className="mt-3 font-title text-xl font-bold text-bordo-900">Estacionar Salta</h1>
              {ticket && (
                <p className="text-xs text-muted mt-1">Ticket: {ticket}</p>
              )}
            </div>

            <div className="p-4 bg-bordo-100 rounded-xl mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark/60">Patente</span>
                <span className="font-bold text-lg text-dark">{patenteParam || 'AB123CD'}</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-dark/60">Tarifa base (1 hora)</span>
                <span className="font-semibold">$700</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-dark/60">Descuento pago digital (20%)</span>
                <span className="font-semibold text-success">-${ahorro.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-bold text-dark">Total a pagar</span>
                <span className="font-title font-extrabold text-xl text-bordo-900">
                  ${montoConDescuento.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
              <p className="text-xs text-blue-800 text-center">
                Descuento del 20% aplicado automáticamente por pago digital.
                <br />La diferencia es absorbida por la Municipalidad.
              </p>
            </div>

            <button
              onClick={iniciarPago}
              disabled={pagoIniciado}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl text-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {pagoIniciado ? (
                <>Procesando...</>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Pagar con Mercado Pago
                </>
              )}
            </button>

            <p className="mt-3 text-xs text-center text-muted">
              Pago seguro vía Mercado Pago · Débito, crédito o transferencia
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-green-200 p-6 text-center">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-4 font-title text-xl font-bold text-success">Estacionamiento Activo</h2>
            <p className="text-sm text-dark/60 mt-1">Patente: {patenteParam || 'AB123CD'}</p>

            <div className="mt-6 p-6 bg-gray-50 rounded-xl">
              <p className="text-sm text-dark/60">Tiempo restante</p>
              <p className="font-title text-4xl font-extrabold text-bordo-900 mt-1 tracking-wider">
                {formatTime(tiempoRestante ?? 3600)}
              </p>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-800">
                Pago confirmado · Ticket registrado en Stellar con hash verificable
              </p>
            </div>
          </div>
        )}

        <p className="mt-4 text-xs text-center text-muted">
          Estacionar Salta · SEM Digital · Ordenanza N° 12.170
        </p>
      </div>
    </div>
  );
}
