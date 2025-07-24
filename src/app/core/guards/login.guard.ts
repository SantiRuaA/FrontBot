import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngxs/store';
import { map } from 'rxjs';
import { AuthState } from '../../state/auth/auth.state';

export const loginGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(AuthState.isAuthenticated).pipe(
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return router.createUrlTree(['/generador']);
      }
      return true;
    })
  );
};