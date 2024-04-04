import { AuthActionTypes } from '@app-auth/actions/auth.actions';
import { ActionReducer, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';

// eslint-disable-next-line
export interface State {}

// console.log all actions
export function logger(reducer: ActionReducer<State>): ActionReducer<State> {
  return (state: State, action: any): State => {
    console.log('state', state);
    console.log('action', action);

    return reducer(state, action);
  };
}

export function clearState(reducer) {
  return (state, action) => {
    if (action.type === AuthActionTypes.UserLogout) {
      state = undefined;
    }
    return reducer(state, action);
  };
}

export const metaReducers: Array<MetaReducer<State>> = !environment.production ? [clearState] : [clearState];
// ? [logger, clearState] :  [clearState];
