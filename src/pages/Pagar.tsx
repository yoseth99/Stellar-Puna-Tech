import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PAGO_PREFIX = 'pago_confirmado_';

export default function Pagar() {
  const [searchParams] = useSearchParams();
  const ticket = searchParams.get('ticket') || '';
  const montoParam = searchParams.get('monto') || '0';
  const patente = searchParams.get('patente') || '';
  const dniParam = searchParams.get('dni') || '';
  const permisionario = searchParams.get('permisionario') || '';
  const tipo = searchParams.get('tipo') || 'auto';

  const navigate = useNavigate();
  const [step, setStep] = useState<'init' | 'processing' | 'success'>('init');
  const [progress, setProgress] = useState(0);
  const [autoRedirect, setAutoRedirect] = useState(false);

  const monto = Number(montoParam);
  const descuento = Math.round(monto * 0.2);
  const montoFinal = monto - descuento;

  function iniciarPago() {
    setStep('processing');
    setProgress(20);
    const iniciadoEn = Date.now();

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 10;
      });
    }, 180);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      localStorage.setItem(PAGO_PREFIX + ticket, JSON.stringify({
        confirmado: true,
        ticketId: ticket,
        patente,
        monto,
        permisionario,
        iniciadoEn,
        timestamp: Date.now(),
      }));
      setStep('success');
      setAutoRedirect(true);
    }, 2200);
  }

  useEffect(() => {
    if (autoRedirect) {
      const timer = setTimeout(() => {
        navigate(`/consultar?patente=${patente}&dni=${dniParam}`);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [autoRedirect]);

  return (
    <div className="min-h-screen bg-gray-50 font-body flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step === 'init' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="text-center mb-6">
              <img src="/logo.jfif" alt="" className="h-14 w-14 rounded-xl mx-auto object-cover" />
              <h1 className="mt-2 font-title text-xl font-bold text-bordo-900">Pago de estacionamiento</h1>
              <p className="text-xs text-muted mt-1">Permisionario #{permisionario}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Patente</span>
                <span className="font-bold text-dark">{patente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Ticket</span>
                <span className="font-mono text-xs text-dark">{ticket}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Vehículo</span>
                <span className="text-dark">{tipo === 'auto' ? 'Auto' : 'Moto'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">DNI</span>
                <span className="text-dark">{dniParam}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Tarifa</span>
                <span>${monto.toLocaleString('es-AR')}</span>
              </div>
              {tipo === 'auto' && (
                <div className="flex justify-between text-sm">
                  <span className="text-success">Descuento 20% (Ordenanza 12.170)</span>
                  <span className="text-success">-${descuento.toLocaleString('es-AR')}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                <span>Total</span>
                <span className="text-bordo-900">${montoFinal.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <button
              onClick={iniciarPago}
              className="mt-6 w-full bg-blue-600 text-white font-semibold py-3 rounded-xl text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Pagar con Mercado Pago
            </button>
            <p className="mt-3 text-xs text-center text-muted">Débito, crédito o transferencia</p>
          </div>
        )}

        {step === 'processing' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <p className="mt-4 font-semibold text-dark">Procesando pago...</p>
            <p className="text-sm text-muted mt-1">No cierres esta ventana</p>
            <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-150" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-white rounded-2xl shadow-lg border border-green-200 p-8 text-center">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-4 font-title text-xl font-bold text-success">Pago exitoso</h2>
            <p className="text-sm text-muted mt-1">Patente {patente}</p>
            <p className="text-2xl font-bold text-dark mt-2">${montoFinal.toLocaleString('es-AR')}</p>
            <p className="text-xs text-muted mt-1">Registrado en Stellar · Hash inmutable</p>
            <p className="mt-4 text-sm text-muted">Redirigiendo a tu estacionamiento...</p>
            <div className="mt-2 flex justify-center gap-1">
              <span className="w-2 h-2 bg-bordo-900 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="w-2 h-2 bg-bordo-900 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 bg-bordo-900 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
