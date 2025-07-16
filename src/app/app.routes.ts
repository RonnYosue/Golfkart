import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login} from './pages/login/login';
import { Register } from './pages/register/register';
import { UsuarioFinal } from './pages/usuario-final/usuario-final';
import { Chofer} from './pages/chofer/chofer';
import { Administrador } from './pages/administrador/administrador';
import { CrearCuenta } from './pages/crear-cuenta/crear-cuenta';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registro', component: Register},
  { path: 'usuario', component: UsuarioFinal},
  { path: 'chofer', component: Chofer},
  { path: 'admin', component: Administrador },
  { path: 'crear-cuenta', component: CrearCuenta },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
