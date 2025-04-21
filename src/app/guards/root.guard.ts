import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const rootGuard: CanActivateFn = async (route) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  try {
    const session = await authService.getCurrentSession();
    // Check if we have valid tokens in the session
    if (session?.tokens?.idToken && !authService.isSigningOut) {
      return router.createUrlTree(['/app/dashboard']);
    }
    return true;
  } catch (error) {
    // If there's an error getting the session, allow access to root
    return true;
  }
};
