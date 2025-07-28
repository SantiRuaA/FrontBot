import { User } from '../../shared/models/user.model';

export class Login {
  static readonly type = '[Auth] Login';
  constructor(
    public correo_sena: string, 
    public password: string
  ) {}
}

export class LoginSuccess {
  static readonly type = '[Auth] Login Success';
  constructor(public user: User, public token: string) {}
}

export class LoginFailure {
  static readonly type = '[Auth] Login Failure';
  constructor(public error: string) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class RestoreSession {
  static readonly type = '[Auth] Restore Session';
}

export class UpdateAuthenticatedUser {
  static readonly type = '[Auth] Update Authenticated User';
  constructor(public user: User) {}
}