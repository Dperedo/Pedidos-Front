import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { ClienteComponent } from './pages/cliente/cliente.component';
import { ProductoComponent } from './pages/producto/producto.component';
import { PedidoComponent } from './pages/pedido/pedido.component';

const routes: Routes = [
  { path: 'home' , component: HomeComponent, canActivate: [ AuthGuard ]},
  { path: 'cliente' , component: ClienteComponent },
  { path: 'cliente/:pag' , component: ClienteComponent },
  { path: 'cliente/:buscar/:pag' , component: ClienteComponent },
  { path: 'producto' , component: ProductoComponent },
  { path: 'producto/:pag' , component: ProductoComponent },
  { path: 'producto/:buscar/:pag' , component: ProductoComponent },
  { path: 'pedido' , component: PedidoComponent },
  { path: 'pedido/:pag' , component: PedidoComponent },
  { path: 'pedido/:buscar/:pag' , component: PedidoComponent },
  { path: 'login' , component: LoginComponent },
  { path: '**' , pathMatch: 'full', redirectTo: 'cliente' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
