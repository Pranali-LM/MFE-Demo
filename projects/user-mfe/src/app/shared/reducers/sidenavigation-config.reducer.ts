import { SideNavigationConfigActions, SideNavigationConfigActionTypes } from '../actions/sidenavigation-config.action';

export interface State {
  currentWindowWidth: number;
  isSideNavOpen: boolean;
}

export const initialState: State = {
  currentWindowWidth: window.innerWidth,
  isSideNavOpen: window.innerWidth <= 1440 ? false : true,
};

export function reducer(state = initialState, action: SideNavigationConfigActions): State {
  switch (action.type) {
    case SideNavigationConfigActionTypes.UpdateSideNavigationConfig: {
      const { currentWindowWidth, isSideNavOpen } = action.payload;
      return {
        ...state,
        currentWindowWidth,
        isSideNavOpen,
      };
    }

    case SideNavigationConfigActionTypes.ResetSideNavigationConfig: {
      return {
        ...state,
        ...initialState,
      };
    }

    default:
      return state;
  }
}
