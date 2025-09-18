import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth';
import { RouterLink } from '@angular/router';

/**
 * Composant pour la page d'inscription utilisateur.
 */
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class SignupComponent {
  username = ''; // Nom d'utilisateur saisi
  email = ''; // Email saisi
  password = ''; // Mot de passe saisi
  message = ''; // Message de succès ou d'erreur à afficher

  constructor(private authService: AuthService) {}

  /**
   * Soumission du formulaire d'inscription.
   */
  onSubmit() {
    this.authService
      .signup({ username: this.username, email: this.email, password: this.password })
      .subscribe({
        next: () => {
          this.message = 'Inscription réussie ! Vous pouvez vous connecter.';
        },
        error: (err) => {
          this.message = err.error?.message || "Erreur lors de l'inscription.";
        },
      });
  }

  /**
   * Indique si on est sur la route de connexion.
   */
  isOnSignin(): boolean {
    return window.location.pathname === '/signin' || window.location.pathname === '/';
  }
}
