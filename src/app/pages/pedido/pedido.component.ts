import { Component, OnInit } from '@angular/core';
import { PedidoModel } from '../../models/pedido.model';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { EstadoModel } from '../../models/estado.model';
import { ClienteModel } from '../../models/cliente.model';
import { ProductoModel } from '../../models/producto.model';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.css']
})
export class PedidoComponent implements OnInit {

  forma: FormGroup;
  addressForm: FormGroup;
  addresses: FormArray;
  listado: PedidoModel[] = [];
  formulario = false;
  fechaMax = '';
  fechaMin = '';
  buscar = '';
  page = '1';
  total = 0;
  paginas = 1;
  orden = '';
  neto = 0;
  pedido: PedidoModel = new PedidoModel();
  estados: EstadoModel[] = [];
  clientes: ClienteModel[] = [];
  datoProducto: ProductoModel[] = [];
  productos: ProductoModel[] = [];
  productoDatos: ProductoModel[] = [];

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private router: ActivatedRoute,
    private routers: Router) {
      console.log(this.page, 'constructor pedidos');
      this.leerParametros();
      this.listadoPedido();
      this.crearFormulario();
      this.estadoPedido();
      this.productoPedido();
      this.clientePedido();
      this.otroFormulario();

    }

  ngOnInit(): void {
  }

  otroFormulario() {
    this.addressForm = this.fb.group({
      algo: ['', [Validators.required] ],
      addresses: this.fb.array([ this.createAddress() ])
    });
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

  listadoPedido() {

    console.log('listadoPedido');
    this.auth.getDato('Pedidos', this.buscar, this.page, this.orden).subscribe(
      resp => {
        this.listado = resp['list'];
        this.total = resp['total'];
        this.paginas = resp['numpages'];
        console.log(resp);
      }
    );
  }

  estadoPedido() {
    console.log('estadoPedido');
    this.auth.getSelector('Estados').subscribe(
      resp => {
        this.estados = resp;
        console.log(resp);
      }
    );
  }

  productoPedido() {
    console.log('productoPedido');
    this.auth.getSelector('Productos').subscribe(
      resp => {
        this.productos = resp;
        console.log(resp);
      }
    );
  }

  clientePedido() {
    console.log('clientePedido');
    this.auth.getSelector('Clientes').subscribe(
      resp => {
        this.clientes = resp;
        console.log(resp);
      }
    );
  }

  getPage(pagina: string) {
    console.log('getPage: ' + pagina);
    this.routers.navigateByUrl(`/pedido/${pagina}`);
    this.page = pagina;
    this.listadoPedido();
  }

  getBuscar() {
    console.log('getBuscar');
    this.routers.navigateByUrl(`/pedido/${ this.buscar }/1`);
    this.listadoPedido();
  }

  agregarPedido() {
    this.formulario = true;
    this.pedido = new PedidoModel();
  }

  getPedido(Id: string) {
    this.auth.getDatoId('Pedidos', Id).subscribe( resp => this.pedido = resp);
    console.log(this.pedido);
  }

  // -------------------------
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
    this.listadoPedido();
  }

  cancelar(Id: string, point: number) {
    this.auth.getDatoId('Pedidos', Id).subscribe( resp => {
      this.pedido = {
        ...resp,
      };
      console.log(Id);
      console.log(this.pedido);
      if ( this.pedido.estado.estadoPedido !== 'Cancelado') {

      }
    });
  }

  agregarProducto() {
    console.log('hola2');
    this.productosForm.push( this.fb.control('') );
    console.log(this.datoProducto);
  }

  borrarProducto(i: number) {
    this.productosForm.removeAt(i);
    console.log(i, this.productosForm.value[i]);
  }

  selectProducto(id: string, i: number)
  {
    console.log(this.productosForm.value[i]);
    this.auth.getDatoId('Productos', this.productosForm.value[i].id).subscribe( resp => {
      this.productosForm.value[i] = {
        ...resp,
      };
      // this.forma = this.fb.group({
      // });
      console.log(this.productosForm.value[i]);
    });
    console.log('Aquí viene');
    console.log(id);
    console.log('Prueba: ' + id);
    console.log(this.datoProducto);
  }

  updateSubtotal(cant: number, i: number)
  {
    console.log('Precio: ' + this.productosForm.value[i].precio);
    this.productosForm.value[i].subtotal = this.productosForm.value[i].precio * cant;
  }

    // ---------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------

  // tslint:disable-next-line: typedef
  get productosForm() {
    return this.forma.get('productosForm') as FormArray;
  }

  // tslint:disable-next-line: typedef
  get cantidadForm() {
    return this.forma.get('cantidadForm') as FormArray;
  }

  // tslint:disable-next-line: typedef
  get clienteNoValido() {
    return this.forma.get('cliente').invalid && this.forma.get('cliente').touched;
  }

  // tslint:disable-next-line: typedef
  get observacionesNoValido() {
    return this.forma.get('observaciones').invalid && this.forma.get('observaciones').touched;
  }

  // tslint:disable-next-line: typedef
  get valorNoValido() {
    return this.forma.get('productosForm.valor').invalid;
  }

  // tslint:disable-next-line: typedef
  get cantidadNoValido() {
    return this.forma.get('cantidad').invalid && this.forma.get('cantidad').touched;
  }

  crearFormulario() {

    this.forma = this.fb.group({
      cliente: ['', [Validators.required] ],
      observaciones: ['', [Validators.required, Validators.minLength(5)] ],
      cantidad: [''],
      productosForm: this.fb.array([
        // this.cantidadForm: this.fb.array([])
      ])
    });
    this.productosForm.push( this.fb.control('') );
  }


  // createAddress(): FormGroup {
  //   return this.fb.group({
  //     product: '',
  //     cantidad: ''
  //   });
  // }

  // addAddress(): void {
  //   this.addresses = this.addressForm.get('addresses') as FormArray;
  //   this.addresses.push(this.createAddress());
  // }

  /*nuevoProducto() {
    let control = <FormArray>this.forma.controls.productosForm;
    control.push(
      this.fb.group({
        cantidad: [''],
        product: this.fb.array([])
      })
    );
  }*/

  cargarDataAlFormulario() {
    this.forma.reset({});
  }


// ------------------------------------------------------------

get addressControls() {
  return this.addressForm.get('addresses')['controls'];
}

createAddress(): FormGroup {
  return this.fb.group({
    address: '',
    street: '',
    city: '',
    country: ''
  });
}

addAddress(): void {
  this.addresses = this.addressForm.get('addresses') as FormArray;
  this.addresses.push(this.createAddress());
}

removeAddress(i: number) {
  this.addresses.removeAt(i);
}

logValue() {
  console.log(this.addresses.value);
}
}
