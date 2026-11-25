import { Component,OnInit,inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService,mensajeError } from './api.service';
import { AuthService } from './auth';
import { Publicacion,PublicacionInput,Resultado } from './models';
import { Observable } from 'rxjs';
const empty=():PublicacionInput=>({titulo:'',descripcion:'',categoria:'',modalidad:'DONACION'});
@Component({imports:[FormsModule],template:`
<h1>Publicaciones</h1><p>Encuentra artículos o publica uno para donar o intercambiar.</p>
@if(error){<p class="error" role="alert">{{error}}</p>} @if(ok){<p class="success" role="status">{{ok}}</p>}
<section class="panel"><h2>{{editId?'Editar publicación':'Nueva publicación'}}</h2>
<form #f="ngForm" (ngSubmit)="guardar()"><div class="fields">
<label>Título<input name="titulo" [(ngModel)]="form.titulo" required maxlength="150"></label>
<label>Categoría<input name="categoria" [(ngModel)]="form.categoria" required maxlength="80"></label>
<label>Modalidad<select name="modalidad" [(ngModel)]="form.modalidad"><option value="DONACION">Donación</option><option value="INTERCAMBIO">Intercambio</option></select></label></div>
<label>Descripción<textarea name="descripcion" [(ngModel)]="form.descripcion" required maxlength="2000"></textarea></label>
<div class="actions"><button [disabled]="f.invalid||busy">Guardar</button>@if(editId){<button type="button" class="secondary" (click)="limpiar()">Cancelar edición</button>}</div></form></section>
<div class="filter"><label>Buscar<input [(ngModel)]="buscar" placeholder="Título o categoría"></label><label>Estado<select [(ngModel)]="estado"><option value="">Todos</option><option>DISPONIBLE</option><option>RESERVADA</option><option>ENTREGADA</option><option>CANCELADA</option></select></label><button class="secondary" (click)="cargar()">Actualizar</button></div>
<div class="cards">@for(p of filtradas;track p.id){<article class="panel"><span class="state">{{p.estado}}</span><h2>{{p.titulo}}</h2><p>{{p.descripcion}}</p><p class="muted">{{p.categoria}} · {{p.modalidad}} · {{p.propietario}}</p>
@if(p.estado==='DISPONIBLE'){
@if(p.usuarioId===uid){<div class="actions"><button (click)="editar(p)">Editar</button><button class="danger" [disabled]="busy" (click)="cancelar(p.id)">Cancelar publicación</button></div>}
@else {<label>Mensaje de solicitud<textarea [(ngModel)]="mensajes[p.id]" maxlength="1000"></textarea></label><button [disabled]="busy||!mensajes[p.id]?.trim()" (click)="solicitar(p.id)">Solicitar artículo</button>}}
</article>}@empty{<p>No hay publicaciones para mostrar.</p>}</div>`})
export class PublicacionesComponent implements OnInit {
 api=inject(ApiService);auth=inject(AuthService);items:Publicacion[]=[];form=empty();editId?:number;mensajes:Record<number,string>={};buscar='';estado='';error='';ok='';busy=false;
 get uid(){return this.auth.usuario()?.id;}
 get filtradas(){const q=this.buscar.toLowerCase();return this.items.filter(p=>(!this.estado||p.estado===this.estado)&&(p.titulo+' '+p.categoria).toLowerCase().includes(q));}
 ngOnInit(){this.cargar();}
 cargar(){this.api.publicaciones().subscribe({next:r=>this.items=r,error:e=>this.error=mensajeError(e)});}
 editar(p:Publicacion){this.editId=p.id;this.form={titulo:p.titulo,descripcion:p.descripcion,categoria:p.categoria,modalidad:p.modalidad};}
 limpiar(){this.form=empty();this.editId=undefined;}
 guardar(){this.run(this.api.guardarPublicacion(this.form,this.editId),()=>this.limpiar());}
 cancelar(id:number){if(confirm('¿Cancelar esta publicación?'))this.run(this.api.cancelarPublicacion(id));}
 solicitar(id:number){this.run(this.api.solicitar(id,this.mensajes[id]),()=>this.mensajes[id]='');}
 run(op:Observable<Resultado>,after=()=>{}){this.busy=true;this.error='';this.ok='';op.subscribe({next:r=>{this.busy=false;this.ok=r.message;after();this.cargar();},error:e=>{this.busy=false;this.error=mensajeError(e);}});}
}
