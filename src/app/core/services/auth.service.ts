import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz para la respuesta del login
export interface LoginResponse {
  accessToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // OJO: REEMPLAZA ESTA URL CON LA DE TU API REAL
  private apiUrl = 'http://31.97.149.50:3111/auth'; 

  constructor(private http: HttpClient) {}

  login(correo_sena: string, password: string): Observable<LoginResponse> {
    const body = { correo_sena, password };
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, body);
  }
}