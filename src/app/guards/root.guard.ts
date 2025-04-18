import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const rootGuard: CanActivateFn = async (route) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  try {
    const session = await authService.getCurrentSession();
    // Only redirect if we have a session and we're not in the process of signing out
    if (session && !authService.isSigningOut) {
      return router.createUrlTree(['/app/dashboard']);
    }
    return true;
  } catch (error) {
    return true;
  }
};
