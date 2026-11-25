import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { query } from './db.js';
import { usuarios,sesiones } from './usuarios.js';
import { publicaciones } from './publicaciones.js';
import { solicitudes } from './solicitudes.js';
import { entregas } from './entregas.js';
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('CAMBIAR'))
 throw new Error('Configura JWT_SECRET en .env (mínimo 32 caracteres)');
const app=express();
app.use(cors({origin:process.env.FRONTEND_ORIGIN || 'http://localhost:4200'}));
app.use(express.json({limit:'64kb'}));
app.use((req,res,next)=>{
 if(req.body == null) req.body={};
 if(typeof req.body!=='object'||Array.isArray(req.body)) return res.status(400).json({message:'El cuerpo debe ser un objeto JSON'});
 next();
});
app.get('/api/health',async(req,res)=>{ await query('SELECT 1'); res.json({status:'ok'}); });
app.use('/api/auth',sesiones);
app.use('/api/usuarios',usuarios);
app.use('/api/publicaciones',publicaciones);
app.use('/api/solicitudes',solicitudes);
app.use('/api/entregas',entregas);
app.use((req,res)=>res.status(404).json({message:'Ruta no encontrada'}));
app.use((err,req,res,next)=>{
 if(err.code==='ER_DUP_ENTRY') return res.status(409).json({message:'Registro duplicado o conflicto de estado'});
 if(err.status && err.status<500) return res.status(err.status).json({message:err.type==='entity.parse.failed'?'JSON inválido':err.message});
 console.error(err); res.status(500).json({message:'Error interno del servidor'});
});
await query('SELECT 1');
app.listen(Number(process.env.PORT||3000),()=>console.log('API disponible en http://localhost:'+ (process.env.PORT||3000)));

