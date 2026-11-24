import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, transaction } from './db.js';
import { auth, admin } from './auth.js';
import { fail, id, required, choice, email, password } from './helpers.js';

export const usuarios = Router();
export const sesiones = Router();

const fields = 'id,nombre,correo,rol,estado';

sesiones.post('/login', async (req, res) => {
  const correo = email(req.body.correo);
  const clave = password(req.body.password);

  const [u] = await query(
    'SELECT * FROM usuarios WHERE correo=?',
    [correo]
  );

  if (!u || u.estado !== 'ACTIVO' || !await bcrypt.compare(clave, u.password))
    fail(401, 'Credenciales incorrectas o usuario inactivo');

  const token = jwt.sign({}, process.env.JWT_SECRET, {
    subject: String(u.id),
    expiresIn: '4h',
    algorithm: 'HS256'
  });

  delete u.password;

  res.json({ token, usuario: u });
});

sesiones.get('/me', auth, (req, res) => {
  res.json(req.user);
});

usuarios.use(auth, admin);

usuarios.get('/', async (req, res) => {
  res.json(
    await query(`SELECT ${fields} FROM usuarios ORDER BY id`)
  );
});

usuarios.get('/:id', async (req, res) => {
  const [u] = await query(
    `SELECT ${fields} FROM usuarios WHERE id=?`,
    [id(req.params.id)]
  );

  if (!u)
    fail(404, 'Usuario no encontrado');

  res.json(u);
});

usuarios.post('/', async (req, res) => {
  const b = req.body;

  const result = await query(
    'INSERT INTO usuarios(nombre,correo,password,rol) VALUES(?,?,?,?)',
    [
      required(b.nombre, 'Nombre', 100),
      email(b.correo),
      await bcrypt.hash(password(b.password), 10),
      choice(b.rol, ['USUARIO', 'ADMINISTRADOR'], 'Rol')
    ]
  );

  res.status(201).json({
    id: result.insertId,
    message: 'Usuario creado'
  });
});

usuarios.put('/:id', async (req, res) => {
  const uid = id(req.params.id);
  const b = req.body;

  const nombre = required(b.nombre, 'Nombre', 100);
  const correo = email(b.correo);
  const rol = choice(b.rol, ['USUARIO', 'ADMINISTRADOR'], 'Rol');
  const estado = choice(b.estado, ['ACTIVO', 'INACTIVO'], 'Estado');

  if (uid === req.user.id &&
      (rol !== 'ADMINISTRADOR' || estado !== 'ACTIVO'))
    fail(409, 'No puedes quitarte el acceso administrativo');

  const hash = b.password
    ? await bcrypt.hash(password(b.password), 10)
    : null;

  await transaction(async conn => {
    const [u] = await query(
      'SELECT id FROM usuarios WHERE id=? FOR UPDATE',
      [uid],
      conn
    );

    if (!u)
      fail(404, 'Usuario no encontrado');

    await query(
      'UPDATE usuarios SET nombre=?,correo=?,rol=?,estado=?,password=COALESCE(?,password) WHERE id=?',
      [nombre, correo, rol, estado, hash, uid],
      conn
    );
  });

  res.json({ message: 'Usuario actualizado' });
});

usuarios.delete('/:id', async (req, res) => {
  const uid = id(req.params.id);

  if (uid === req.user.id)
    fail(409, 'No puedes desactivarte a ti mismo');

  const r = await query(
    "UPDATE usuarios SET estado='INACTIVO' WHERE id=?",
    [uid]
  );

  if (!r.affectedRows)
    fail(404, 'Usuario no encontrado');

  res.json({ message: 'Usuario desactivado' });
});