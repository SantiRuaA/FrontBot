import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { UserService } from '../../core/services/user.service'; // <-- 1. USAMOS EL NUEVO SERVICIO
import {
    LoadUsers,
    LoadUsersSuccess,
    LoadUsersFailure,
} from './user.actions';

// El modelo del estado, ahora más simple y sin paginación
export interface UserStateModel {
    users: User[];
    loading: boolean;
    error: string | null;
}

@State<UserStateModel>({
    name: 'user', // Mantenemos el nombre 'user'
    defaults: {
        users: [],
        loading: false,
        error: null,
    },
})
@Injectable()
export class UserState {
    // 2. Inyectamos el servicio que se conecta a la API del SENA
    constructor(private UserService: UserService) { }

    // --- Selectors (estos no cambian) ---
    @Selector()
    static users(state: UserStateModel): User[] {
        return state.users;
    }

    @Selector()
    static loading(state: UserStateModel): boolean {
        return state.loading;
    }

    // --- Action Handlers (aquí está la lógica actualizada) ---
    @Action(LoadUsers)
    loadUsers(ctx: StateContext<UserStateModel>) {
        ctx.patchState({ loading: true, error: null });

        // 3. Llamamos al método getUsers() de nuestro NUEVO servicio
        return this.UserService.getUsers().pipe(
            tap((users) => {
                ctx.dispatch(new LoadUsersSuccess(users));
            }),
            catchError((error) => {
                const errorMessage = error.message || 'Fallo al cargar los usuarios';
                ctx.dispatch(new LoadUsersFailure(errorMessage));
                return of(error);
            })
        );
    }

    @Action(LoadUsersSuccess)
    loadUsersSuccess(ctx: StateContext<UserStateModel>, action: LoadUsersSuccess) {
        ctx.patchState({
            users: action.users, // Guardamos el array de usuarios
            loading: false,
        });
    }

    @Action(LoadUsersFailure)
    loadUsersFailure(ctx: StateContext<UserStateModel>, action: LoadUsersFailure) {
        ctx.patchState({
            loading: false,
            error: action.error,
        });
    }
}