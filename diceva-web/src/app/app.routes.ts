import { Routes } from '@angular/router';

// en esta seccion se llaman los compenentes que creamos y queremos 
// que se muestre 
import {Inicio} from './componentes/inicio/incio';
import {Login} from './componentes/login/login';
import { Catalogo } from './componentes/catalogo/catalogo';

export const routes: Routes = [
{path:'', component: Inicio},
{path: 'login', component:Login},
{path: 'catalogo',component:Catalogo},
{path: '**', pathMatch:'full',redirectTo:'/'}

];
