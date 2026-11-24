import jwt from 'jsonwebtoken';
import { query } from './db.js';
import { fail } from './helpers.js';

export async function auth(req, res, next) {
  const header = req.get('Authorization') || '';

  if (!header.startsWith('Bearer '))
    fail(401, 'Debes iniciar sesión');

  let claims;

  try {
    claims = jwt.verify(
      header.slice(7),
      process.env.JWT_SECRET,
      { algorithms: ['HS256'] }
    );
  } catch {
    fail(401, 'Sesión inválida o vencida');
  }

  const [user] = await query(
    'SELECT id,nombre,correo,rol,estado FROM usuarios WHERE id=?',
    [claims.sub]
  );

  if (!user || user.estado !== 'ACTIVO')
    fail(401, 'Usuario inactivo o inexistente');

  req.user = user;

  next();
}

export function admin(req, res, next) {
  if (req.user.rol !== 'ADMINISTRADOR')
    fail(403, 'Se requiere rol administrador');

  next();
}