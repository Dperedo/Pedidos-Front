import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ProductoModel } from '../../models/producto.model';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {

  registro = false;
  controlador = 'producto';
  listado: ProductoModel = new ProductoModel();

  constructor(private auth: AuthService) {

  }

  ngOnInit(): void {
  }

  vigenteProducto(vigente: boolean): string {
    if ( vigente ) {
      return 'Activado';
    } else {
      return 'Desactivado';
    }
  }

}
