import { variable } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ProductoModel } from '../../models/producto.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {

  // registro = true;
  forma: FormGroup;
  listado: ProductoModel[] = [];
  formulario = false;
  buscar = '';
  page = '1';
  total = 0;
  paginas = 1;
  orden = '';
  loading: boolean;
  producto: ProductoModel = new ProductoModel();

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private router: ActivatedRoute,
    private routers: Router ) {

      console.log(this.page, 'constructor 1');

      this.leerParametros();
      // ---------------------------------------------------------
      this.listadoProducto();
      this.crearFormulario();
    }

  ngOnInit(): void {
  }

  pagAnterior() {
    // tslint:disable-next-line: prefer-const
    // tslint:disable-next-line: radix
    const dato = parseInt(this.page) - 1;
    this.page = dato.toString();
    this.getPage(this.page);
  }

  pagSiguiente() {
    // tslint:disable-next-line: prefer-const
    // tslint:disable-next-line: radix
    const dato = parseInt(this.page) + 1;
    this.page = dato.toString();
    this.getPage(this.page);
  }

  arreglo(n: number) {
    return Array(n);
  }

  leerParametros() {
    this.router.params.subscribe( parametros => {
      console.log('parametro = ', parametros);
      this.page = parametros['pag'];
      if ( parametros['buscar'] ) {
        this.buscar = parametros['buscar'];
        this.getBuscar();
      }

    });
  }

  listadoProducto() {
    this.loading = true;
    console.log('listadoProducto');
    this.auth.getDato('Productos', this.buscar, this.page, this.orden).subscribe(
      resp => {
        this.listado = resp['list'];
        this.total = resp['total'];
        this.paginas = resp['numpages'];
        console.log(resp);
        this.loading = false;
      }
    );
  }

  getPage(pagina: string) {
    console.log('getPage: ' + pagina);
    this.routers.navigateByUrl(`/producto/${pagina}`);
    this.page = pagina;
    this.listadoProducto();
  }

  getBuscar() {
    console.log('getBuscar');
    this.routers.navigateByUrl(`/producto/${ this.buscar }/1`);
    this.listadoProducto();
  }

  vigenteProducto(vigente: boolean): string {
    if ( vigente ) {
      return 'Activado';
    } else {
      return 'Desactivado';
    }
  }

  agregarProducto() {
    this.formulario = true;
    this.producto = new ProductoModel();
  }

  getProducto(Id: string) {
    this.auth.getDatoId('Productos', Id).subscribe( resp => this.producto = resp);
    console.log(this.producto);
  }

  editarProducto(Id: string) {
    this.formulario = true;
    this.auth.getDatoId('Productos', Id).subscribe( resp => {
      this.producto = {
        ...resp,
      };
      console.log(this.producto);
      this.forma = this.fb.group({
      codigo: [this.producto.codigo, [Validators.required, Validators.minLength(5), Validators.maxLength(20)] ],
      nombre: [this.producto.nombre, [Validators.required, Validators.minLength(4), Validators.maxLength(20)] ],
      precio: [this.producto.precio, [Validators.required, Validators.minLength(4),
        Validators.maxLength(20), Validators.pattern('^[0-9]+$')] ],
      vigente: [this.producto.vigente, Validators.required]
      });
    });
  }

  editarVigente(Id: string, point: number) {
    Swal.fire({
      type: 'question',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'cancelar',
      showConfirmButton: true,
      showCancelButton: true,
      html: 'Seguro que quiere realizar este cambio'
    }).then((result) => {
      if ( result.value ) {
        this.auth.getDatoId('Productos', Id).subscribe( resp => {
          this.producto = {
            ...resp,
          };
          console.log(this.producto);
          if ( this.producto.vigente === true ) {
            this.producto.vigente = false;
            this.listado[point].vigente = false;
          } else {
            this.producto.vigente = true;
            this.listado[point].vigente = true;
          }
          this.guardarVigente();
        });
        this.forma.reset();
      }});
  }

  volver() {
    this.formulario = false;
    this.producto = new ProductoModel();
    this.forma.reset();
    this.listadoProducto();
  }

  guardarVigente() {
    console.log('Modificando: ' + this.producto.id);
    this.auth.putDato('Productos', this.producto).subscribe( resp => {
      console.log(resp);
    });
  }

  guardar() {
    console.log(this.forma, 'guardar');

    if ( this.forma.invalid ) {
      return Object.values( this.forma.controls ).forEach( control => {
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
      });
    } else
    {
      console.log(this.forma.value);
      this.producto.codigo = this.forma.value.codigo;
      this.producto.nombre = this.forma.value.nombre;
      this.producto.precio = this.forma.value.precio;
      this.producto.vigente = this.forma.value.vigente;
      console.log(this.producto);
      if ( this.producto.id ) {
        console.log('Modificando: ' + this.producto.id);
        this.auth.putDato('Productos', this.producto).subscribe( resp => {
          console.log(resp);
          this.listadoProducto();
        });

        this.formulario = false;
      } else {
        console.log('Nuevo Producto');
        this.auth.postDato(this.forma.value, 'Productos').subscribe( resp => {
          console.log(resp);
          this.listadoProducto();
        });
        this.formulario = false;
        this.forma.reset();
      }

    }
  }

  convertir() {
    if ( !this.page ) { this.page = '1'; }
    // tslint:disable-next-line: radix
    return parseInt(this.page);
  }

  finalDePaginas(): boolean {
    if ( !this.page ) { this.page = '1'; }
    // tslint:disable-next-line: radix
    if ( parseInt(this.page) === this.paginas) {
      return true;
    } else {return false; }
  }

  inicioDePaginas(): boolean {
    if ( !this.page ) { this.page = '1'; }
    if ( this.page === '1' ) { return true; }
    else { return false; }
  }

  ordenBy(ordenPor: string) {
    this.orden = ordenPor;
    this.listadoProducto();
  }

  // ---------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------

  // tslint:disable-next-line: typedef
  get productos() {
    return this.forma.get('producto') as FormArray;
  }

  // tslint:disable-next-line: typedef
  get codigoNoValido() {
    return this.forma.get('codigo').invalid && this.forma.get('codigo').touched;
  }

  // tslint:disable-next-line: typedef
  get nombreNoValido() {
    return this.forma.get('nombre').invalid && this.forma.get('nombre').touched;
  }

  // tslint:disable-next-line: typedef
  get precioNoValido() {
    return this.forma.get('precio').invalid && this.forma.get('precio').touched;
  }

  // tslint:disable-next-line: typedef
  get vigenteNoValido() {
    return this.forma.get('vigente').invalid && this.forma.get('vigente').touched;
  }

  crearFormulario() {

    this.forma = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(5)] ],
      nombre: ['', [Validators.required, Validators.minLength(4)] ],
      precio: ['', [Validators.required, Validators.minLength(4)] ],
      vigente: [true, Validators.required]
    });
  }

  cargarDataAlFormulario() {
    this.forma.reset({});
  }

}
