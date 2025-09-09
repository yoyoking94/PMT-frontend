import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class AppComponent {
  title = () => 'Mon Application';
  message = '';
  username: string | null = '';

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) {
    this.loadMessage();
    this.username = this.authService.getLoggedUsername();
  }

  loadMessage() {
    this.http.get('http://localhost:8080/api/hello', { responseType: 'text' }).subscribe({
      next: (data) => (this.message = data),
      error: () => (this.message = 'Erreur de chargement du message'),
    });
  }

  ngOnInit() {
    this.authService.username$.subscribe((name) => {
      this.username = name;
    });
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/signin']);
  }
}
