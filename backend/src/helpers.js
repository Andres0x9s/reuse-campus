import { query } from './db.js';

export function fail(status, message) {
  throw Object.assign(new Error(message), { status });
}

export function id(value) {
  const n = Number(value);

  if (!Number.isSafeInteger(n) || n < 1)
    fail(400, 'Identificador inválido');

  return n;
}

export function required(value, field, max = 1000) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max)
    fail(400, `${field} es obligatorio (máximo ${max} caracteres)`);

  return value.trim();
}

export function choice(value, options, field) {
  if (!options.includes(value))
    fail(400, `${field} inválido`);

  return value;
}

export function email(value) {
  const v = required(value, 'Correo', 150).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
    fail(400, 'Correo inválido');

  return v;
}

export function password(value) {
  if (typeof value !== 'string' || value.length < 8 || Buffer.byteLength(value) > 72)
    fail(400, 'Contraseña: mínimo 8 caracteres y máximo 72 bytes');

  return value;
}

export async function publication(pid, conn) {
  const [p] = await query(
    'SELECT * FROM publicaciones WHERE id=? FOR UPDATE',
    [pid],
    conn
  );

  if (!p)
    fail(404, 'Publicación no encontrada');

  return p;
}

export function owner(p, user) {
  if (p.usuarioId !== user.id)
    fail(403, 'Solo el propietario puede realizar esta operación');
}

export function available(p) {
  if (p.estado !== 'DISPONIBLE')
    fail(409, 'La publicación no está disponible');
}

export function pending(s) {
  if (s.estado !== 'PENDIENTE')
    fail(409, 'La solicitud ya no está pendiente');
}