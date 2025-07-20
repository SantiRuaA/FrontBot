import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngxs/store';
import { firstValueFrom } from 'rxjs';
import { AuthState } from '../../state/auth/auth.state';
import { RestoreSession } from '../../state/auth/auth.actions';

let sessionRestored = false;

export const authGuard: CanActivateFn = async (route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isPublicRoute = route.data['isPublic'] === true;

  if (!sessionRestored && isPlatformBrowser(platformId)) {
    await firstValueFrom(store.dispatch(new RestoreSession()));
    sessionRestored = true; 
  }

  const isAuthenticated = store.selectSnapshot(AuthState.isAuthenticated);

  if (isPublicRoute) {
    if (isAuthenticated) {
      return router.createUrlTree(['/generador']);
    }
    return true;
  }

  if (isAuthenticated) {
    return true;
  }
  return router.createUrlTree(['/login']);
};