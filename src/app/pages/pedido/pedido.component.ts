import { Component, OnInit } from '@angular/core';
import { PedidoModel } from '../../models/pedido.model';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { EstadoModel } from '../../models/estado.model';
import { ClienteModel } from '../../models/cliente.model';
import { ProductoModel } from '../../models/producto.model';
import { useAnimation } from '@angular/animations';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.css']
})
export class PedidoComponent implements OnInit {

  listaDetalle: any[] = [];
  forma: FormGroup;
  detallePedidos: FormArray;
  listado: PedidoModel[] = [];
  formulario = false;
  editar = false;
  fechaMax = '';
  fechaMin = '';
  buscar = '';
  page = '1';
  total = 0;
  paginas = 1;
  orden = '';
  neto = 0;
  iva = 0;
  totalvalor = 0;
  subtotal = [];
  pedido: PedidoModel = new PedidoModel();
  estados: EstadoModel[] = [];
  clientes: ClienteModel[] = [];
  datoProducto: ProductoModel[] = [];
  productoslistado: ProductoModel[] = [];
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

    }

  ngOnInit(): void {
  }

  calcularTotal()
  {
    // this.extraerProducto(i);
    console.log('calcularTotal');
    this.neto = 0;
    this.forma.value.detallePedidos.forEach( linea => {
      if ( !isNaN(linea.producto.precio) && !isNaN(linea.cantidad) ) {
        console.log(linea.producto.precio);
        console.log(linea.cantidad);
        this.neto = this.neto + (linea.producto.precio * linea.cantidad);
    }
      console.log(linea.producto.precio);
      console.log(linea.cantidad);
      console.log('wow ' + this.neto);
    });
    this.iva = this.neto * 0.19;
    this.totalvalor = this.neto + this.iva;
  }

  calcularTotales()
  {
    this.neto = 0;
    this.subtotal.forEach( valor => {
      this.neto = this.neto + valor;
      console.log('wow ' + this.neto);
    });
    this.iva = this.neto * 0.19;
    this.totalvalor = this.neto + this.iva;
  }
  
  extraerProducto(i: number) {
    if (typeof this.forma.value.detallePedidos[i].producto === 'string') {
      console.log('hola');
    
      this.auth.getDatoId('Productos', this.forma.value.detallePedidos[i].producto).subscribe( resp => {
        this.forma.value.detallePedidos[i].producto = {
          ...resp,
        };
        console.log(this.forma.value.detallePedidos[i].producto);
      });
    }
  }

  otraFuncion(i: number) {
    this.auth.getDatoId('Productos', this.forma.value.detallePedidos[i].producto).subscribe( resp => {
      this.forma.value.detallePedidos[i].producto = {
        ...resp,
      };
      console.log(this.forma.value.detallePedidos[i].producto);
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
        this.productoslistado = resp;
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

  volver() {
    this.formulario = false;
    this.editar = false;
    this.forma.reset();
    this.listadoPedido();
    /*let eliminar = this.detallePedidos.length;
    for (let i = 0; i < eliminar; i++) {
      this.borrarProducto(0);
    }*/
    this.crearFormulario();
    console.log(this.forma.value);
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
    this.detallePedidos.push( this.fb.control('') );
    console.log(this.datoProducto);
  }

  borrarProducto(i: number) {
    this.detallePedidos.removeAt(i);
    console.log(i, this.detallePedidos.value[i]);
  }

  selectProducto(id: string, i: number)
  {
    console.log(this.detallePedidos.value[i]);
    this.auth.getDatoId('Productos', this.detallePedidos.value[i].id).subscribe( resp => {
      this.detallePedidos.value[i] = {
        ...resp,
      };
      // this.forma = this.fb.group({
      // });
      console.log(this.detallePedidos.value[i]);
    });
    console.log('Aquí viene');
    console.log(id);
    console.log('Prueba: ' + id);
    console.log(this.datoProducto);
  }

  tablaSubtotal(i: number) {
    // console.log(this.forma.value.productosForm[i].producto.precio);
    // console.log(this.forma.value.productosForm[i].cantidad);
    if (this.forma.value.detallePedidos[i].producto.precio === undefined ||
    this.forma.value.detallePedidos[i].cantidad === '')
    {
      this.subtotal[i] = 0;
      // console.log('true');
    } else {
      this.subtotal[i] = this.forma.value.detallePedidos[i].producto.precio * this.forma.value.detallePedidos[i].cantidad;
      // console.log('false');
    }
    if (this.subtotal[i] === isNaN) { this.subtotal[i] = 0; }
    // console.log('valor es: ' + this.subtotal[i]);
    return this.subtotal[i];
  }

  valorNeto() {
    this.neto = 0;
    console.log('hola: ' + this.subtotal);
    this.subtotal.forEach( valor => {
      this.neto = this.neto + valor;
      console.log('wow ' + this.neto);
    });
    return this.neto;
  }

  valorIva() {
    this.iva = this.neto * (19 / 100);
    return this.iva;
  }

  valorTotal() {
    this.totalvalor = this.neto - this.iva;
    return this.totalvalor;
  }

  buscarEstado(nombre: string) {
    let obj = this.estados.filter(e => e.estadoPedido == nombre);
    return obj;
  }

  seleccionarProducto(productoSelect: ProductoModel, i: number) {

    console.log('producto seleccionado: ' + productoSelect);

    this.forma.value.detallePedidos[i].producto = productoSelect;
  }

  editarPedido(Id: string) {
    console.log(this.formulario);
    this.formulario = true;
    this.editar = true;
    let cont = 0;
    this.auth.getDatoId('Pedidos', Id).subscribe( resp => {
      this.pedido = {
        ...resp,
      }
      
      console.log(this.pedido);

      this.forma.value.detallePedidos = this.pedido.detallePedidos;
      console.log(this.forma.value.detallePedidos);

      this.forma = this.fb.group({
        cliente: [this.pedido.cliente, [Validators.required] ],
        estado: [this.pedido.estado],
        observaciones: [this.pedido.observaciones, [Validators.required, Validators.minLength(3)] ],
        detallePedidos: this.fb.array([  ])
      });
      this.forma.value.detallePedidos = this.pedido.detallePedidos;

      this.detallePedidos = this.forma.get('detallePedidos') as FormArray;

      for (let i = 0; i < this.pedido.detallePedidos.length; i++) {
        
        this.detallePedidos.push(this.agregarEditarDetalle(this.pedido.detallePedidos[i]));
        console.log( this.forma.value.detallePedidos[i].producto);
      }

      console.log(this.forma.value.detallePedidos);
      this.calcularTotal();

    });
  }

  agregarEditarDetalle(detalle: any): FormGroup {
    // console.log('agregarEditarDetalle: ' + this.pedido.detallePedidos[i].producto);
    console.log('cliente: ' + this.pedido.cliente);
    return this.fb.group({
      producto: [detalle.producto, [Validators.required] ],
      cantidad: [detalle.cantidad, [Validators.required, Validators.minLength(1), Validators.maxLength(7),Validators.min(1) , Validators.pattern('^[0-9]+$')]]
    });
  }

  editarProducto(i: number) {

    return this.fb.group({
      producto: [ this.pedido.detallePedidos[i].producto, [Validators.required] ],
      cantidad: [ this.pedido.detallePedidos[i].cantidad, [Validators.required, Validators.minLength(1), Validators.maxLength(7),Validators.min(1) , Validators.pattern('^[0-9]+$')]]
    });
  }

  cargarDetallePedidos(): any {

     
     this.forma.value.detallePedidos.forEach( detalle => { 
      console.log('detalle: ' + detalle.producto); 

        this.listaDetalle.push(this.fb.group({
          producto: [ detalle.producto, [Validators.required] ],
          cantidad: [ detalle.cantidad,
             [Validators.required, Validators.minLength(1), Validators.maxLength(7), Validators.pattern('^[0-9]+$')]]
          }));
       
    });
  }

  guardar() {

    if ( this.forma.invalid ) {
      return Object.values( this.forma.controls ).forEach( control => {
        if ( control instanceof FormGroup ) {
          Object.values( control.controls ).forEach( control => control.markAsTouched() );
        } else {
          control.markAsTouched();
        }
      });
    } else {
      console.log(this.forma.value);
      this.pedido.cliente = this.forma.value.cliente;
      this.pedido.observaciones = this.forma.value.observaciones;
      this.pedido.total = this.totalvalor;
      this.pedido.detallePedidos = this.forma.value.detallePedidos;
      console.log(this.pedido);
      if ( this.pedido.id ) {
        this.pedido.estado = this.forma.value.estado;
        console.log('Modificando: ' + this.pedido.id);
        this.auth.putDato('Pedidos', this.pedido).subscribe( resp => {
          console.log(resp);
          this.listadoPedido();
        });
        this.formulario = false;
        this.editar = false;
        this.forma.reset();
      } else {
        console.log('Nuevo Pedido');
        this.pedido.estado = this.estados[0];
        console.log(this.pedido);
        this.auth.postDato(this.pedido, 'Pedidos').subscribe( resp => {
          console.log(resp);
          this.listadoPedido();
        });
        this.formulario = false;
        this.forma.reset();
      }
    }
  }

    // ---------------------------------------------------------------------------------
  // ---------------------------------------------------------------------------------

  // tslint:disable-next-line: typedef
  get clienteNoValido() {
    return this.forma.get('cliente').invalid && this.forma.get('cliente').touched;
  }

  // tslint:disable-next-line: typedef
  get estadoNoValido() {
    return this.forma.get('estado').invalid && this.forma.get('estado').touched;
  }

  // tslint:disable-next-line: typedef
  get observacionesNoValido() {
    return this.forma.get('observaciones').invalid && this.forma.get('observaciones').touched;
  }

  get detallePedidosControls() {
    return this.forma.get('detallePedidos')['controls'];
  }

  getValidarCantidad(i) {

    return (<FormArray>this.forma.get('detallePedidos')).controls[i].get('cantidad').invalid &&
    (<FormArray>this.forma.get('detallePedidos')).controls[i].get('cantidad').touched;
  }

  getValidarProducto(i) {

    return (<FormArray>this.forma.get('detallePedidos')).controls[i].get('producto').invalid &&
    (<FormArray>this.forma.get('detallePedidos')).controls[i].get('producto').touched;
  }

  crearFormulario() {

    this.forma = this.fb.group({
      cliente: ['', [Validators.required] ],
      estado: [''],
      observaciones: ['', [Validators.required, Validators.minLength(3)] ],
      detallePedidos: this.fb.array([ this.createProducto()
      ])
    });
    console.log(this.forma.value);
  }


  createProducto(): FormGroup {
    return this.fb.group({
      producto: ['', [Validators.required] ],
      cantidad: [ 0, [Validators.required, Validators.minLength(1), Validators.maxLength(7),Validators.min(1) , Validators.pattern('^[0-9]+$')]]
    });
  }

  addProducto(): void {
    this.detallePedidos = this.forma.get('detallePedidos') as FormArray;
    this.detallePedidos.push(this.createProducto());
  }

  cargarDataAlFormulario() {
    this.forma.reset({});
  }


// ------------------------------------------------------------


}
