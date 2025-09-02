import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  imports: [FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class SignupComponent {
  username = '';
  email = '';
  password = '';

  onSubmit() {
    console.log('Inscription:', this.username, this.email, this.password);
    alert('Inscription temporaire. Backend non connecté.');
  }
}
