import { User } from '../../shared/models/user.model';

// Orden para iniciar la carga de usuarios desde la nueva API
export class LoadUsers {
    static readonly type = '[User] Load Users';
}

// Ocurre cuando los usuarios se cargan con éxito
export class LoadUsersSuccess {
    static readonly type = '[User] Load Users Success';
    constructor(public users: User[]) { } // El payload es el array de usuarios
}

// Ocurre si hay un error en la carga
export class LoadUsersFailure {
    static readonly type = '[User] Load Users Failure';
    constructor(public error: string) { }
}