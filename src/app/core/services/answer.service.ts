import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnswerPayload {
  role: string;
  content: string;
  userId: string;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnswerService {
  private apiUrl = 'http://31.97.149.50:3111/answers';

  constructor(private http: HttpClient) { }

  saveAnswer(payload: AnswerPayload): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }
}