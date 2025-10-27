import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

export interface User {
  email: string;
  username?: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  register(user: User): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/register`, user).pipe(
      catchError((error) => {
        const errMsg = error.error?.error || "Erreur inconnue lors de l'inscription.";
        return throwError(() => new Error(errMsg));
      })
    );
  }

  login(user: User): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, user).pipe(
      catchError((error) => {
        const errMsg = error.error?.error || 'Erreur inconnue lors de la connexion.';
        return throwError(() => new Error(errMsg));
      })
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  loginSuccess(userData: any) {
    localStorage.setItem('currentUser', JSON.stringify(userData));
  }

  private getCurrentUser(): any {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return null;
    try {
      const stored = JSON.parse(userJson);
      return stored.user || null;
    } catch {
      return null;
    }
  }

  getCurrentUserId(): number | null {
    const user = this.getCurrentUser();
    return user?.id ?? null;
  }

  getUserById(userId: number): Observable<{ id: number; email: string }> {
    return this.http.get<{ id: number; email: string }>(
      `http://localhost:8080/api/utilisateurs/${userId}`
    );
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes('admin') ?? false;
  }

  logout() {
    localStorage.clear();
  }
}
