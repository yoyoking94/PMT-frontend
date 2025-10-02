import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Projet {
  id: number;
  nom: string;
  description?: string;
  dateDebut: string;
  createurId: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private baseUrl = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) {}

  createProject(data: Partial<Projet>): Observable<Projet> {
    return this.http.post<Projet>(`${this.baseUrl}/create`, data);
  }

  updateProject(projetId: number, projet: Projet, userId: number): Observable<Projet> {
    const url = `${this.baseUrl}/update/${projetId}?userId=${userId}`;
    return this.http.put<Projet>(url, projet);
  }

  deleteProject(projetId: number, userId: number) {
    return this.http.delete(`${this.baseUrl}/delete/${projetId}/${userId}`);
  }

  getMyProjects(userId: number): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.baseUrl}/myprojects/${userId}`);
  }

  getAllProjects(): Observable<Projet[]> {
    return this.http.get<Projet[]>(`${this.baseUrl}/all`);
  }

  getProjectById(projetId: number): Observable<Projet> {
    return this.http.get<Projet>(`${this.baseUrl}/${projetId}`);
  }
}
