import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Interface représentant une tâche liée à un projet.
 */
export interface Task {
  id?: number; // ID optionnel, généré côté backend
  name: string; // Nom de la tâche
  description?: string; // Description facultative
  dueDate: string; // Date d’échéance au format ISO string
  priority: 'Basse' | 'Moyenne' | 'Haute'; // Priorité
  assignedTo?: number; // ID utilisateur assigné (optionnel)
  assignedToName?: string; // nouveau champ pour nom de l’assigné
  project: { id: number }; // Projet parent (minimum ID requis)
  status: 'etudes' | 'en cours' | 'test' | 'fait'; // Nouveau champ statut
}

/**
 * Service pour gérer les requêtes liées aux tâches via API REST.
 */
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/api/tasks'; // URL base des tâches

  constructor(private http: HttpClient) {}

  /**
   * Récupère toutes les tâches liées à un projet.
   * @param projectId ID du projet
   * @returns Observable d’un tableau de tâches
   */
  getTasksByProject(projectId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/project/${projectId}`);
  }

  /**
   * Crée une nouvelle tâche.
   * @param task Données de la tâche à créer
   * @returns Observable émettant la tâche créée
   */
  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  /**
   * Met à jour une tâche existante.
   * @param task Tâche modifiée (doit contenir un ID)
   * @returns Observable émettant la tâche mise à jour
   * @throws Erreur si l’ID de la tâche est absent
   */
  updateTask(task: Task): Observable<Task> {
    if (!task.id) {
      throw new Error('Task id is required for update');
    }
    // Préparer l'objet à envoyer
    const taskToSend = {
      ...task,
      assignedTo: task.assignedTo ? { id: task.assignedTo } : null,
      project: typeof task.project === 'number' ? { id: task.project } : task.project,
    };
    const userId = localStorage.getItem('userId');
    return this.http.put<Task>(`${this.apiUrl}/${task.id}?userId=${userId}`, taskToSend);
  }
}
