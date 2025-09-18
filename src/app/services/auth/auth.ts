import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface SigninData {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  private loggedInKey = 'loggedUser';
  private usernameSubject = new BehaviorSubject<string | null>(
    localStorage.getItem(this.loggedInKey)
  );
  public username$ = this.usernameSubject.asObservable();

  constructor(private http: HttpClient) {}

  signin(data: SigninData): Observable<any> {
    return new Observable((observer) => {
      this.http.post<any>(`${this.apiUrl}/signin`, data).subscribe({
        next: (res) => {
          this.setLoggedUsername(res.username);
          localStorage.setItem('userId', res.id);
          observer.next(res);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  signup(data: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, data);
  }

  setLoggedUsername(name: string) {
    localStorage.setItem(this.loggedInKey, name);
    this.usernameSubject.next(name);
  }

  getLoggedUsername(): string | null {
    return localStorage.getItem(this.loggedInKey);
  }

  isLoggedIn(): boolean {
    return this.getLoggedUsername() !== null;
  }

  logout() {
    localStorage.removeItem(this.loggedInKey);
    this.usernameSubject.next(null);
  }
}
