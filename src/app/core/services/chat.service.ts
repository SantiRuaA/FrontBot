import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://31.97.149.50:3111/chat/local'; 

  constructor(private http: HttpClient) {}

  // Envía el prompt y espera la respuesta
  generateResponse(prompt: string): Observable<{ response: string }> {
    const payload = {
        model: "llama3.2",
        prompt: prompt,
        Stream: false,
    }
    return this.http.post<{ response: string }>(this.apiUrl, payload);
  }
}