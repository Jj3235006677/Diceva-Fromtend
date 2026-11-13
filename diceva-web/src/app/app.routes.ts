import { Routes } from '@angular/router';
import { Inicio } from './componentes/inicio/incio';
import { Login } from './componentes/login/login';
import { Catalogo } from './componentes/catalogo/catalogo';
import { Comprar } from './componentes/comprar/comprar';
import { MisCompras } from './componentes/mis-compras/mis-compras';
import { ConfirmarCompras } from './componentes/confirmar-compras/confirmar-compras';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'login', component: Login },
  { path: 'catalogo', component: Catalogo },
  { path: 'comprar', component: Comprar },
  { path: 'mis-compras', component: MisCompras },
  { path: 'admin/compras', component: ConfirmarCompras },
  { path: '**', redirectTo: '' }
];