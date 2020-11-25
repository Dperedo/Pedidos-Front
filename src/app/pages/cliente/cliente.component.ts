import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ClienteModel } from '../../models/cliente.model';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent implements OnInit {

  // registro = true;
  forma: FormGroup;
  listado: ClienteModel[] = [];
  formulario = false;
  buscar = '';
  page = '1';
  total = 0;
  paginas = 1;
  orden = '';
  // tslint:disable-next-line: new-parens
  cliente: ClienteModel = new ClienteModel();

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private router: ActivatedRoute,
    private routers: Router ) {

      console.log(this.page, 'constructor 1');

      this.leerParametros();
      // ---------------------------------------------------------
      this.listadoCliente();
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
      // tslint:disable-next-line: no-string-literal
      this.page = parametros['pag'];
      // tslint:disable-next-line: no-string-literal
      if ( parametros['buscar'] ) {
        // tslint:disable-next-line: no-string-literal
        this.buscar = parametros['buscar'];
        this.getBuscar();
      }

    });
  }

  listadoCliente() {


    console.log('listadoCliente');
    this.auth.getDato('Clientes', this.buscar, this.page, this.orden).subscribe(
      resp => {
        // tslint:disable-next-line: no-string-literal
        this.listado = resp['list'];
        // tslint:disable-next-line: no-string-literal
        this.total = resp['total'];
        // tslint:disable-next-line: no-string-literal
        this.paginas = resp['numpages'];
        console.log(this.listado);
        console.log(this.total);
        console.log(this.paginas);
      }
    );
  }

  getPage(pagina: string) {
    console.log('getPage: ' + pagina);
    this.routers.navigateByUrl(`/cliente/${pagina}`);
    this.page = pagina;
    this.listadoCliente();
  }

  getBuscar() {
    console.log('getBuscar');
    this.routers.navigateByUrl(`/cliente/${ this.buscar }/1`);
    this.listadoCliente();
  }

  vigenteCliente(vigente: boolean): string {
    if ( vigente ) {
      return 'Activado';
    } else {
      return 'Desactivado';
    }
  }

  agregarCliente() {
    this.formulario = true;
    this.cliente = new ClienteModel();
  }

  getCliente(Id: string) {
    this.auth.getDatoId('Clientes', Id).subscribe( resp => this.cliente = resp);
    console.log(this.cliente);
  }

  editarCliente(Id: string) {
    console.log(this.formulario);
    this.formulario = true;
    this.auth.getDatoId('Clientes', Id).subscribe( resp => {
      this.cliente = {
        ...resp,
      };
      console.log(this.cliente);

      this.forma = this.fb.group({
      rut: [this.cliente.rut, [Validators.required, Validators.minLength(9), Validators.maxLength(20)] ],
      razonSocial: [this.cliente.razonSocial, [Validators.required, Validators.minLength(4), Validators.maxLength(20)] ],
      vigente: [this.cliente.vigente, Validators.required]
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
        this.auth.getDatoId('Clientes', Id).subscribe( resp => {
          this.cliente = {
            ...resp,
          };
          console.log(Id);
          console.log(this.cliente);
          if ( this.cliente.vigente === true ) {
            this.cliente.vigente = false;
            this.listado[point].vigente = false;
          } else {
            this.cliente.vigente = true;
            this.listado[point].vigente = true;
          }
          this.guardarVigente();
        });
        this.forma.reset();
      }});
  }

  volver() {
    this.formulario = false;
    this.cliente = new ClienteModel();
    this.forma.reset();
    this.listadoCliente();
  }

  guardarVigente() {
    console.log('Modificando: ' + this.cliente.id);
    this.auth.putDato('Clientes', this.cliente).subscribe( resp => {
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
      this.cliente.rut = this.forma.value.rut;
      this.cliente.razonSocial = this.forma.value.razonSocial;
      this.cliente.vigente = this.forma.value.vigente;
      /*this.cliente = {
        ...this.forma.value,
      };*/
      console.log(this.cliente);
      if ( this.cliente.id ) {
        console.log('Modificando: ' + this.cliente.id);
        this.auth.putDato('Clientes', this.cliente).subscribe( resp => {
          console.log(resp);
          this.listadoCliente();
        });

        this.formulario = false;
      } else {
        console.log('Nuevo Cliente');
        this.auth.postDato(this.forma.value, 'Clientes').subscribe( resp => {
          console.log(resp);
          this.listadoCliente();
        });
        this.formulario = false;
        this.forma.reset();
      }

    }
  }

  finalDePaginas(): boolean {
    if ( !this.page ) { this.page = '1'; }
    // tslint:disable-next-line: radix
    if (parseInt(this.page) === this.paginas) {
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
    console.log(this.orden);
    this.listadoCliente();
  }


  // ----------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------

  // tslint:disable-next-line: typedef
  get clientes() {
    return this.forma.get('cliente') as FormArray;
  }

  // tslint:disable-next-line: typedef
  get rutNoValido() {
    return this.forma.get('rut').invalid && this.forma.get('rut').touched;
  }

  // tslint:disable-next-line: typedef
  get razonSocialNoValido() {
    return this.forma.get('razonSocial').invalid && this.forma.get('razonSocial').touched;
  }

  // tslint:disable-next-line: typedef
  get vigenteNoValido() {
    return this.forma.get('vigente').invalid && this.forma.get('vigente').touched;
  }

  crearFormulario() {

    this.forma = this.fb.group({
      rut: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(20)] ],
      razonSocial: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)] ],
      vigente: [true, Validators.required]
    });
  }


  cargarDataAlFormulario() {
    this.forma.reset({});
  }



}
