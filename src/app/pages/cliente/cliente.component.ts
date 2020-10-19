import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ClienteModel } from '../../models/cliente.model';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent implements OnInit {

  registro = true;
  forma: FormGroup;
  listado: ClienteModel[] = [];
  formulario = false;
  buscar = '';
  page = '';
  pages = ['1', '2', '3'];
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

  listadoCliente() {


    console.log('listadoCliente');
    this.auth.getDato('Clientes', this.buscar, this.page).subscribe(
      resp => {
        this.listado = resp;
        console.log(this.listado);
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
    // if ( this.buscar.length === 0 ) {
    //   return;
    // }
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

  editarCliente(cliente: ClienteModel) {
    this.formulario = true;
    this.cliente = cliente;
    console.log(this.cliente);
    this.forma = this.fb.group({
      rut: [this.cliente.rut, [Validators.required, Validators.minLength(10)] ],
      razonSocial: [this.cliente.razonSocial, [Validators.required, Validators.minLength(4)] ],
      vigente: [this.cliente.vigente, Validators.required]
    });
  }

  editarVigente(cliente: ClienteModel) {
    this.cliente = cliente;
    console.log(this.cliente);
    if ( this.cliente.vigente === true ) {
      this.cliente.vigente = false;
    } else {
      this.cliente.vigente = true;
    }
    this.guardarVigente();
    this.forma.reset();
  }

  volver() {
    this.formulario = false;
    this.cliente = new ClienteModel();
    this.forma.reset();
    this.listadoCliente();
  }

  guardarVigente() {
    console.log('Modificando: ' + this.cliente.id);
    this.auth.putDato(this.cliente, 'Clientes').subscribe( resp => {
      console.log(resp);
      this.listadoCliente();
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
      console.log(this.cliente);
      if ( this.cliente.id ) {
        console.log('Modificando: ' + this.cliente.id);
        this.auth.putDato(this.cliente, 'Clientes').subscribe( resp => {
          console.log(resp);
          this.listadoCliente();
        });

        this.formulario = false;
      } else {
        console.log('Nuevo Cliente');
        this.auth.postDato(this.forma.value, 'Clientes').subscribe( resp => {
          console.log(resp)
          this.listadoCliente();
        });
        this.formulario = false;
        this.forma.reset();
      }

    }
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
      rut: ['', [Validators.required, Validators.minLength(10)] ],
      razonSocial: ['', [Validators.required, Validators.minLength(4)] ],
      vigente: [true, Validators.required]
    });
  }


  cargarDataAlFormulario() {
    this.forma.reset({});
  }



}
