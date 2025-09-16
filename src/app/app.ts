import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth/auth';

/**
 * Composant racine de l’application affichant le titre, le message backend,
 * et gérant la déconnexion.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class AppComponent {
  title = () => 'Mon Application'; // Titre affiché dans la barre ou ailleurs
  message = ''; // Message texte chargé depuis backend
  username: string | null = ''; // Nom d’utilisateur connecté ou null

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {
    this.loadMessage();
    this.username = this.authService.getLoggedUsername();
  }

  /**
   * Charge un message simple depuis l’API backend (ex: message de bienvenue).
   */
  loadMessage() {
    this.http.get('http://localhost:8080/api/hello', { responseType: 'text' }).subscribe({
      next: (data) => (this.message = data),
      error: () => (this.message = 'Erreur de chargement du message'),
    });
  }

  /**
   * Sur init, s’abonne aux changements du nom utilisateur connecté.
   */
  ngOnInit() {
    this.authService.username$.subscribe({
      next: (name) => {
        this.username = name;
      },
    });
  }

  /**
   * Déconnexion : supprime l’état connecté et redirige vers la page de connexion.
   */
  logout() {
    this.authService.logout();
    this.router.navigate(['/signin']);
  }
}
