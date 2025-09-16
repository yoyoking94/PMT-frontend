import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Service simple pour récupérer un message "hello" depuis l'API backend.
 */
@Injectable({
  providedIn: 'root',
})
export class HelloService {
  private apiUrl = 'http://localhost:8080/api/hello'; // URL de l’endpoint API

  constructor(private http: HttpClient) {}

  /**
   * Effectue une requête GET et retourne un Observable de texte.
   */
  getHello(): Observable<string> {
    return this.http.get(this.apiUrl, { responseType: 'text' });
  }
}
