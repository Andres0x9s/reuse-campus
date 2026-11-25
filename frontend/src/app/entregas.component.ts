import { Component,OnInit,inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService,mensajeError } from './api.service';
import { AuthService } from './auth';
import { Entrega } from './models';
@Component({imports:[DatePipe],template:`
<h1>Entregas e intercambios</h1><p>Historial de acuerdos y artículos entregados.</p>
@if(error){<p class="error" role="alert">{{error}}</p>}@if(ok){<p class="success">{{ok}}</p>}
<button class="secondary" (click)="cargar()">Actualizar</button><div class="cards">
@for(e of items;track e.id){<article class="panel"><span class="state">{{e.estado}}</span><h2>{{e.titulo}}</h2><p>Receptor: {{e.receptor}}</p><p>Acuerdo: {{e.fechaAcuerdo|date:'dd/MM/yyyy HH:mm'}}</p><p>Entrega: {{e.fechaEntrega?(e.fechaEntrega|date:'dd/MM/yyyy HH:mm'):'Por confirmar'}}</p>
@if(e.estado==='PENDIENTE'&&e.propietarioId===auth.usuario()?.id){<button [disabled]="busy" (click)="completar(e.id)">Confirmar entrega</button>}
</article>}@empty{<p>No hay entregas.</p>}</div>`})
export class EntregasComponent implements OnInit {
 api=inject(ApiService);auth=inject(AuthService);items:Entrega[]=[];error='';ok='';busy=false;
 ngOnInit(){this.cargar();}
 cargar(){this.api.entregas().subscribe({next:r=>this.items=r,error:e=>this.error=mensajeError(e)});}
 completar(id:number){if(!confirm('¿Confirmar que se entregó el artículo?'))return;this.busy=true;this.ok='';this.error='';this.api.completar(id).subscribe({next:r=>{this.busy=false;this.ok=r.message;this.cargar();},error:e=>{this.busy=false;this.error=mensajeError(e);}});}
}
