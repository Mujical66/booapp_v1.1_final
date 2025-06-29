import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.page').then(m => m.RegistroPage)
  },
  {
    path: 'mapa',
    loadComponent: () => import('./mapa/mapa.page').then(m => m.MapaPage)
  },
  {
    path: 'recuperarclave',
    loadComponent: () => import('./recuperaclave/recuperaclave.page').then(m => m.RecuperaClavePage)
  },
  {
    path: 'detalle-evento/:id',
    loadComponent: () => import('./detalle-evento/detalle-evento.page').then(m => m.DetalleEventoPage)
  },
  {
    path: 'nuevo-evento/',
    loadComponent: () => import('./nuevo-evento/nuevo-evento.page').then(m => m.NuevoEventoPage)
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then(m => m.routes),
  },
  {
    path: '',
    loadChildren: () => import('./tabs-user/tabs-user.routes').then(m => m.routes),
  },
  {
    path: '',
    loadChildren: () => import('./tabs-admin/tabs-admin.routes').then(m => m.routes),
  },
  {
    path: '', 
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'editar',
    loadComponent: () => import('./editar/editar.page').then( m => m.EditarPage)
  },
];
