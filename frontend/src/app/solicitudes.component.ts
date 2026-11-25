import { Component,OnInit,inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ApiService,mensajeError } from './api.service';
import { AuthService } from './auth';
import { Solicitud,Resultado } from './models';
@Component({imports:[FormsModule],template:`
<h1>Solicitudes</h1><p>Consulta tus solicitudes enviadas y las recibidas en tus publicaciones.</p>
@if(error){<p class="error" role="alert">{{error}}</p>}@if(ok){<p class="success">{{ok}}</p>}
<button class="secondary" (click)="cargar()">Actualizar</button><div class="cards">
@for(s of items;track s.id){<article class="panel"><span class="state">{{s.estado}}</span><h2>{{s.titulo}}</h2><p>Solicitante: {{s.solicitante}}</p><p>{{s.mensaje}}</p><p class="muted">{{s.solicitanteId===uid?'Enviada por ti':s.propietarioId===uid?'Recibida por ti':'Vista administrativa'}}</p>
@if(s.estado==='PENDIENTE'){
@if(s.propietarioId===uid){<div class="actions"><button [disabled]="busy" (click)="decidir(s.id,'aceptar')">Aceptar</button><button class="danger" [disabled]="busy" (click)="decidir(s.id,'rechazar')">Rechazar</button></div>}
@if(s.solicitanteId===uid){<label>Editar mensaje<textarea [(ngModel)]="ediciones[s.id]" maxlength="1000"></textarea></label><div class="actions"><button [disabled]="busy||!ediciones[s.id]?.trim()" (click)="editar(s.id)">Guardar mensaje</button><button class="danger" [disabled]="busy" (click)="cancelar(s.id)">Cancelar solicitud</button></div>}}
</article>}@empty{<p>No hay solicitudes.</p>}</div>`})
export class SolicitudesComponent implements OnInit {
 api=inject(ApiService);auth=inject(AuthService);items:Solicitud[]=[];ediciones:Record<number,string>={};error='';ok='';busy=false;
 get uid(){return this.auth.usuario()?.id;}
 ngOnInit(){this.cargar();}
 cargar(){this.api.solicitudes().subscribe({next:r=>{this.items=r;for(const s of r)this.ediciones[s.id]=s.mensaje;},error:e=>this.error=mensajeError(e)});}
 decidir(id:number,a:'aceptar'|'rechazar'){if(confirm(a==='aceptar'?'¿Aceptar y rechazar las otras solicitudes pendientes?':'¿Rechazar solicitud?'))this.run(this.api.decidir(id,a));}
 editar(id:number){this.run(this.api.editarSolicitud(id,this.ediciones[id]));}
 cancelar(id:number){if(confirm('¿Cancelar solicitud?'))this.run(this.api.cancelarSolicitud(id));}
 run(op:Observable<Resultado>){this.busy=true;this.error='';this.ok='';op.subscribe({next:r=>{this.busy=false;this.ok=r.message;this.cargar();},error:e=>{this.busy=false;this.error=mensajeError(e);}});}
}
