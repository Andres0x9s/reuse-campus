import { Routes } from '@angular/router';
import { authGuard,adminGuard } from './auth';
import { LoginComponent } from './login.component';
import { PublicacionesComponent } from './publicaciones.component';
import { SolicitudesComponent } from './solicitudes.component';
import { EntregasComponent } from './entregas.component';
import { UsuariosComponent } from './usuarios.component';
export const routes:Routes=[
 {path:'login',component:LoginComponent},
 {path:'publicaciones',component:PublicacionesComponent,canActivate:[authGuard]},
 {path:'solicitudes',component:SolicitudesComponent,canActivate:[authGuard]},
 {path:'entregas',component:EntregasComponent,canActivate:[authGuard]},
 {path:'usuarios',component:UsuariosComponent,canActivate:[adminGuard]},
 {path:'',pathMatch:'full',redirectTo:'publicaciones'},
 {path:'**',redirectTo:'publicaciones'}
];
