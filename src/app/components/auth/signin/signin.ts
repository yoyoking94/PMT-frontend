import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

/**
 * Composant pour la page de connexion utilisateur.
 */
@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './signin.html',
  styleUrls: ['./signin.css'],
})
export class SigninComponent {
  email = ''; // Email de l'utilisateur
  password = ''; // Mot de passe saisi
  errorMsg = ''; // Message d'erreur affiché si besoin

  constructor(private authService: AuthService, private router: Router) {}

  /**
   * Soumission du formulaire de connexion.
   */
  onSubmit() {
    this.authService.signin({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.authService.setLoggedUsername(response.username);
        this.errorMsg = '';
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Identifiants invalides ou erreur serveur.';
      },
    });
  }

  /**
   * Indique si on est déjà sur la route d'inscription.
   */
  isOnSignup(): boolean {
    return window.location.pathname === '/signup';
  }
}
