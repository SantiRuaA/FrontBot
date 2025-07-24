import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../../state/auth/auth.state';

export const roleGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[];

  const user = store.selectSnapshot(AuthState.user);

  const hasRequiredRole = user?.role && requiredRoles.some(
    requiredRole => user.role.toLowerCase() === requiredRole.toLowerCase()
  );

  if (hasRequiredRole) {
    return true;
  }
  return router.createUrlTree(['/generador']);
};