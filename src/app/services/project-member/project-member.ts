import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectMemberService {
  private apiUrl = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) {}

  inviteMember(
    projectId: number,
    email: string,
    role: string,
    requesterId: number
  ): Observable<any> {
    const params = { email, role, requesterId: requesterId.toString() };
    return this.http.post(`${this.apiUrl}/${projectId}/invite`, null, { params });
  }

  getProjectMembers(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${projectId}/members`);
  }

  checkIfUserIsMember(
    projectId: number,
    email: string
  ): Observable<{ exists: boolean; isMember: boolean }> {
    return this.http.get<{ exists: boolean; isMember: boolean }>(
      `${this.apiUrl}/${projectId}/isMember`,
      { params: { email } }
    );
  }

  deleteMember(projectId: number, memberId: number, requesterId: number): Observable<any> {
    const params = { requesterId: requesterId.toString() };
    return this.http.delete(`${this.apiUrl}/${projectId}/members/${memberId}`, { params });
  }
}
