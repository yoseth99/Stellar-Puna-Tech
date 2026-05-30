export interface Permisionario {
  legajo: string;
  pin: string;
  nombre: string;
  zona: string;
}

export interface MunicipalUser {
  username: string;
  password: string;
  nombre: string;
}

export type UserRole = 'permisionario' | 'municipal';

export interface AuthUser {
  role: UserRole;
  legajo?: string;
  username?: string;
  nombre: string;
  zona?: string;
}

const permisionarios: Permisionario[] = [
  { legajo: '001', pin: '1234', nombre: 'Juan Pérez', zona: 'Av. Belgrano 300-400' },
  { legajo: '002', pin: '1234', nombre: 'María Gómez', zona: 'Mitre 100-200' },
  { legajo: '003', pin: '1234', nombre: 'Carlos López', zona: 'Zuviría 500-600' },
];

const municipales: MunicipalUser[] = [
  { username: 'admin', password: 'admin', nombre: 'Admin Municipal' },
  { username: 'control', password: '1234', nombre: 'Control Urbano' },
];

export function loginPermisionario(legajo: string, pin: string): AuthUser | null {
  const p = permisionarios.find((x) => x.legajo === legajo && x.pin === pin);
  if (!p) return null;
  return { role: 'permisionario', legajo: p.legajo, nombre: p.nombre, zona: p.zona };
}

export function loginMunicipal(username: string, password: string): AuthUser | null {
  const m = municipales.find((x) => x.username === username && x.password === password);
  if (!m) return null;
  return { role: 'municipal', username: m.username, nombre: m.nombre };
}

export function getPermisionarioByLegajo(legajo: string): Permisionario | undefined {
  return permisionarios.find((x) => x.legajo === legajo);
}

export function getAllPermisionarios(): Permisionario[] {
  return permisionarios;
}
