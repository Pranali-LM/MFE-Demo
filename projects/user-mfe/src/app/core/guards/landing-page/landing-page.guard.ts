import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AccessService } from '@app-core/services/access/access.service';
import { CLIENT_CONFIG } from '@config/config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LandingPageGuard implements CanActivate {
  constructor(private accessService: AccessService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!CLIENT_CONFIG.showLandingPage || this.accessService.isUserAuthenticated()) {
      return this.callbackUrlTree;
    }
    return true;
  }

  private get callbackUrlTree(): UrlTree {
    const url = CLIENT_CONFIG.wildcardRoute;
    const tree = this.router.parseUrl(url);
    return tree;
  }
}
