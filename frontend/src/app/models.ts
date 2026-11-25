export interface Usuario { id:number; nombre:string; correo:string; rol:'USUARIO'|'ADMINISTRADOR'; estado:'ACTIVO'|'INACTIVO'; }
export interface PublicacionInput { titulo:string; descripcion:string; categoria:string; modalidad:'DONACION'|'INTERCAMBIO'; }
export interface Publicacion extends PublicacionInput { id:number; estado:'DISPONIBLE'|'RESERVADA'|'ENTREGADA'|'CANCELADA'; fechaPublicacion:string; usuarioId:number; propietario:string; }
export interface Solicitud { id:number; publicacionId:number; solicitanteId:number; propietarioId:number; mensaje:string; fechaSolicitud:string; estado:'PENDIENTE'|'ACEPTADA'|'RECHAZADA'|'CANCELADA'; titulo:string; solicitante:string; }
export interface Entrega { id:number; publicacionId:number; solicitudId:number; propietarioId:number; receptorId:number; fechaAcuerdo:string; fechaEntrega:string|null; estado:'PENDIENTE'|'COMPLETADA'; titulo:string; receptor:string; }
export interface UsuarioInput { nombre:string; correo:string; password:string; rol:Usuario['rol']; estado:Usuario['estado']; }
export interface Resultado { message:string; id?:number; entregaId?:number; }
