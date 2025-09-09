import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './signin.html',
  styleUrl: './signin.css',
})
export class SigninComponent {
  username = '';
  password = '';
  errorMsg = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.signin({ username: this.username, password: this.password }).subscribe({
      next: (response) => {
        console.log('Connexion réussie !');
        this.authService.setLoggedUsername(this.username); // Stocke le username
        this.errorMsg = '';
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Identifiants invalides ou erreur serveur.';
      },
    });
  }

  isOnSignup(): boolean {
    return window.location.pathname === '/signup';
  }
}
