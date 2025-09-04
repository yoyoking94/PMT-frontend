import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface SignupData {
  username: string;
  email: string;
  password: string;
}

interface SigninData {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth'; // met à jour l'URL si besoin

  constructor(private http: HttpClient) {}

  signin(data: SigninData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signin`, data);
  }

  signup(data: SignupData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, data);
  }
}
