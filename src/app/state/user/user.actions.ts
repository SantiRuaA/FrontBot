import { User } from '../../shared/models/user.model';

export class LoadUsers {
    static readonly type = '[User] Load Users';
}

export class LoadUsersSuccess {
    static readonly type = '[User] Load Users Success';
    constructor(public users: User[]) { } // El payload es el array de usuarios
}

export class LoadUsersFailure {
    static readonly type = '[User] Load Users Failure';
    constructor(public error: string) { }
}

export class CreateUser {
  static readonly type = '[User] Create User';
  constructor(public payload: any) {} // El payload son los datos del formulario
}

export class CreateUserSuccess {
  static readonly type = '[User] Create User Success';
  constructor(public user: User) {}
}

export class CreateUserFailure {
  static readonly type = '[User] Create User Failure';
  constructor(public error: string) {}
}

export class UpdateUser {
  static readonly type = '[User] Update User';
  constructor(public id: string, public payload: any) {}
}

export class UpdateUserSuccess {
  static readonly type = '[User] Update User Success';
  constructor(public user: User) {}
}

export class UpdateUserFailure {
  static readonly type = '[User] Update User Failure';
  constructor(public error: string) {}
}