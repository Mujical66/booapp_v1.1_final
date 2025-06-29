import { Routes } from '@angular/router'; 
import { TabsAdminPage } from './tabs-admin.page';


export const routes: Routes = [
  {
    path: 'tabs-admin', 
    component: TabsAdminPage,
    children: [
      {
        path: 'tab6',
        loadComponent: () => import('../tab6/tab6.page').then(m => m.Tab6Page)
      },
      {
        path: 'tab4',
        loadComponent: () => import('../tab4/tab4.page').then(m => m.Tab4Page)
      },
      {
        path: 'tab7',
        loadComponent: () => import('../tab7/tab7.page').then(m => m.Tab7Page)
      },
      {
        path: '',
        redirectTo: 'tab6',
        pathMatch: 'full'
      }
    ]
  },
];