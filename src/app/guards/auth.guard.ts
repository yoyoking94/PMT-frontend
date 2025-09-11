import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = !!this.authService.getLoggedUsername();
    if (isLoggedIn) {
      return true;
    } else {
      this.router.navigate(['/signin']);
      return false;
    }
  }
}
