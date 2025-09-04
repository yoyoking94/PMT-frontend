import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './signin.html',
  styleUrl: './signin.css',
})
export class SigninComponent {
  username = '';
  password = '';
  errorMsg = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.authService.signin({ username: this.username, password: this.password }).subscribe({
      next: (response) => {
        console.log('Connexion réussie !', response);
        this.errorMsg = '';
      },
      error: (err) => {
        console.error('Erreur backend:', err);
        this.errorMsg = err.error || 'Identifiants invalides ou erreur serveur.';
      },
    });
  }
}
