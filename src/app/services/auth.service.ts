import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Etat de connexion de l'utilisateur suivi en interne
  private loggedIn = new BehaviorSubject<boolean>(false);

  constructor() {}

  // Observable public pour suivre l'état de connexion
  get isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  // Méthode de connexion simple (simulation)
  login(username: string, password: string): Observable<boolean> {
    // Simulation: connexion réussie si username === 'user' et password === 'password'
    if (username === 'user' && password === 'password') {
      this.loggedIn.next(true);
      return of(true); // Observable qui émet true
    } else {
      this.loggedIn.next(false);
      return of(false); // Observable qui émet false
    }
  }

  // Méthode de déconnexion
  logout(): void {
    this.loggedIn.next(false);
  }
}
