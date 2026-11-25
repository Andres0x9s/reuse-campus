import { Router } from 'express';
import { query, transaction } from './db.js';
import { auth } from './auth.js';
import { fail, id, required, choice, publication, owner, available } from './helpers.js';
export const publicaciones = Router();
publicaciones.use(auth);
const select = 'SELECT p.*,u.nombre AS propietario FROM publicaciones p JOIN usuarios u ON u.id=p.usuarioId';
function data(b) {
  return [required(b.titulo,'Título',150),required(b.descripcion,'Descripción',2000),
    required(b.categoria,'Categoría',80),choice(b.modalidad,['DONACION','INTERCAMBIO'],'Modalidad')];
}
publicaciones.get('/',async (req,res) => res.json(await query(`${select} ORDER BY p.id DESC`)));
publicaciones.get('/:id',async (req,res) => {
  const [p] = await query(`${select} WHERE p.id=?`,[id(req.params.id)]);
  if (!p) fail(404,'Publicación no encontrada');
  res.json(p);
});
publicaciones.post('/',async (req,res) => {
  const r = await query('INSERT INTO publicaciones(titulo,descripcion,categoria,modalidad,usuarioId) VALUES(?,?,?,?,?)',
    [...data(req.body),req.user.id]);
  res.status(201).json({id:r.insertId,message:'Publicación creada'});
});
publicaciones.put('/:id',async (req,res) => {
  const pid=id(req.params.id), values=data(req.body);
  await transaction(async conn => {
    const p=await publication(pid,conn); owner(p,req.user); available(p);
    await query('UPDATE publicaciones SET titulo=?,descripcion=?,categoria=?,modalidad=? WHERE id=?',[...values,pid],conn);
  });
  res.json({message:'Publicación actualizada'});
});
publicaciones.delete('/:id',async (req,res) => {
  const pid=id(req.params.id);
  await transaction(async conn => {
    const p=await publication(pid,conn); owner(p,req.user); available(p);
    await query("UPDATE publicaciones SET estado='CANCELADA' WHERE id=?",[pid],conn);
    await query("UPDATE solicitudes SET estado='RECHAZADA' WHERE publicacionId=? AND estado='PENDIENTE'",[pid],conn);
  });
  res.json({message:'Publicación cancelada; historial conservado'});
});
