import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UsuarioModel } from '../models/usuario.model';
import { map } from 'rxjs/operators';
import { ClienteModel } from '../models/cliente.model';
import { ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url = 'https://localhost:5001/api';

  userToken = '';
  page = '';
  buscar = '';
  // tslint:disable-next-line: ban-types
  pageInt = 1;

  constructor( private http: HttpClient,
               private router: ActivatedRoute ) { }

  getQuery( apikey: string ){
    // const url = 'https://localhost:5001/api/Usuarios';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${ apikey }`
    });

    return this.http.get(`${ this.url }/Usuarios/auth`, { headers });
  }

  getCliente(){
    // const url = 'https://localhost:5001/api/Usuarios';
    this.userToken = this.leerToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${ this.userToken }`
    });
    console.log('Dentro de getCliente');
    return this.http.get(`${ this.url }/Clientes`).pipe(map((res: any) => res));
  }

  postCliente(cliente: ClienteModel){
    const Data = {
      ...cliente,
    };
    this.userToken = this.leerToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${ this.userToken }`
    });
    console.log('Dentro de postCliente');
    console.log(Data);
    return this.http.post(`${ this.url }/Clientes`, Data).pipe(map((res: any) => res));
  }

  putCliente(cliente: ClienteModel){
    const Data = {
      ...cliente,
    };
    this.userToken = this.leerToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${ this.userToken }`
    });
    console.log('Dentro de pustCliente');
    console.log(Data);
    return this.http.put(`${ this.url }/Clientes/${ Data.id }`, Data).pipe(map((res: any) => res));
  }

  // ----------------------------------------------------------------------------------------------------------

  getDato33(controlador: string) {
    this.userToken = this.leerToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${ this.userToken }`
    });
    console.log('Dentro de getDato');
    return this.http.get(`${ this.url }/${ controlador }`).pipe(map((res: any) => res ));
  }

  getDato(controlador: string, buscar: string, page: string) {
    this.userToken = this.leerToken();

    if ( !page ) {
      page = '';
    }

    // tslint:disable-next-line: radix
    console.log('Primer paso');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${ this.userToken }`
    });
    console.log('page=' + page, 'buscar=' + buscar);
    console.log('Dentro de getDatoBuscar');

    return this.http.get(`${ this.url }/${ controlador }/query?texto=${ buscar }&page=${ page }`).pipe(map((res: any) => res ));
  }

  
/*

take = cuantos registros por página
page = la pagina que quiero ver

---
backend:
if take == null o invalido entonces take = 10
if page es inválido entonces = 1

skip = (page - 1) * take

*/

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
    return this.http.post(`${ this.url }/${ controlador }`, Data).pipe(map((res: any) => res));
  }

  putDato(Datos: any, controlador: string){
    const Data = {
      ...Datos,
    };
    this.userToken = this.leerToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${ this.userToken }`
    });
    console.log('Dentro de putDato');
    console.log(Data);
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
    // console.log('estaAutenticado');
    if ( this.userToken.length < 2 ) {
      return false;
    }
    // console.log('estaAutenticado2');
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

}
