import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  styleUrl: './app.css',
  templateUrl: './app.html', // <-- Utiliser le fichier externe ici
})
export class AppComponent {
  title = () => 'Mon Application';
  message = '';

  constructor(private http: HttpClient) {
    this.loadMessage();
  }

  loadMessage() {
    this.http.get('http://localhost:8080/api/hello', { responseType: 'text' }).subscribe({
      next: (data) => (this.message = data),
      error: () => (this.message = 'Erreur de chargement du message'),
    });
  }

  isOnSignin(): boolean {
    return window.location.pathname === '/signin' || window.location.pathname === '/';
  }

  isOnSignup(): boolean {
    return window.location.pathname === '/signup';
  }
}
