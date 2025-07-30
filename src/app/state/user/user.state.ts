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
  ChangeUserPage,
  FilterUsers,
  CreateUser,
  CreateUserSuccess,
  CreateUserFailure,
  UpdateUser,
  UpdateUserSuccess,
  UpdateUserFailure,
} from './user.actions';

export interface UserStateModel {
  allUsers: User[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  filter: string;
}

@State<UserStateModel>({
  name: 'user',
  defaults: {
    allUsers: [],
    loading: false,
    error: null,
    page: 1,
    limit: 5,
    filter: '',
  },
})
@Injectable()
export class UserState {
  constructor(private userService: UserService) {}


  @Selector()
  static getVisibleUsers(state: UserStateModel): User[] {
    const { allUsers, filter, page, limit } = state;

    const filtered = !filter
      ? allUsers
      : allUsers.filter(user => {
          const lowerCaseFilter = filter.toLowerCase();
          return (
            user.fullName.toLowerCase().includes(lowerCaseFilter) ||
            user.email.toLowerCase().includes(lowerCaseFilter) ||
            user.role.toLowerCase().includes(lowerCaseFilter)
          );
        });

    // 2. Pagina la lista filtrada
    const startIndex = (page - 1) * limit;
    return filtered.slice(startIndex, startIndex + limit);
  }

  @Selector()
  static getTotalFiltered(state: UserStateModel): number {
    const { allUsers, filter } = state;
    if (!filter) {
      return allUsers.length;
    }
    return allUsers.filter(user => {
        const lowerCaseFilter = filter.toLowerCase();
        return (
          user.fullName.toLowerCase().includes(lowerCaseFilter) ||
          user.email.toLowerCase().includes(lowerCaseFilter) ||
          user.role.toLowerCase().includes(lowerCaseFilter)
        );
      }).length;
  }

  @Selector() static currentPage(state: UserStateModel): number { return state.page; }
  @Selector() static limit(state: UserStateModel): number { return state.limit; }
  @Selector() static loading(state: UserStateModel): boolean { return state.loading; }
  @Selector() static error(state: UserStateModel): string | null { return state.error; }

  // --- ACCIONES ---

  @Action(LoadUsers)
  loadUsers(ctx: StateContext<UserStateModel>) {
    ctx.patchState({ loading: true, error: null });
    return this.userService.getUsers().pipe(
      tap((users) => ctx.dispatch(new LoadUsersSuccess(users))),
      catchError((error) => {
        ctx.dispatch(new LoadUsersFailure('Fallo al cargar los usuarios desde la API.'));
        return of(error);
      })
    );
  }

  @Action(LoadUsersSuccess)
  loadUsersSuccess(ctx: StateContext<UserStateModel>, { users }: LoadUsersSuccess) {
    ctx.patchState({ allUsers: users, loading: false });
  }

  @Action(LoadUsersFailure)
  loadUsersFailure(ctx: StateContext<UserStateModel>, { error }: LoadUsersFailure) {
    ctx.patchState({ loading: false, error });
  }

  @Action(ChangeUserPage)
  changeUserPage(ctx: StateContext<UserStateModel>, { page }: ChangeUserPage) {
    ctx.patchState({ page });
  }

  @Action(FilterUsers)
  filterUsers(ctx: StateContext<UserStateModel>, { filter }: FilterUsers) {
    ctx.patchState({ filter, page: 1 });
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
      allUsers: [...state.allUsers, user],
      loading: false,
    });
    return ctx.dispatch(new Navigate(['/usuarios']));
  }

  @Action(CreateUserFailure)
  createUserFailure(ctx: StateContext<UserStateModel>, { error }: CreateUserFailure) {
    ctx.patchState({ loading: false, error: error });
  }

  @Action(UpdateUser)
  updateUser(ctx: StateContext<UserStateModel>, { id, payload }: UpdateUser) {
    ctx.patchState({ loading: true, error: null });
    return this.userService.updateUser(id, payload).pipe(
      tap((updatedUser) => {
        ctx.dispatch(new UpdateUserSuccess(updatedUser));
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Error al actualizar el usuario.';
        ctx.dispatch(new UpdateUserFailure(errorMessage));
        return of(error);
      })
    );
  }

  @Action(UpdateUserSuccess)
  updateUserSuccess(ctx: StateContext<UserStateModel>, { user }: UpdateUserSuccess) {
    const state = ctx.getState();
    const updatedUsers = state.allUsers.map(u => u.id === user.id ? user : u);
    ctx.patchState({
      allUsers: updatedUsers,
      loading: false,
    });
    return ctx.dispatch(new Navigate(['/usuarios']));
  }

  @Action(UpdateUserFailure)
  updateUserFailure(ctx: StateContext<UserStateModel>, { error }: UpdateUserFailure) {
    ctx.patchState({ loading: false, error: error });
  }
}