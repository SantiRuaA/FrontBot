import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngxs/store';
import { firstValueFrom } from 'rxjs';
import { AuthState } from '../../state/auth/auth.state';
import { RestoreSession } from '../../state/auth/auth.actions';

// Variable para asegurar que la restauración solo se haga una vez por carga de la app
let sessionRestored = false;

export const authGuard: CanActivateFn = async (route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isPublicRoute = route.data['isPublic'] === true;

  // Si no hemos restaurado la sesión y estamos en el navegador...
  if (!sessionRestored && isPlatformBrowser(platformId)) {
    // ...la restauramos y esperamos a que termine.
    await firstValueFrom(store.dispatch(new RestoreSession()));
    sessionRestored = true; // Marcamos como restaurada para no volver a hacerlo.
  }

  // Ahora, con el estado ya actualizado, tomamos la decisión
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