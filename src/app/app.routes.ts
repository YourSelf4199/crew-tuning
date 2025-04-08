import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/signinandsignup/signinandsignup.component').then(
        (m) => m.SigninandsignupComponent,
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    children: [
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
