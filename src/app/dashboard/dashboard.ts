import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent {
  username: string | null = '';

  constructor(private authService: AuthService, private router: Router) {
    this.username = this.authService.getLoggedUsername();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/signin']);
  }
}
