import { Action } from '@ngrx/store';

export enum SideNavigationConfigActionTypes {
  UpdateSideNavigationConfig = '[Shared] Update SideNavigation Config',
  ResetSideNavigationConfig = '[Shared] Reset SideNavigation Config',
}

export class UpdateSideNavigationConfig implements Action {
  public readonly type = SideNavigationConfigActionTypes.UpdateSideNavigationConfig;

  constructor(
    public payload: {
      currentWindowWidth: number;
      isSideNavOpen: boolean;
    }
  ) {}
}

export class ResetSideNavigationConfig implements Action {
  public readonly type = SideNavigationConfigActionTypes.ResetSideNavigationConfig;
}

export type SideNavigationConfigActions = UpdateSideNavigationConfig | ResetSideNavigationConfig;
