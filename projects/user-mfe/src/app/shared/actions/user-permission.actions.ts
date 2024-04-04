import { Action } from '@ngrx/store';

export enum UserPermission {
  UpdateUserPermission = '[User Permissions] Update User Permissions',
  ResetUserPermission = '[User Permissions] Reset User Permissions',
}

export class UpdateUserPermission implements Action {
  public readonly type = UserPermission.UpdateUserPermission;

  constructor(
    public payload: {
      currentFleet: string;
      permissions: string[];
      uiConfigurations: string[];
    }
  ) {}
}

export class ResetUserPermission implements Action {
  public readonly type = UserPermission.ResetUserPermission;
}

export type UserPermissionActions = UpdateUserPermission | ResetUserPermission;
