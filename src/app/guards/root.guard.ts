import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const rootGuard: CanActivateFn = async (route) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Check if localStorage is empty
  if (localStorage.length === 0) {
    return true;
  }

  try {
    const session = await authService.getCurrentSession();
    // Check if we have valid tokens in the session
    if (session?.tokens?.idToken && !authService.isSigningOut) {
      return router.createUrlTree(['/app/dashboard']);
    }
    return true;
  } catch (error) {
    authService.setError('Authentication failed');
    // If there's an error getting the session, allow access to root
    return true;
  }
};
