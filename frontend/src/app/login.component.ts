import { Component,inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth';
import { mensajeError } from './api.service';
@Component({imports:[FormsModule],template:`
<section class="panel login"><p class="eyebrow">ECONOMÍA CIRCULAR</p><h1>Iniciar sesión</h1><p>Comparte artículos con tu comunidad educativa.</p>
<form #f="ngForm" (ngSubmit)="entrar()"><label>Correo<input type="email" name="correo" [(ngModel)]="correo" required email autocomplete="username"></label>
<label>Contraseña<input type="password" name="password" [(ngModel)]="password" required minlength="8" autocomplete="current-password"></label>
<button [disabled]="f.invalid||busy">{{busy?'Ingresando…':'Ingresar'}}</button></form>
@if(error){<p class="error" role="alert">{{error}}</p>}
</section>`})
export class LoginComponent {
 private auth=inject(AuthService);private router=inject(Router);
 correo='';password='';error='';busy=false;
 entrar(){this.error='';this.busy=true;this.auth.login(this.correo,this.password).subscribe({next:()=>{this.busy=false;void this.router.navigate(['/publicaciones']);},error:e=>{this.busy=false;this.error=mensajeError(e);}});}
}
