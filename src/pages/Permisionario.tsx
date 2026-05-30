import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { registrarEnStellar } from '../services/stellar';

type TipoVehiculo = 'auto' | 'moto';
type EstadoTicket = 'activo' | 'esperando_pago' | 'pagado' | 'efectivo_pendiente';

interface Ticket {
  id: string;
  patente: string;
  dni: string;
  tipo: TipoVehiculo;
  horas: number;
  minutos: number;
  monto: number;
  medio: 'digital' | 'efectivo' | null;
  timestamp: number;
  hasta: number;
  estado: EstadoTicket;
  direccion: string;
  qrPago: string;
  qrConsulta: string;
  permisionarioLegajo: string;
  permisionarioNombre: string;
  stellarHash?: string;
  velocidadMs?: number;
}

function generarId(): string {
  return 'TKT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

function calcularMonto(tipo: TipoVehiculo, horas: number, minutos: number): number {
  const tarifaHora = tipo === 'auto' ? 700 : 300;
  const tarifaFraccion = tipo === 'auto' ? 175 : 75;
  const totalMinutos = horas * 60 + minutos;
  if (totalMinutos <= 60) return tarifaHora;
  const extraMinutos = totalMinutos - 60;
  const fracciones = Math.ceil(extraMinutos / 15);
  return tarifaHora + fracciones * tarifaFraccion;
}

const PAGO_PREFIX = 'pago_confirmado_';

export default function Permisionario() {
  const { user } = useAuth();
  const [patente, setPatente] = useState('');
  const [dni, setDni] = useState('');
  const [tipo, setTipo] = useState<TipoVehiculo>('auto');
  const [horas, setHoras] = useState(1);
  const [minutos, setMinutos] = useState(0);
  const [direccion, setDireccion] = useState(user?.zona || '');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [showConfirmEfectivo, setShowConfirmEfectivo] = useState(false);
  const [history, setHistory] = useState<Ticket[]>(() => {
    try { return JSON.parse(localStorage.getItem('tickets') || '[]'); } catch { return []; }
  });

  function generarTicket() {
    if (!patente.trim() || !direccion.trim() || !dni.trim()) return;
    const id = generarId();
    const monto = calcularMonto(tipo, horas, minutos);
    const duracionMin = horas * 60 + minutos;
    const hasta = Date.now() + duracionMin * 60000;

    const qrPago = `${window.location.origin}/pagar?ticket=${id}&monto=${monto}&patente=${patente.toUpperCase()}&dni=${dni.trim()}&permisionario=${user?.legajo || ''}&tipo=${tipo}`;
    const qrConsulta = `${window.location.origin}/consultar?patente=${patente.toUpperCase()}`;

    const newTicket: Ticket = {
      id,
      patente: patente.toUpperCase(),
      dni: dni.trim(),
      tipo,
      horas,
      minutos,
      monto,
      medio: null,
      timestamp: Date.now(),
      hasta,
      estado: 'activo',
      direccion: direccion.trim(),
      qrPago,
      qrConsulta,
      permisionarioLegajo: user?.legajo || '---',
      permisionarioNombre: user?.nombre || '---',
    };
    setTicket(newTicket);
  }

  function generarQrPago() {
    if (!ticket) return;
    const updated = { ...ticket, estado: 'esperando_pago' as EstadoTicket };
    setTicket(updated);
  }

  function confirmarEfectivo() {
    if (!ticket) return;
    const duracionMin = ticket.horas * 60 + ticket.minutos;
    const record = registrarEnStellar(
      ticket.id, ticket.patente, ticket.dni, ticket.monto, 'efectivo',
      user?.legajo || '---', user?.nombre || '---',
      ticket.direccion, duracionMin,
    );
    const updated: Ticket = {
      ...ticket,
      medio: 'efectivo',
      estado: 'efectivo_pendiente',
      stellarHash: record.hash,
    };
    setTicket(updated);
    const newHistory = [updated, ...history];
    setHistory(newHistory);
    localStorage.setItem('tickets', JSON.stringify(newHistory));
    setShowConfirmEfectivo(false);
  }

  useEffect(() => {
    if (!ticket || ticket.estado !== 'esperando_pago') return;
    const interval = setInterval(() => {
      const confirmKey = PAGO_PREFIX + ticket.id;
      const data = localStorage.getItem(confirmKey);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (parsed.confirmado) {
            clearInterval(interval);
            const duracionMin = ticket.horas * 60 + ticket.minutos;
            const startTime = parsed.iniciadoEn || Date.now();
            const velocidadMs = Date.now() - startTime;
            const record = registrarEnStellar(
              ticket.id, ticket.patente, ticket.dni, ticket.monto, 'digital',
              user?.legajo || '---', user?.nombre || '---',
              ticket.direccion, duracionMin,
            );
            const updated: Ticket = {
              ...ticket,
              medio: 'digital',
              estado: 'pagado',
              stellarHash: record.hash,
              velocidadMs,
            };
            setTicket(updated);
            const newHistory = [updated, ...history];
            setHistory(newHistory);
            localStorage.setItem('tickets', JSON.stringify(newHistory));
          }
        } catch {}
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [ticket, user, history]);

  function reset() {
    setPatente('');
    setDni('');
    setTipo('auto');
    setHoras(1);
    setMinutos(0);
    setDireccion(user?.zona || '');
    setTicket(null);
    setShowConfirmEfectivo(false);
  }

  const montoActual = calcularMonto(tipo, horas, minutos);
  const descuento = Math.round(montoActual * 0.2);
  const montoConDescuento = montoActual - descuento;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-cream font-body">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.jfif" alt="" className="h-10 w-10 rounded-lg object-cover" />
          <div>
            <h1 className="font-title text-2xl font-bold text-bordo-900">Módulo Permisionario</h1>
            <p className="text-sm text-dark/60">{user?.nombre} · Legajo {user?.legajo} · {user?.zona}</p>
          </div>
        </div>

        {!ticket && (
          <div className="bg-white rounded-xl shadow-md border border-bordo-100 p-6">
            <label className="block text-sm font-medium text-dark">Patente del vehículo</label>
            <input
              type="text"
              value={patente}
              onChange={(e) => setPatente(e.target.value.toUpperCase())}
              placeholder="Ej: AB123CD"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-bordo-500"
              maxLength={7}
              autoFocus
            />
            <div className="mt-4">
              <label className="block text-sm font-medium text-dark">DNI del conductor</label>
              <input
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="Ej: 12345678"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-bordo-500"
                maxLength={8}
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-dark">Tipo de vehículo</label>
              <div className="mt-1 flex bg-gray-100 rounded-lg p-1">
                <button onClick={() => setTipo('auto')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tipo === 'auto' ? 'bg-white shadow text-bordo-900' : 'text-muted hover:text-dark'}`}>Auto — $700/h</button>
                <button onClick={() => setTipo('moto')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tipo === 'moto' ? 'bg-white shadow text-bordo-900' : 'text-muted hover:text-dark'}`}>Moto — $300/h</button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark">Horas</label>
                <select value={horas} onChange={(e) => setHoras(Number(e.target.value))} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-bordo-500">
                  {[0, 1, 2, 3, 4, 5].map((h) => (<option key={h} value={h}>{h} hora{h !== 1 ? 's' : ''}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark">Minutos extra</label>
                <select value={minutos} onChange={(e) => setMinutos(Number(e.target.value))} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-bordo-500">
                  {[0, 15, 30, 45].map((m) => (<option key={m} value={m}>{m} min</option>))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-dark">Dirección / Ubicación</label>
              <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Ej: Av. Belgrano 350" className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-bordo-500" />
              <p className="mt-1 text-xs text-muted">Zona asignada: {user?.zona} · Podés ajustar la dirección exacta</p>
            </div>
            <div className="mt-4 p-4 bg-bordo-100 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-sm text-dark/60">Total a cobrar:</span>
                <span className="font-title font-bold text-2xl text-bordo-900">${montoActual.toLocaleString('es-AR')}</span>
              </div>
              {tipo === 'auto' && (horas > 1 || minutos > 0) && <p className="mt-1 text-xs text-bordo-700">Fraccionamiento cada 15 min aplicado (Ordenanza 12.170)</p>}
            </div>
            <button onClick={generarTicket} disabled={!patente.trim() || !direccion.trim() || !dni.trim()} className="mt-4 w-full bg-bordo-900 text-white font-semibold py-3 rounded-lg text-lg hover:bg-bordo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Generar Ticket
            </button>
          </div>
        )}

        {ticket && (ticket.estado === 'activo') && (
          <div className="bg-white rounded-xl shadow-md border border-bordo-100 p-6">
            <div className="text-center">
              <h2 className="font-title text-xl font-bold text-bordo-900">Ticket #{ticket.id}</h2>
              <p className="text-sm text-dark/60 mt-1">{new Date(ticket.timestamp).toLocaleString('es-AR')}</p>
            </div>
            <div className="mt-4 p-4 bg-bordo-100 rounded-xl">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-dark/60">Patente</span><p className="font-bold text-lg text-dark">{ticket.patente}</p></div>
                <div><span className="text-dark/60">Vehículo</span><p className="font-semibold text-dark">{ticket.tipo === 'auto' ? 'Auto' : 'Moto'}</p></div>
                <div><span className="text-dark/60">Duración</span><p className="font-bold text-lg text-dark">{ticket.horas > 0 ? `${ticket.horas}h ` : ''}{ticket.minutos > 0 ? `${ticket.minutos}min` : ''}</p></div>
                <div><span className="text-dark/60">Monto</span><p className="font-bold text-lg text-dark">${ticket.monto.toLocaleString('es-AR')}</p></div>
                <div><span className="text-dark/60">Dirección</span><p className="font-bold text-dark">{ticket.direccion}</p></div>
                <div><span className="text-dark/60">DNI</span><p className="font-semibold text-dark">{ticket.dni}</p></div>
                <div><span className="text-dark/60">Desde</span><p className="font-semibold text-dark">{new Date(ticket.timestamp).toLocaleTimeString('es-AR')}</p></div>
                <div><span className="text-dark/60">Hasta</span><p className="font-semibold text-dark">{new Date(ticket.hasta).toLocaleTimeString('es-AR')}</p></div>
              </div>
            </div>
            <div className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
              {ticket.tipo === 'auto' && (
                <p className="text-sm text-blue-800 mb-3">💳 Pago digital: <strong>${montoConDescuento.toLocaleString('es-AR')}</strong> <span className="text-xs">(20% descuento)</span></p>
              )}
              <button onClick={generarQrPago} className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl text-lg hover:bg-blue-700 transition-colors">
                Generar QR de pago
              </button>
            </div>
            <div className="mt-3">
              <button onClick={() => setShowConfirmEfectivo(true)} className="w-full border border-amber-300 text-amber-800 font-semibold py-3 rounded-xl hover:bg-amber-50 transition-colors">
                Cobrar en efectivo
              </button>
            </div>
            {showConfirmEfectivo && (
              <div className="mt-3 p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
                <p className="text-sm text-amber-800 font-medium">Confirmar cobro en efectivo</p>
                <p className="text-2xl font-bold text-dark mt-2">${ticket.monto.toLocaleString('es-AR')}</p>
                <p className="text-sm text-muted">{ticket.patente} · {ticket.direccion}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button onClick={() => setShowConfirmEfectivo(false)} className="border border-gray-300 text-dark font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
                  <button onClick={confirmarEfectivo} className="bg-warning text-white font-semibold py-3 rounded-lg hover:bg-amber-600 transition-colors">Confirmar cobro</button>
                </div>
              </div>
            )}
            <button onClick={reset} className="mt-4 w-full text-bordo-700 font-semibold py-2 hover:underline">Cancelar y nuevo ticket</button>
          </div>
        )}

        {ticket && ticket.estado === 'esperando_pago' && (
          <div className="bg-white rounded-xl shadow-md border border-blue-200 p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <h2 className="font-title text-xl font-bold text-bordo-900">Esperando pago</h2>
            </div>
            <p className="text-sm text-muted mb-1">Ticket #{ticket.id} · ${ticket.monto.toLocaleString('es-AR')}</p>
            <p className="text-sm text-muted mb-4">El conductor debe escanear este QR para pagar</p>
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-xl border-2 border-blue-300 inline-block">
                <QRCodeSVG value={ticket.qrPago} size={200} level="M" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">El ticket se actualizará automáticamente cuando el conductor pague</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => window.open(ticket.qrPago, '_blank')} className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
                Abrir pago
              </button>
              <button onClick={() => { navigator.clipboard.writeText(ticket.qrPago); }} className="flex-1 border border-blue-300 text-blue-700 text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-50 transition-colors">
                Copiar link
              </button>
            </div>
            <div className="mt-3 flex justify-center gap-2">
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
            <div className="mt-6 space-y-2">
              <button onClick={() => { setShowConfirmEfectivo(true); }} className="w-full border border-amber-300 text-amber-800 font-semibold py-3 rounded-xl hover:bg-amber-50 transition-colors">
                Cobrar en efectivo (alternativa)
              </button>
              {showConfirmEfectivo && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm font-medium text-amber-800">${ticket.monto.toLocaleString('es-AR')} · {ticket.patente}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button onClick={() => setShowConfirmEfectivo(false)} className="text-sm border border-gray-300 px-3 py-2 rounded-lg">Cancelar</button>
                    <button onClick={confirmarEfectivo} className="text-sm bg-warning text-white px-3 py-2 rounded-lg hover:bg-amber-600">Confirmar efectivo</button>
                  </div>
                </div>
              )}
              <button onClick={reset} className="w-full text-bordo-700 font-semibold py-2 hover:underline">Cancelar ticket</button>
            </div>
          </div>
        )}

        {ticket && (ticket.estado === 'pagado' || ticket.estado === 'efectivo_pendiente') && (
          <div className="bg-white rounded-xl shadow-md border border-green-200 p-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-success rounded-full flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="mt-2 font-title text-xl font-bold text-success">
                {ticket.estado === 'pagado' ? 'Pago recibido' : 'Efectivo registrado'}
              </h2>
              <p className="text-sm text-dark/60">Ticket #{ticket.id} · {new Date(ticket.timestamp).toLocaleString('es-AR')}</p>
            </div>
            <div className="mt-4 p-4 bg-bordo-100 rounded-xl">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-dark/60">Patente</span><p className="font-bold text-lg text-dark">{ticket.patente}</p></div>
                <div><span className="text-dark/60">Monto</span><p className="font-bold text-lg text-dark">${ticket.monto.toLocaleString('es-AR')}</p></div>
                <div><span className="text-dark/60">Dirección</span><p className="font-bold text-dark">{ticket.direccion}</p></div>
                <div><span className="text-dark/60">Medio</span><p className={`font-semibold ${ticket.estado === 'pagado' ? 'text-success' : 'text-warning'}`}>{ticket.estado === 'pagado' ? 'Digital' : 'Efectivo'}</p></div>
                <div><span className="text-dark/60">Desde</span><p className="font-semibold text-dark">{new Date(ticket.timestamp).toLocaleTimeString('es-AR')}</p></div>
                <div><span className="text-dark/60">Hasta</span><p className="font-semibold text-dark">{new Date(ticket.hasta).toLocaleTimeString('es-AR')}</p></div>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <QRCodeSVG value={ticket.qrConsulta} size={160} level="M" />
              </div>
            </div>
            <p className="mt-2 text-xs text-center text-muted">QR para que el conductor consulte su estacionamiento</p>
            {ticket.stellarHash && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-muted">Hash Stellar</p>
                <code className="text-xs font-mono text-dark break-all">{ticket.stellarHash}</code>
              </div>
            )}
            {ticket.velocidadMs && (
              <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200 text-center">
                <p className="text-sm text-green-800 font-medium">⚡ Transacción completada en {(ticket.velocidadMs / 1000).toFixed(1)} segundos</p>
              </div>
            )}
            <button onClick={reset} className="mt-4 w-full bg-bordo-900 text-white font-semibold py-3 rounded-lg hover:bg-bordo-700 transition-colors">
              Nuevo ticket
            </button>
          </div>
        )}

        <div className="mt-8">
          <h2 className="font-title font-bold text-lg text-bordo-900 mb-3">Mis tickets hoy</h2>
          {history.filter(t => t.permisionarioLegajo === user?.legajo).length === 0 ? (
            <p className="text-sm text-muted bg-white rounded-lg border border-bordo-100 p-4 text-center">No hay tickets registrados hoy</p>
          ) : (
            <div className="space-y-2">
              {history.filter(t => t.permisionarioLegajo === user?.legajo).slice(0, 10).map((t) => (
                <div key={t.id} className="bg-white rounded-lg border border-bordo-100 p-3 flex justify-between items-center text-sm">
                  <div className="flex-1">
                    <span className="font-bold text-dark">{t.patente}</span>
                    <span className="text-muted ml-2">${t.monto.toLocaleString('es-AR')}</span>
                    <span className="text-muted ml-2 text-xs">{t.direccion}</span>
                    {t.velocidadMs && <span className="text-success ml-2 text-xs">⚡{(t.velocidadMs / 1000).toFixed(1)}s</span>}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${t.estado === 'pagado' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {t.estado === 'pagado' ? 'Digital' : 'Efectivo'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
