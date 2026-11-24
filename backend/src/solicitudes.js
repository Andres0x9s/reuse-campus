import { Router } from 'express';
import { query, transaction } from './db.js';
import { auth } from './auth.js';
import { fail,id,required,publication,owner,available,pending } from './helpers.js';
export const solicitudes = Router();
solicitudes.use(auth);
const select = `SELECT s.id,s.publicacionId,s.solicitanteId,s.mensaje,s.fechaSolicitud,s.estado,
 p.titulo,p.usuarioId AS propietarioId,u.nombre AS solicitante
 FROM solicitudes s JOIN publicaciones p ON p.id=s.publicacionId
 JOIN usuarios u ON u.id=s.solicitanteId`;
const canRead = `(s.solicitanteId=? OR p.usuarioId=? OR ?='ADMINISTRADOR')`;
solicitudes.get('/',async (req,res) => res.json(await query(`${select} WHERE ${canRead} ORDER BY s.id DESC`,
 [req.user.id,req.user.id,req.user.rol])));
solicitudes.get('/:id',async (req,res) => {
 const [s]=await query(`${select} WHERE s.id=? AND ${canRead}`,[id(req.params.id),req.user.id,req.user.id,req.user.rol]);
 if(!s) fail(404,'Solicitud no encontrada o sin acceso'); res.json(s);
});
solicitudes.post('/',async (req,res) => {
 const pid=id(req.body.publicacionId), mensaje=required(req.body.mensaje,'Mensaje',1000);
 const sid=await transaction(async conn => {
  const p=await publication(pid,conn); available(p);
  if(p.usuarioId===req.user.id) fail(409,'No puedes solicitar tu propia publicación');
  const [dup]=await query("SELECT id FROM solicitudes WHERE publicacionId=? AND solicitanteId=? AND estado='PENDIENTE'",[pid,req.user.id],conn);
  if(dup) fail(409,'Ya tienes una solicitud pendiente');
  const r=await query('INSERT INTO solicitudes(publicacionId,solicitanteId,mensaje) VALUES(?,?,?)',[pid,req.user.id,mensaje],conn);
  return r.insertId;
 });
 res.status(201).json({id:sid,message:'Solicitud creada'});
});
// Bloquear primero la publicación: todas las operaciones siguen el mismo orden.
async function locked(sid,work) {
 const [ref]=await query('SELECT publicacionId FROM solicitudes WHERE id=?',[sid]);
 if(!ref) fail(404,'Solicitud no encontrada');
 return transaction(async conn => {
  const p=await publication(ref.publicacionId,conn);
  const [s]=await query('SELECT * FROM solicitudes WHERE id=? FOR UPDATE',[sid],conn);
  if(!s) fail(404,'Solicitud no encontrada');
  return work(conn,p,s);
 });
}
function requester(s,u) { if(s.solicitanteId!==u.id) fail(403,'Solo el solicitante puede realizar esta operación'); }
solicitudes.put('/:id',async (req,res) => {
 const mensaje=required(req.body.mensaje,'Mensaje',1000);
 await locked(id(req.params.id),async (conn,p,s)=>{
  requester(s,req.user); pending(s); available(p);
  await query('UPDATE solicitudes SET mensaje=? WHERE id=?',[mensaje,s.id],conn);
 }); res.json({message:'Solicitud actualizada'});
});
solicitudes.delete('/:id',async (req,res) => {
 await locked(id(req.params.id),async (conn,p,s)=>{
  requester(s,req.user); pending(s);
  await query("UPDATE solicitudes SET estado='CANCELADA' WHERE id=?",[s.id],conn);
 }); res.json({message:'Solicitud cancelada'});
});
solicitudes.patch('/:id/rechazar',async (req,res) => {
 await locked(id(req.params.id),async (conn,p,s)=>{
  owner(p,req.user); pending(s); available(p);
  await query("UPDATE solicitudes SET estado='RECHAZADA' WHERE id=?",[s.id],conn);
 }); res.json({message:'Solicitud rechazada'});
});
solicitudes.patch('/:id/aceptar',async (req,res) => {
 const entregaId=await locked(id(req.params.id),async (conn,p,s)=>{
  owner(p,req.user); available(p); pending(s);
  // RN08-RN11: cambios atómicos, todo o nada.
  await query("UPDATE solicitudes SET estado='ACEPTADA' WHERE id=?",[s.id],conn);
  await query("UPDATE solicitudes SET estado='RECHAZADA' WHERE publicacionId=? AND id<>? AND estado='PENDIENTE'",[p.id,s.id],conn);
  await query("UPDATE publicaciones SET estado='RESERVADA' WHERE id=?",[p.id],conn);
  const r=await query('INSERT INTO entregas(publicacionId,solicitudId,propietarioId,receptorId) VALUES(?,?,?,?)',[p.id,s.id,p.usuarioId,s.solicitanteId],conn);
  return r.insertId;
 }); res.json({entregaId,message:'Solicitud aceptada y entrega generada'});
});
