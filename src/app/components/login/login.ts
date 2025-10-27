import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  connexion = true;
  loginForm: FormGroup;
  registerForm: FormGroup;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: [''],
      password: [''],
    });
    this.registerForm = this.fb.group({
      email: [''],
      username: [''],
      password: [''],
    });
  }

  toggleConnexion() {
    this.connexion = !this.connexion;
    this.errorMessage = null;
  }

  submitLogin() {
    const user: User = this.loginForm.value;
    this.authService.login(user).subscribe({
      next: (res) => {
        this.authService.loginSuccess(res);
        this.errorMessage = null;
        this.router.navigate(['/home']).then(() => {
          window.location.reload();
        });
      },
      error: (err) => {
        this.errorMessage = err.message;
      },
    });
  }

  submitRegister() {
    const user: User = this.registerForm.value;
    this.authService.register(user).subscribe({
      next: () => {
        this.errorMessage = null;
        this.connexion = true;
      },
      error: (err) => {
        this.errorMessage = err.message;
      },
    });
  }
}
