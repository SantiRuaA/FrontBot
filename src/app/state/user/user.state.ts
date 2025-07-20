import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError, of } from 'rxjs';
import { Navigate } from '@ngxs/router-plugin';
import { User } from '../../shared/models/user.model';
import { UserService } from '../../core/services/user.service';
import {
  LoadUsers,
  LoadUsersSuccess,
  LoadUsersFailure,
  CreateUser,
  CreateUserSuccess,
  CreateUserFailure,
} from './user.actions';

export interface UserStateModel {
  users: User[];
  loading: boolean;
  error: string | null;
}

@State<UserStateModel>({
  name: 'user',
  defaults: {
    users: [],
    loading: false,
    error: null,
  },
})
@Injectable()
export class UserState {
  constructor(private userService: UserService) {}

  @Selector()
  static users(state: UserStateModel): User[] {
    return state.users;
  }

  @Selector()
  static loading(state: UserStateModel): boolean {
    return state.loading;
  }
  
  @Selector()
  static error(state: UserStateModel): string | null {
    return state.error;
  }

  @Action(LoadUsers)
  loadUsers(ctx: StateContext<UserStateModel>) {
    ctx.patchState({ loading: true, error: null });
    return this.userService.getUsers().pipe(
      tap((users) => {
        ctx.dispatch(new LoadUsersSuccess(users));
      }),
      catchError((error) => {
        ctx.dispatch(new LoadUsersFailure('Fallo al cargar los usuarios'));
        return of(error);
      })
    );
  }

  @Action(LoadUsersSuccess)
  loadUsersSuccess(ctx: StateContext<UserStateModel>, { users }: LoadUsersSuccess) {
    ctx.patchState({
      users: users,
      loading: false,
    });
  }

  @Action(LoadUsersFailure)
  loadUsersFailure(ctx: StateContext<UserStateModel>, { error }: LoadUsersFailure) {
    ctx.patchState({
      loading: false,
      error: error,
    });
  }

  @Action(CreateUser)
  createUser(ctx: StateContext<UserStateModel>, { payload }: CreateUser) {
    ctx.patchState({ loading: true, error: null });
    return this.userService.createUser(payload).pipe(
      tap((newUser) => {
        ctx.dispatch(new CreateUserSuccess(newUser));
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Error al crear el usuario. Verifique los datos.';
        ctx.dispatch(new CreateUserFailure(errorMessage));
        return of(error);
      })
    );
  }

  @Action(CreateUserSuccess)
  createUserSuccess(ctx: StateContext<UserStateModel>, { user }: CreateUserSuccess) {
    const state = ctx.getState();
    ctx.patchState({
      users: [...state.users, user],
      loading: false,
      error: null,
    });
    return ctx.dispatch(new Navigate(['/usuarios']));
  }

  @Action(CreateUserFailure)
  createUserFailure(ctx: StateContext<UserStateModel>, { error }: CreateUserFailure) {
    ctx.patchState({
      loading: false,
      error: error,
    });
  }
}