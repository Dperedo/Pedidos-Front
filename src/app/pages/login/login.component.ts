import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UsuarioModel } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';

import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthGuard } from '../../guards/auth.guard';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  usuario: UsuarioModel = new UsuarioModel();
  recordarme = false;
  token = '';

  constructor( 
    private auth: AuthService,
    private router: Router,
    private http: HttpClient,
    private guard: AuthGuard ) {
    console.log('hola1');
    console.log(this.guard.canActivate());
    if ( localStorage.getItem('token') && this.guard.canActivate() ) {
      console.log('hola2');
      // this.guard.canActivate();
      this.router.navigateByUrl('/pedido');
    }
    // this.ngOnInit();
  }

  ngOnInit() {
    if ( localStorage.getItem('username') ) {
      console.log("hey");
      this.usuario.username =  localStorage.getItem('username');
      this.recordarme = true;
    }
  }

  login( form: NgForm) {

    if ( form.invalid ) { return; }

    console.log(this.usuario);
    // console.log(form);
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      html: 'Espere por favor...'
    });
    Swal.showLoading();
    this.auth.login( this.usuario )
    .subscribe( resp => {
      Swal.close();
      if ( this.recordarme ) {
        localStorage.setItem('username', this.usuario.username);
      }
      this.router.navigateByUrl('/pedido');
      console.log(resp);
    }, (err) => {
      Swal.close();

      Swal.fire({
        type: 'error',
        title: 'Error al autenticar',
        html: 'Usuario y/o contraseña son incorrectos'
      });
    },
    );
  }

}
