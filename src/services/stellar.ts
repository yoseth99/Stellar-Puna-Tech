export interface StellarRecord {
  hash: string;
  ticketId: string;
  patente: string;
  dni: string;
  monto: number;
  medio: 'digital' | 'efectivo';
  timestamp: number;
  desde: number;
  hasta: number;
  permisionario: string;
  permisionarioNombre: string;
  bloque: number;
  direccion: string;
  duracionMinutos: number;
  activo: boolean;
}

let bloqueCounter = 1000000;

function generateHash(): string {
  const chars = '0123456789ABCDEF';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * 16)];
  }
  return hash;
}

export function registrarEnStellar(
  ticketId: string,
  patente: string,
  dni: string,
  monto: number,
  medio: 'digital' | 'efectivo',
  permisionario: string,
  permisionarioNombre: string,
  direccion: string,
  duracionMinutos: number,
): StellarRecord {
  bloqueCounter++;
  const ahora = Date.now();
  const hasta = ahora + duracionMinutos * 60000;
  const record: StellarRecord = {
    hash: generateHash(),
    ticketId,
    patente,
    dni,
    monto,
    medio,
    timestamp: ahora,
    desde: ahora,
    hasta,
    permisionario,
    permisionarioNombre,
    bloque: bloqueCounter,
    direccion,
    duracionMinutos,
    activo: true,
  };

  const history = getStellarHistory();
  history.unshift(record);
  localStorage.setItem('stellar_ledger', JSON.stringify(history));

  return record;
}

export function getStellarHistory(): StellarRecord[] {
  try {
    const data = JSON.parse(localStorage.getItem('stellar_ledger') || '[]');
    return data.map((r: StellarRecord) => ({
      ...r,
      activo: r.hasta > Date.now(),
    }));
  } catch {
    return [];
  }
}

export function getStellarStats() {
  const history = getStellarHistory();
  const total = history.length;
  const recaudacion = history.reduce((s, r) => s + r.monto, 0);
  const digitales = history.filter((r) => r.medio === 'digital').length;
  return { total, recaudacion, digitales, efectivos: total - digitales };
}

export function getStellarStatsByPermisionario(legajo: string) {
  const history = getStellarHistory().filter((r) => r.permisionario === legajo);
  const total = history.length;
  const recaudacion = history.reduce((s, r) => s + r.monto, 0);
  const digitales = history.filter((r) => r.medio === 'digital').length;
  return { total, recaudacion, digitales, efectivos: total - digitales, records: history };
}

export function getRecordsByPatente(patente: string, dni?: string, legajo?: string): StellarRecord[] {
  let records = getStellarHistory().filter(
    (r) => r.patente.toUpperCase() === patente.toUpperCase(),
  );
  if (dni) records = records.filter((r) => r.dni === dni);
  if (legajo) records = records.filter((r) => r.permisionario === legajo);
  return records;
}
