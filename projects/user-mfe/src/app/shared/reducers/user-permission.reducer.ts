import { UserPermission, UserPermissionActions } from '../actions/user-permission.actions';

export interface State {
  currentFleet: string;
  permissions: string[];
  uiConfigurations: string[];
}

export const initialState: State = {
  currentFleet: '',
  permissions: [],
  uiConfigurations: [],
};

export function reducer(state = initialState, action: UserPermissionActions): State {
  switch (action.type) {
    case UserPermission.UpdateUserPermission:
      return {
        ...state,
        ...action.payload,
      };

    case UserPermission.ResetUserPermission:
      return {
        ...state,
        ...initialState,
      };

    default:
      return state;
  }
}
