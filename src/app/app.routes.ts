import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/signinandsignup/signinandsignup.component').then(m => m.SigninandsignupComponent)
    }
];
