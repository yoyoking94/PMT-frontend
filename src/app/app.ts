import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent implements OnInit {
  nom: string | null = null;

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loadUsername();
  }

  loadUsername() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        const userObj = JSON.parse(currentUser);
        this.nom = userObj.user?.username || userObj.username || null;
      } catch {
        this.nom = null;
      }
    }
  }

  logout() {
    this.authService.logout();
    this.nom = null;
    this.router.navigate(['/login']);
  }
}
