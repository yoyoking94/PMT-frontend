import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HelloService {
  private apiUrl = 'http://localhost:8080/api/hello';

  constructor(private http: HttpClient) {}

  getHello(): Observable<string> {
    return this.http.get(this.apiUrl, { responseType: 'text' });
  }
}
