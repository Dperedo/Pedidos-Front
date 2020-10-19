import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styles: [
  ]
})
export class NavbarComponent implements OnInit {

  constructor(private auth: AuthService, private router: Router ) { }

  ngOnInit(): void {
  }

  salir() {
    Swal.fire({
      type: 'question',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'cancelar',
      showConfirmButton: true,
      showCancelButton: true,
      html: 'Seguro que quiere cerrar sesión'
    }).then((result) => {
    if ( result.value ) {
      this.auth.logout();
      this.router.navigateByUrl('/login');
      return;
    }
    });
    return;
  }

}
