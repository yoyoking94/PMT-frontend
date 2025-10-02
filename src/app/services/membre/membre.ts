import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MembreProjet {
  id?: number;
  projetId: number;
  utilisateurId: number;
  role: string;
  email?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MembreProjetService {
  private baseUrl = 'http://localhost:8080/api/membres';

  constructor(private http: HttpClient) {}

  getMembresByProjet(projetId: number): Observable<MembreProjet[]> {
    return this.http.get<MembreProjet[]>(`${this.baseUrl}/projet/${projetId}`);
  }

  addMembreByEmail(
    projetId: number,
    email: string,
    role: string,
    userId: number
  ): Observable<MembreProjet> {
    const params = new HttpParams()
      .set('projetId', projetId.toString())
      .set('email', email)
      .set('role', role)
      .set('userId', userId.toString());
    return this.http.post<MembreProjet>(`${this.baseUrl}/add`, null, { params });
  }

  removeMembre(membreId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${membreId}`);
  }
}
