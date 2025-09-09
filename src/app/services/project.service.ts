import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Project {
  id?: number;
  name: string;
  description?: string;
  startDate: string; // format YYYY-MM-DD
  createBy: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) {}

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  createProject(project: Project): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }
}
