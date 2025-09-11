import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class SignupComponent {
  username = '';
  email = '';
  password = '';
  message = '';

  constructor(private authService: AuthService) {}

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

  isOnSignin(): boolean {
    return window.location.pathname === '/signin' || window.location.pathname === '/';
  }
}
