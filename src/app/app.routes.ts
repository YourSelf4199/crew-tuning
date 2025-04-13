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
    path: '',
    component: SidebarComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'add-car-tuning',
        loadComponent: () =>
          import('./pages/add-car-tuning/add-car-tuning.component').then(
            (m) => m.AddCarTuningComponent,
          ),
      },
    ],
  },
];
