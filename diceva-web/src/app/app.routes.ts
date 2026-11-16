import { Routes } from '@angular/router';
import { Inicio } from './componentes/inicio/incio';
import { Login } from './componentes/login/login';
import { Catalogo } from './componentes/catalogo/catalogo';
import { Comprar } from './componentes/comprar/comprar';
import { MisCompras } from './componentes/mis-compras/mis-compras';
import { ConfirmarCompras } from './componentes/confirmar-compras/confirmar-compras';
import { authGuard, guestGuard, adminGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'catalogo', component: Catalogo },
  { path: 'comprar', component: Comprar, canActivate: [authGuard] },
  { path: 'mis-compras', component: MisCompras, canActivate: [authGuard] },
  { path: 'admin/compras', component: ConfirmarCompras, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: '' }
];