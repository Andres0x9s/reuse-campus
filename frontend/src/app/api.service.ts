import { Injectable,inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from './auth';
import { Publicacion, PublicacionInput, Solicitud, Entrega, Usuario, UsuarioInput, Resultado } from './models';
@Injectable({providedIn:'root'})
export class ApiService {
 private http=inject(HttpClient);
 publicaciones(){return this.http.get<Publicacion[]>(`${API}/publicaciones`);}
 guardarPublicacion(b:PublicacionInput,id?:number){return id?this.http.put<Resultado>(`${API}/publicaciones/${id}`,b):this.http.post<Resultado>(`${API}/publicaciones`,b);}
 cancelarPublicacion(id:number){return this.http.delete<Resultado>(`${API}/publicaciones/${id}`);}
 solicitudes(){return this.http.get<Solicitud[]>(`${API}/solicitudes`);}
 solicitar(publicacionId:number,mensaje:string){return this.http.post<Resultado>(`${API}/solicitudes`,{publicacionId,mensaje});}
 editarSolicitud(id:number,mensaje:string){return this.http.put<Resultado>(`${API}/solicitudes/${id}`,{mensaje});}
 cancelarSolicitud(id:number){return this.http.delete<Resultado>(`${API}/solicitudes/${id}`);}
 decidir(id:number,accion:'aceptar'|'rechazar'){return this.http.patch<Resultado>(`${API}/solicitudes/${id}/${accion}`,{});}
 entregas(){return this.http.get<Entrega[]>(`${API}/entregas`);}
 completar(id:number){return this.http.patch<Resultado>(`${API}/entregas/${id}/completar`,{});}
 usuarios(){return this.http.get<Usuario[]>(`${API}/usuarios`);}
 guardarUsuario(b:UsuarioInput,id?:number){return id?this.http.put<Resultado>(`${API}/usuarios/${id}`,b):this.http.post<Resultado>(`${API}/usuarios`,b);}
 desactivar(id:number){return this.http.delete<Resultado>(`${API}/usuarios/${id}`);}
}
export function mensajeError(e:any):string {
 if(e.status===0)return 'No se pudo conectar con la API. Revisa el backend.';
 if(e.status===401)return 'Sesión inválida o credenciales incorrectas. Inicia sesión nuevamente.';
 return e.error?.message||'Ocurrió un error inesperado.';
}
