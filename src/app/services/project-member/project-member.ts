import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Service pour gérer les membres d'un projet via API REST.
 */
@Injectable({
  providedIn: 'root',
})
export class ProjectMemberService {
  private apiUrl = 'http://localhost:8080/api/projects'; // URL de base de l’API projets

  constructor(private http: HttpClient) {}

  /**
   * Invite un utilisateur à rejoindre un projet avec un rôle donné.
   * @param projectId ID du projet
   * @param email Email de l’utilisateur à inviter
   * @param role Rôle à attribuer (ex: ADMIN, MEMBER, OBSERVER)
   * @param requesterId ID de l’utilisateur qui invite (pour contrôle)
   * @returns Observable d’une réponse serveur
   */
  inviteMember(
    projectId: number,
    email: string,
    role: string,
    requesterId: number
  ): Observable<any> {
    const params = { email, role, requesterId: requesterId.toString() };
    return this.http.post(`${this.apiUrl}/${projectId}/invite`, null, { params });
  }

  /**
   * Récupère la liste des membres d’un projet.
   * @param projectId ID du projet
   * @returns Observable émettant un tableau des membres
   */
  getProjectMembers(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${projectId}/members`);
  }

  /**
   * Vérifie si un utilisateur avec l’email donné existe et s’il est membre du projet.
   * @param projectId ID du projet
   * @param email Email à vérifier
   * @returns Observable émettant un objet { exists, isMember }
   */
  checkIfUserIsMember(
    projectId: number,
    email: string
  ): Observable<{ exists: boolean; isMember: boolean }> {
    return this.http.get<{ exists: boolean; isMember: boolean }>(
      `${this.apiUrl}/${projectId}/isMember`,
      { params: { email } }
    );
  }

  /**
   * Supprime un membre d’un projet.
   * @param projectId ID du projet
   * @param memberId ID du membre à supprimer
   * @param requesterId ID de la personne qui effectue la suppression (contrôle)
   * @returns Observable d’une réponse serveur
   */
  deleteMember(projectId: number, memberId: number, requesterId: number): Observable<any> {
    const params = { requesterId: requesterId.toString() };
    return this.http.delete(`${this.apiUrl}/${projectId}/members/${memberId}`, { params });
  }
}
