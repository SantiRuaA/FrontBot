import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Norm } from '../../shared/models/norm.model'

@Injectable({
  providedIn: 'root'
})
export class NormService {
  private apiUrl = 'http://31.97.149.50:3111/norms';

  constructor(private http: HttpClient) { }

  getNorms(): Observable<Norm[]> {
    return this.http.get<Norm[]>(this.apiUrl);
  }

  getNormById(id: string): Observable<Norm> {
    return this.http.get<Norm>(`${this.apiUrl}/${id}`);
  }

  createNorm(normData: Partial<Norm>): Observable<Norm> {
    return this.http.post<Norm>(this.apiUrl, normData);
  }

  updateNorm(id: string, normData: Partial<Norm>): Observable<Norm> {
    return this.http.put<Norm>(`${this.apiUrl}/${id}`, normData);
  }
}