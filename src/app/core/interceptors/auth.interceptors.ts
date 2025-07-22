import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { AuthState } from '../../state/auth/auth.state'; 

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  
  const token = store.selectSnapshot(AuthState.token);

  if (!token) {
    return next(req);
  }

  const reqWithAuthHeader = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });
  
  return next(reqWithAuthHeader);
};