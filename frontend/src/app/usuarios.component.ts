import { Component,OnInit,inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService,mensajeError } from './api.service';
import { AuthService } from './auth';
import { Usuario,UsuarioInput,Resultado } from './models';
import { Observable } from 'rxjs';
const empty=():UsuarioInput=>({nombre:'',correo:'',password:'',rol:'USUARIO',estado:'ACTIVO'});
@Component({imports:[FormsModule],template:`
<h1>Administración de usuarios</h1><p>Gestiona cuentas y roles. Las cuentas se desactivan sin borrar su historial.</p>
@if(error){<p class="error" role="alert">{{error}}</p>}@if(ok){<p class="success">{{ok}}</p>}
<section class="panel"><h2>{{editId?'Editar cuenta':'Crear cuenta'}}</h2><form #f="ngForm" (ngSubmit)="guardar()"><div class="fields">
<label>Nombre<input name="nombre" [(ngModel)]="form.nombre" required maxlength="100"></label><label>Correo<input name="correo" type="email" email [(ngModel)]="form.correo" required maxlength="150"></label>
<label>{{editId?'Nueva clave (opcional)':'Contraseña'}}<input name="password" type="password" [(ngModel)]="form.password" [required]="!editId" minlength="8" autocomplete="new-password"></label>
<label>Rol<select name="rol" [(ngModel)]="form.rol"><option>USUARIO</option><option>ADMINISTRADOR</option></select></label>
@if(editId){<label>Estado<select name="estado" [(ngModel)]="form.estado"><option>ACTIVO</option><option>INACTIVO</option></select></label>}
</div><div class="actions"><button [disabled]="busy||f.invalid">Guardar</button>@if(editId){<button type="button" class="secondary" (click)="limpiar()">Cancelar edición</button>}</div></form></section>
<div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
@for(u of items;track u.id){<tr><td>{{u.nombre}}</td><td>{{u.correo}}</td><td>{{u.rol}}</td><td>{{u.estado}}</td><td><div class="actions"><button (click)="editar(u)">Editar</button>@if(u.estado==='ACTIVO'&&u.id!==auth.usuario()?.id){<button class="danger" [disabled]="busy" (click)="desactivar(u.id)">Desactivar</button>}</div></td></tr>}
</tbody></table></div>`})
export class UsuariosComponent implements OnInit {
 api=inject(ApiService);auth=inject(AuthService);items:Usuario[]=[];form=empty();editId?:number;error='';ok='';busy=false;
 ngOnInit(){this.cargar();}
 cargar(){this.api.usuarios().subscribe({next:r=>this.items=r,error:e=>this.error=mensajeError(e)});}
 editar(u:Usuario){this.editId=u.id;this.form={nombre:u.nombre,correo:u.correo,password:'',rol:u.rol,estado:u.estado};}
 limpiar(){this.editId=undefined;this.form=empty();}
 guardar(){this.run(this.api.guardarUsuario(this.form,this.editId),()=>this.limpiar());}
 desactivar(id:number){if(confirm('¿Desactivar cuenta?'))this.run(this.api.desactivar(id));}
 run(op:Observable<Resultado>,after=()=>{}){this.busy=true;this.ok='';this.error='';op.subscribe({next:r=>{this.busy=false;this.ok=r.message;after();this.cargar();},error:e=>{this.busy=false;this.error=mensajeError(e);}});}
}
