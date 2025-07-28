import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://31.97.149.50:3111/chat/xai'; 

  constructor(private http: HttpClient) {}

  generateResponse(prompt: string): Observable<{ response: string }> {
    const body = { prompt };
    return this.http.post<{ response: string }>(this.apiUrl, body);
  }
}