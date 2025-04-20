import { Routes } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { authGuard } from './guards/auth.guard';
import { rootGuard } from './guards/root.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/signinandsignup/signinandsignup.component').then(
        (m) => m.SigninandsignupComponent,
      ),
    canActivate: [rootGuard],
  },
  {
    path: 'app',
    component: SidebarComponent,
    canActivate: [authGuard],
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
      {
        path: 'view-car-tuning/:id',
        loadComponent: () =>
          import('./pages/view-car-tuning/view-car-tuning.component').then(
            (m) => m.ViewCarTuningComponent,
          ),
      },
    ],
  },
];
