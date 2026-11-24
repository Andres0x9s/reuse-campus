import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db, query } from './db.js';

try {
  const hash = await bcrypt.hash('Demo1234!', 10);

  const users = [
    ['Administrador', 'admin@demo.cl', 'ADMINISTRADOR'],
    ['Ana', 'ana@demo.cl', 'USUARIO'],
    ['Bruno', 'bruno@demo.cl', 'USUARIO'],
    ['Carla', 'carla@demo.cl', 'USUARIO']
  ];

  for (const [nombre, correo, rol] of users) {
    await query(
      'INSERT INTO usuarios(nombre,correo,password,rol) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE id=id',
      [nombre, correo, hash, rol]
    );
  }

  console.log('Usuarios de demostración creados. Clave inicial: Demo1234! (solo desarrollo local).');

} finally {
  await db.end();
}