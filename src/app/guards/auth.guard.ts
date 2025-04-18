import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = async (route) => {
  const router = inject(Router);
  // Check if we're exactly on /app (no child routes)
  const isAppPath = route.url.length === 1 && route.url[0].path === 'app' && !route.firstChild;

  // Only redirect if we're exactly on /app
  if (isAppPath) {
    return router.createUrlTree(['/app/dashboard']);
  }

  return true;
};
