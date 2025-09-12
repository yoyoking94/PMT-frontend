import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Task {
  id?: number;
  name: string;
  description?: string;
  dueDate: string; // ISO string
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedTo?: number;
  project: { id: number };
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/api/tasks';

  constructor(private http: HttpClient) {}

  getTasksByProject(projectId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/project/${projectId}`);
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(task: Task): Observable<Task> {
    if (!task.id) {
      throw new Error('Task id is required for update');
    }
    // Ici on suppose que tu ajoutes le paramètre userId par query string (adapter le backend si besoin)
    const userId = localStorage.getItem('userId');
    return this.http.put<Task>(`${this.apiUrl}/${task.id}?userId=${userId}`, task);
  }
}
