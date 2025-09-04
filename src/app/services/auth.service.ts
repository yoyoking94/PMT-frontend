import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private loggedInKey = 'loggedUser';

  constructor(private http: HttpClient) {}

  signin(data: SigninData): Observable<any> {
    return new Observable((observer) => {
      this.http
        .post<any>(`${this.apiUrl}/signin`, data, { responseType: 'json' as const })
        .subscribe({
          next: (response) => {
            // Sauvegarder le nom d’utilisateur dans localStorage à la connexion
            this.setLoggedUsername(data.username);
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

  logout() {
    localStorage.removeItem(this.loggedInKey);
  }

  setLoggedUsername(username: string) {
    localStorage.setItem(this.loggedInKey, username);
  }

  getLoggedUsername(): string | null {
    return localStorage.getItem(this.loggedInKey);
  }
}
