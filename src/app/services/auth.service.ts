import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UsuarioModel } from '../models/usuario.model';
import { catchError, map } from 'rxjs/operators';
import { ClienteModel } from '../models/cliente.model';
import { ActivatedRoute, Router } from '@angular/router';

import configuracion from '../../../tsconfig.json';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

   private url = 'https://localhost:5001/api';
  //private url = 'https://app-pedidos.azurewebsites.net/backapp/api';
  // private url = configuracion['url'];
  // console.log(configuracion);

  userToken = '';
  page = '';
  buscar = '';
  handleError: any;
  respuesta = true;
  // tslint:disable-next-line: ban-types
  pageInt = 1;

  constructor( private http: HttpClient,
               private router: ActivatedRoute,
               private ruta: Router
                ) { }

  getQuery( apikey: string ){
    // const url = 'https://localhost:5001/api/Usuarios';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${ apikey }`
    });

    return this.http.get(`${ this.url }/Usuarios/auth`, { headers });
  }

  getSelector(controlador: string){
    // const url = 'https://localhost:5001/api/Usuarios';
    this.userToken = this.leerToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${ this.userToken }`
    });
    console.log('Dentro de getEstado');
    return this.http.get(`${ this.url }/${ controlador }`, { headers }).pipe(map((res: any) => res));
  }

  // ----------------------------------------------------------------------------------------------------------


  getDato(controlador: string, buscar: string, page: string, orden: string) {
    this.userToken = this.leerToken();

    if ( !page ) {
      page = '';
    }

    // tslint:disable-next-line: radix
    console.log('Primer paso');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${ this.userToken }`
    });
    console.log('page=' + page, 'buscar=' + buscar, 'orden=' + orden);
    console.log('Dentro de getDatoBuscar');

    this.PuedeActivarse();

    return this.http.get(`${ this.url }/${ controlador }/query?texto=${ buscar }&page=${ page }&order=${ orden }`, { headers })
      .pipe(map((res: any) => res ));
  }
  
  getDatoId(controlador: string, ID: string) {
    this.userToken = this.leerToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${ this.userToken }`
    });
    console.log('ID=' + ID);
    console.log('Dentro de getDatoId');

    this.PuedeActivarse();

    return this.http.get(`${ this.url }/${ controlador }/${ ID }`).pipe(map((res: any) => res ));
  }

  postDato(Datos: any, controlador: string){
    const Data = {
      ...Datos,
    };
    this.userToken = this.leerToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${ this.userToken }`
    });
    console.log('Dentro de postDato');
    console.log(Data);

    // this.PuedeActivarse();

    return this.http.post(`${ this.url }/${ controlador }`, Data).pipe(map((res: any) => res));
  }

  putDato(controlador: string, Datos: any){
    const Data = {
      ...Datos,
    };
    this.userToken = this.leerToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${ this.userToken }`
    });
    console.log('Dentro de putDato');
    console.log(Data);

    // this.PuedeActivarse();

    return this.http.put(`${ this.url }/${ controlador }/${ Data.id }`, Data).pipe(map((res: any) => res));
  }

  // ----------------------------------------------------------------------------------------------------------

  login( usuario: UsuarioModel ) {
    const authData = {
      ...usuario,
      returnSecureToken: true
    };
    console.log(authData);
    return this.http.post(
      `${ this.url }/Usuarios/auth`,
      authData
    ).pipe(
      map( resp => {
        this.guardarToken( resp['token'] );
        return resp;
      }));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('expira');
  }

  private guardarToken( idToken: string ) {
    this.userToken = idToken;

    localStorage.setItem('token', idToken);

    let hoy = new Date();
    hoy.setSeconds( 3600 );

    localStorage.setItem('expira', hoy.getTime().toString() );
  }

  leerToken() {

    if ( localStorage.getItem('token') ) {

      this.userToken = localStorage.getItem('token');
    } else {
      this.userToken = '';
    }

    return this.userToken;
  }

  estaAutenticado(): boolean {
    this.leerToken();
    console.log('estaAutenticado');
    if ( this.userToken.length < 2 ) {
      return false;
    }
    this.estadoDelToken()
    //--
    
    //--
    if ( this.respuesta === false ) {
      console.log('respuesta: '+ this.respuesta);
      return false;
    }
    console.log(this.respuesta);
    console.log('estaAutenticado2');
    const expira = Number(localStorage.getItem('expira'));

    // console.log('Expira: ' + expira);

    const expiraDate = new Date();
    expiraDate.setTime(expira);

    if ( expiraDate > new Date() ) {
      return true;
    } else {
      return false;
    }
    // return this.userToken.length > 2;
  }

  estadoDelToken() {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${ this.userToken }`
    });
    console.log('123');
    this.http.get(`${ this.url }/usuarios`, { headers, observe: 'response' })
    .subscribe(response => {
      console.log('suscrito');
      console.log(response.status);
      // if ( !(response.status >= 200 || response.status <= 299) ){
      //   console.log(response.status + 'hola');
      //   this.respuesta = false;
      // }
    },
    err => {
      console.log('HTTP Error', err.status);
      this.ruta.navigateByUrl('/login');
      this.logout();
    });
    console.log('fuera del suscrito ' + this.respuesta);
    
  }

  PuedeActivarse(): boolean {
    if ( this.estaAutenticado() ) {
      console.log('ok');
      return true;
    } else {
      console.log('no ok');
      this.ruta.navigateByUrl('/login');
      this.logout();
      return false;
    }
  }

}



/*

- cambiar el login-
- modificar el diseño de las paginas-
- agregar las animaciones-
- agregar las autencicaciones en los botones-
- cambiar la fecha de la expiracion del token en el backend-
agregar una configuracion para el token
- crear una funcion para poder modificar la expiracion del token a nivel usuario

*/
