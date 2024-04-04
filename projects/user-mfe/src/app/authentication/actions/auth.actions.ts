import { Action } from '@ngrx/store';

export enum AuthActionTypes {
  UserLogout = '[Auth] User Logout',
}

export class UserLogout implements Action {
  public readonly type = AuthActionTypes.UserLogout;
}

export type AuthActions = UserLogout;
