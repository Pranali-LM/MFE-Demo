import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LiveViewGuard implements CanActivate {
  constructor(private router: Router) {}

  public canActivate(): Observable<boolean> | Promise<boolean> | boolean | UrlTree {
    const fullURL = this.router.url;
    const url = fullURL.includes('?') ? fullURL.substr(0, fullURL.indexOf('?')) : fullURL;
    if (url !== '/live-view') {
      return true;
    }
  }
}
