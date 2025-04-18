import { Routes } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/signinandsignup/signinandsignup.component').then(
        (m) => m.SigninandsignupComponent,
      ),
  },
  {
    path: 'app',
    component: SidebarComponent,
  },
];
