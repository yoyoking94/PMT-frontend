import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth';

/**
 * Gardien de route qui protège l'accès aux pages nécessitant une authentification.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Vérifie si l'utilisateur est connecté afin d'autoriser l'accès à la route.
   * Redirige vers la page de connexion si non connecté.
   */
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
