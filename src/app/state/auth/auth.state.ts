import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { State, Action, StateContext, Selector, Store, Actions, ofActionSuccessful } from '@ngxs/store';
import { tap, catchError, of, take } from 'rxjs';
import { Navigate } from '@ngxs/router-plugin';
import { jwtDecode } from 'jwt-decode';

import { AuthService } from '../../core/services/auth.service';
import { User } from '../../shared/models/user.model';
import { Login, LoginSuccess, LoginFailure, Logout, RestoreSession, UpdateAuthenticatedUser } from './auth.actions';
import { LoadUsers, LoadUsersSuccess } from '../user/user.actions';
import { RestoreGeneratedItems, ClearGeneratedItems } from '../generator/generator.actions';

export interface AuthStateModel {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
  loading: boolean;
  sessionRestored: boolean;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    user: null,
    token: null,
    isAuthenticated: false,
    error: null,
    loading: false,
    sessionRestored: false
  },
})
@Injectable()
export class AuthState {
  constructor(
    private authService: AuthService,
    private store: Store,
    private actions$: Actions,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  @Selector() static isAuthenticated(state: AuthStateModel): boolean { return state.isAuthenticated; }
  @Selector() static user(state: AuthStateModel): User | null { return state.user; }
  @Selector() static loading(state: AuthStateModel): boolean { return state.loading; }
  @Selector() static error(state: AuthStateModel): string | null { return state.error; }
  @Selector() static token(state: AuthStateModel): string | null { return state.token;}

  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, { correo_sena, password }: Login) {
    ctx.patchState({ loading: true, error: null });
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('generatedItems');
    }
    ctx.dispatch(new ClearGeneratedItems());
    
    return this.authService.login(correo_sena, password).pipe(
      tap((response: any) => {
        const token = response.accessToken;
        const decodedToken: any = jwtDecode(token);

        const userForState: User = {
          id: decodedToken.sub || decodedToken.id || '',
          tenantId: decodedToken.tenantId || 0,
          email: response.user.correo_sena,
          role: response.user.rol_asignado,
          fullName: 'Cargando...',
          department: '',
          status: true,
          image: 'assets/logosena.png',
        };
        ctx.dispatch(new LoginSuccess(userForState, token));
      }),
      catchError((error) => {
        ctx.dispatch(new LoginFailure('Correo o contraseña incorrectos'));
        return of(error);
      })
    );
  }

  @Action(LoginSuccess)
  loginSuccess(ctx: StateContext<AuthStateModel>, { user, token }: LoginSuccess) {
    ctx.patchState({
      user,
      token,
      isAuthenticated: true,
      loading: false,
      error: null,
    });
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('authToken', token);
    }

    ctx.dispatch(new LoadUsers());

    this.actions$.pipe(
      ofActionSuccessful(LoadUsersSuccess),
      take(1)
    ).subscribe(() => {
      const state = this.store.snapshot();
      const allUsers = state.user.allUsers;
      const fullUser = allUsers.find((u: User) => u.email === user.email);

      if (fullUser) {
        if (!fullUser.status) {
          ctx.dispatch(new LoginFailure('Tu cuenta está inactiva. Por favor, contacta a un administrador.'));
          ctx.dispatch(new Logout());
          return;
        }
        const userWithFirstName = {
          ...fullUser,
          fullName: fullUser.fullName.split(' ')[0]
        };
        ctx.dispatch(new UpdateAuthenticatedUser(userWithFirstName));
      }
    });

    return ctx.dispatch(new Navigate(['/generador']));
  }

  @Action(UpdateAuthenticatedUser)
  updateAuthenticatedUser(ctx: StateContext<AuthStateModel>, { user }: UpdateAuthenticatedUser) {
    ctx.patchState({ user });
  }

  @Action(LoginFailure)
  loginFailure(ctx: StateContext<AuthStateModel>, { error }: LoginFailure) {
    ctx.patchState({ loading: false, error });
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('generatedItems');
    }
    ctx.dispatch(new ClearGeneratedItems());
    
    ctx.setState({
      user: null, token: null, isAuthenticated: false, error: null, loading: false, sessionRestored: false
    });
    return ctx.dispatch(new Navigate(['/login']));
  }

  @Action(RestoreSession)
  restoreSession(ctx: StateContext<AuthStateModel>) {
    if (isPlatformBrowser(this.platformId)) {
      const token = sessionStorage.getItem('authToken');
      if (token) {
        try {
          const decodedToken: any = jwtDecode(token);
          if (Date.now() < decodedToken.exp * 1000) {
            const tempUser: User = {
              id: decodedToken.sub || decodedToken.id,
              tenantId: decodedToken.tenantId,
              email: decodedToken.email,
              role: decodedToken.role,
              fullName: 'Cargando...',
              department: '',
              status: true,
              image: 'assets/logosena.png',
            };
            ctx.patchState({ user: tempUser, token, isAuthenticated: true });

            ctx.dispatch(new LoadUsers());

            this.actions$.pipe(
              ofActionSuccessful(LoadUsersSuccess),
              take(1)
            ).subscribe(() => {
              const state = this.store.snapshot();
              const allUsers = state.user.allUsers;
              const fullUser = allUsers.find((u: User) => u.email === decodedToken.email);
              if (fullUser) {
                const userWithFirstName = {
                  ...fullUser,
                  fullName: fullUser.fullName.split(' ')[0]
                };
                ctx.dispatch(new UpdateAuthenticatedUser(userWithFirstName));
              }
            });
            
            ctx.dispatch(new RestoreGeneratedItems());

          } else {
            sessionStorage.removeItem('authToken');
          }
        } catch {
          sessionStorage.removeItem('authToken');
        }
      }
    }
    ctx.patchState({ sessionRestored: true });
    return of(null);
  }
}
