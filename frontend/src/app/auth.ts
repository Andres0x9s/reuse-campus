import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { CanActivateFn, Router } from '@angular/router';
import { tap, map, catchError, of } from 'rxjs';
import { Usuario } from './models';
export const API='http://localhost:3000/api';
@Injectable({providedIn:'root'})
export class AuthService {
 private http=inject(HttpClient);
 private router=inject(Router);
 usuario=signal<Usuario|null>(null);
 get token(){return sessionStorage.getItem('reuse_token');}
 login(correo:string,password:string){
  return this.http.post<{token:string;usuario:Usuario}>(`${API}/auth/login`,{correo,password}).pipe(tap(r=>{
   sessionStorage.setItem('reuse_token',r.token); this.usuario.set(r.usuario);
  }));
 }
 me(){return this.http.get<Usuario>(`${API}/auth/me`).pipe(tap(u=>this.usuario.set(u)));}
 logout(){sessionStorage.removeItem('reuse_token');this.usuario.set(null);void this.router.navigate(['/login']);}
}
export const authInterceptor:HttpInterceptorFn=(req,next)=>{
 const auth=inject(AuthService);
 const token=auth.token;
 return next(token&&req.url.startsWith(API+'/')?req.clone({setHeaders:{Authorization:`Bearer ${token}`}}):req);
};
export const authGuard:CanActivateFn=()=>{
 const auth=inject(AuthService),router=inject(Router);
 if(!auth.token)return router.createUrlTree(['/login']);
 return auth.me().pipe(map(()=>true),catchError(()=>{auth.logout();return of(router.createUrlTree(['/login']));}));
};
export const adminGuard:CanActivateFn=()=>{
 const auth=inject(AuthService),router=inject(Router);
 if(!auth.token)return router.createUrlTree(['/login']);
 return auth.me().pipe(map(u=>u.rol==='ADMINISTRADOR'?true:router.createUrlTree(['/publicaciones'])),catchError(()=>{auth.logout();return of(router.createUrlTree(['/login']));}));
};
