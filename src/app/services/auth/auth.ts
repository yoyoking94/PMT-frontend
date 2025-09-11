import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface SignupData {
  username: string;
  email: string;
  password: string;
}

interface SigninData {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private userApi = 'http://localhost:8080/api/users';

  private loggedInKey = 'loggedUser';
  private usernameSubject = new BehaviorSubject<string | null>(
    localStorage.getItem(this.loggedInKey)
  );
  public username$: Observable<string | null> = this.usernameSubject.asObservable();

  constructor(private http: HttpClient) {}

  signin(data: { email: string; password: string }): Observable<any> {
    return new Observable((observer) => {
      this.http
        .post<any>(`${this.apiUrl}/signin`, data, { responseType: 'json' as const })
        .subscribe({
          next: (response) => {
            // Enregistre email/ID dans le localStorage si besoin
            this.setLoggedUsername(response.username); // ou .setLoggedUserEmail(response.email)
            localStorage.setItem('userId', response.id);
            observer.next(response);
            observer.complete();
          },
          error: (err) => {
            observer.error(err);
          },
        });
    });
  }

  signup(data: SignupData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, data);
  }

  setLoggedUsername(username: string) {
    localStorage.setItem(this.loggedInKey, username);
    this.usernameSubject.next(username); // Notifier changement
  }

  getLoggedUsername(): string | null {
    return localStorage.getItem(this.loggedInKey);
  }

  checkEmail(email: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.userApi}/check-email`, { params: { email } });
  }

  logout() {
    localStorage.removeItem(this.loggedInKey);
    this.usernameSubject.next(null); // Notifier déconnexion
  }
}
