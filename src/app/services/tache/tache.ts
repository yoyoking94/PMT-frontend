import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Tache {
  id?: number;
  projetId: number;
  nom: string;
  description?: string;
  dateEcheance?: string; // YYYY-MM-DD
  priorite: 'faible' | 'moyenne' | 'haute';
  statut?: 'a_faire' | 'en_cours' | 'terminee' | 'bloquee';
  createurId?: number;
  membreId?: number; // Id du membre assigné (optionnel)
}

@Injectable({
  providedIn: 'root',
})
export class TacheService {
  private baseUrl = 'http://localhost:8080/api/taches';

  constructor(private http: HttpClient) {}

  getTachesByProjet(projetId: number): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.baseUrl}/projet/${projetId}`);
  }

  creerTache(tache: Partial<Tache>): Observable<Tache> {
    // Envoie directement l'objet JSON sans transformation DTO
    return this.http.post<Tache>(`${this.baseUrl}/create`, tache);
  }

  updateTache(tacheId: number, data: Partial<Tache>, userId: number, userRole: string) {
    const params = {
      userId: userId.toString(),
      userRole: userRole,
    };
    return this.http.put<Tache>(`${this.baseUrl}/update/${tacheId}`, data, { params });
  }

  deleteTache(tacheId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${tacheId}`);
  }

  getTacheById(tacheId: number) {
    return this.http.get<Tache>(`${this.baseUrl}/${tacheId}`);
  }
}
