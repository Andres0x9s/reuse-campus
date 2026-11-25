import { Component,inject } from '@angular/core';
import { RouterLink,RouterLinkActive,RouterOutlet } from '@angular/router';
import { AuthService } from './auth';
@Component({selector:'app-root',imports:[RouterLink,RouterLinkActive,RouterOutlet],template:`
<header><div class="nav"><a class="brand" routerLink="/publicaciones">♻ ReUse Campus</a>
@if(auth.usuario();as u){
<nav><a routerLink="/publicaciones" routerLinkActive="active">Publicaciones</a><a routerLink="/solicitudes" routerLinkActive="active">Solicitudes</a><a routerLink="/entregas" routerLinkActive="active">Entregas</a>
@if(u.rol==='ADMINISTRADOR'){<a routerLink="/usuarios" routerLinkActive="active">Usuarios</a>}</nav>
<span>{{u.nombre}} · {{u.rol}}</span><button class="secondary" (click)="auth.logout()">Salir</button>}
</div></header><main><router-outlet /></main>
<footer>ReUse Campus · Reutiliza, comparte y reduce residuos.</footer>`})
export class AppComponent {auth=inject(AuthService);}
