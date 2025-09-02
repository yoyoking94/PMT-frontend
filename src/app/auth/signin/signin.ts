import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signin',
  imports: [FormsModule],
  templateUrl: './signin.html',
  styleUrl: './signin.css',
})
export class SigninComponent {
  username = '';
  password = '';

  onSubmit() {
    // Temporarily just log credentials to console
    console.log('Login:', this.username, this.password);
    alert('Connexion temporaire. Backend non connecté.');
  }
}
