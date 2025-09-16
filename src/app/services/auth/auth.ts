import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Interface pour les données d'inscription.
 */
interface SignupData {
  username: string;
  email: string;
  password: string;
}

/**
 * Interface pour les données de connexion.
 */
interface SigninData {
  username: string;
  password: string;
}

/**
 * Service d'authentification gérant login, logout, inscription, et état de connexion.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth'; // URL API auth
  private userApi = 'http://localhost:8080/api/users'; // URL API utilisateurs

  private loggedInKey = 'loggedUser'; // Clé pour stocker le nom utilisateur
  // BehaviorSubject pour suivre l’état du nom d’utilisateur connecté
  private usernameSubject = new BehaviorSubject<string | null>(
    localStorage.getItem(this.loggedInKey)
  );

  // Observable publique pour souscription dans d’autres composants
  public username$: Observable<string | null> = this.usernameSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Effectue la connexion, enregistre le nom et l’ID dans le localStorage.
   */
  signin(data: { email: string; password: string }): Observable<any> {
    return new Observable((observer) => {
      this.http
        .post<any>(`${this.apiUrl}/signin`, data, { responseType: 'json' as const })
        .subscribe({
          next: (response) => {
            // Enregistre le nom utilisateur dans le localStorage
            this.setLoggedUsername(response.username);
            // Enregistre l'ID utilisateur dans localStorage
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

  /**
   * Inscription d’un nouvel utilisateur.
   */
  signup(data: SignupData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, data);
  }

  /**
   * Met à jour l’état du nom d’utilisateur connecté.
   */
  setLoggedUsername(username: string) {
    localStorage.setItem(this.loggedInKey, username);
    this.usernameSubject.next(username); // Notifie tout abonné
  }

  /**
   * Récupère le nom d’utilisateur connecté.
   */
  getLoggedUsername(): string | null {
    return localStorage.getItem(this.loggedInKey);
  }

  /**
   * Vérifie si un email existe déjà.
   */
  checkEmail(email: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.userApi}/check-email`, { params: { email } });
  }

  /**
   * Déconnexion, supprime l’état dans le localStorage.
   */
  logout() {
    localStorage.removeItem(this.loggedInKey);
    this.usernameSubject.next(null); // Notifie déconnexion
  }
}
