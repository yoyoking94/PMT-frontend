import { Injectable } from '@angular/core';

export interface Task {
  id?: number;
  name: string;
  description?: string;
  dueDate: string; // ISO string ou format `yyyy-MM-dd`
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedTo?: number; // userId
  projectId: number;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {}
