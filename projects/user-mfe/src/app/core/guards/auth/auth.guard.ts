import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AccessService } from '@app-core/services/access/access.service';
import { Observable } from 'rxjs';

import { CLIENT_CONFIG } from '@config/config';
import { internalRoutes } from '@config/config.base';
import { DataService } from '@app-core/services/data/data.service';
import { navigationRoutes } from '@config/links.base';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private accessService: AccessService, private router: Router, private dataService: DataService) {}

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean | UrlTree {
    const isLoggedIn = this.accessService.hasValidToken();
    const isAllowed = CLIENT_CONFIG.allowedRoutes.concat(internalRoutes).includes(route.url[0].path);

    if (!isLoggedIn) {
      const wildcardRouteTree = this.router.parseUrl(CLIENT_CONFIG.wildcardRoute);
      this.accessService.clearLocalStorage();
      wildcardRouteTree.queryParams = { redirectUrl: state.url };
      return wildcardRouteTree;
    }
    const isAccessible = this.isRouteAccessible(route.url[0].path);
    if (!(isAllowed && isAccessible)) {
      this.router.navigate(['home']);
      return false;
    }
    return true;
  }

  public isRouteAccessible(path: string) {
    const userInfo = this.accessService.getLoginInfo();
    const currentFleetId = this.dataService._currentFleet.value;
    const currentFleetInfo = (userInfo?.fleets || []).find((f) => f.fleetId === currentFleetId);

    const isInternalRoute = internalRoutes.includes(path);
    const currentPathConfig = navigationRoutes[path];
    const isAccessible =
      isInternalRoute || !currentPathConfig.uiConfigKey || currentFleetInfo.role.uiPermissions.includes(currentPathConfig.uiConfigKey);
    return isAccessible;
  }
}
