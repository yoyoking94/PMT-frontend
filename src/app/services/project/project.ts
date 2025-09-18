import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Interface représentant un projet.
 */
export interface Project {
  id?: number; // ID optionnel, généré par backend
  name: string; // Nom du projet (obligatoire)
  description?: string; // Description optionnelle
  startDate: string; // Date de début (format ISO string)
  createBy: number; // ID utilisateur créateur du projet
}

/**
 * Service Angular pour gérer les opérations CRUD sur les projets via API REST.
 */
@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = 'http://localhost:8080/api/projects'; // URL base API projets

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste complète des projets.
   * @returns Observable émettant tableau de projets
   */
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  /**
   * Crée un nouveau projet.
   * @param project Données du projet à créer
   * @returns Observable émettant le projet créé avec ID
   */
  createProject(project: Project): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  /**
   * Met à jour un projet existant via son ID.
   * @param projectId ID du projet à modifier
   * @param project Données mises à jour
   * @returns Observable émettant le projet modifié
   */
  updateProject(projectId: number, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${projectId}`, project);
  }

  /**
   * Supprime un projet par son ID, avec vérification utilisateur.
   * @param projectId ID du projet à supprimer
   * @param userId ID de l'utilisateur demandant la suppression (pour contrôle)
   * @returns Observable émettant la réponse du serveur
   */
  deleteProject(projectId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${projectId}?userId=${userId}`);
  }
}
