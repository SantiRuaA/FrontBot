import { inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { filter, take, firstValueFrom } from 'rxjs';
import { RestoreSession } from '../../state/auth/auth.actions';
import { AuthState } from '../../state/auth/auth.state';

export function authInitializer() {
  const store = inject(Store);
  return () => {
    store.dispatch(new RestoreSession());
    // Devolvemos la promesa que se resuelve cuando sessionRestored es true
    return firstValueFrom(
      store.select(AuthState.sessionRestored).pipe(
        filter(restored => restored === true),
        take(1)
      )
    );
  };
}