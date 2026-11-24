import { Router } from 'express';
import { query,transaction } from './db.js';
import { auth } from './auth.js';
import { fail,id,publication,owner } from './helpers.js';
export const entregas=Router();
entregas.use(auth);
const select=`SELECT e.*,p.titulo,u.nombre AS receptor FROM entregas e
 JOIN publicaciones p ON p.id=e.publicacionId JOIN usuarios u ON u.id=e.receptorId`;
const visible=`(e.propietarioId=? OR e.receptorId=? OR ?='ADMINISTRADOR')`;
entregas.get('/',async(req,res)=>res.json(await query(`${select} WHERE ${visible} ORDER BY e.id DESC`,[req.user.id,req.user.id,req.user.rol])));
entregas.get('/:id',async(req,res)=>{
 const [e]=await query(`${select} WHERE e.id=? AND ${visible}`,[id(req.params.id),req.user.id,req.user.id,req.user.rol]);
 if(!e) fail(404,'Entrega no encontrada o sin acceso'); res.json(e);
});
entregas.patch('/:id/completar',async(req,res)=>{
 const eid=id(req.params.id);
 const [ref]=await query('SELECT publicacionId FROM entregas WHERE id=?',[eid]);
 if(!ref) fail(404,'Entrega no encontrada');
 await transaction(async conn=>{
  const p=await publication(ref.publicacionId,conn); owner(p,req.user);
  const [e]=await query('SELECT * FROM entregas WHERE id=? FOR UPDATE',[eid],conn);
  if(!e) fail(404,'Entrega no encontrada');
  if(e.estado!=='PENDIENTE'||p.estado!=='RESERVADA') fail(409,'La entrega no puede completarse');
  await query("UPDATE entregas SET estado='COMPLETADA',fechaEntrega=CURRENT_TIMESTAMP WHERE id=?",[eid],conn);
  await query("UPDATE publicaciones SET estado='ENTREGADA' WHERE id=?",[p.id],conn);
 }); res.json({message:'Entrega completada'});
});
// No se permite crear entregas manuales ni borrar historial.
entregas.post('/',(req,res)=>fail(405,'La entrega se genera al aceptar una solicitud'));
entregas.delete('/:id',(req,res)=>fail(405,'El historial de entregas no se elimina'));
