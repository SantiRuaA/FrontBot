import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '../../shared/models/user.model';

// Interfaz que representa la respuesta EXACTA de tu API
interface UserApiResponse {
    _id: string;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    dpto_residencia: string;
    correo_sena: string;
    rol_asigando: string;
    estado_actual: boolean;
    [key: string]: any;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://31.97.149.50:3111/users';

    constructor(private http: HttpClient) { }

    getUsers(): Observable<User[]> {
        return this.http.get<UserApiResponse[]>(this.apiUrl).pipe(
            map(apiResponse => apiResponse.map(apiUser => this.mapApiToUser(apiUser)))
        );
    }

    private mapApiToUser(apiUser: UserApiResponse): User {
        const fullName = [
            apiUser.primer_nombre,
            apiUser.segundo_nombre,
            apiUser.primer_apellido,
            apiUser.segundo_apellido
        ].filter(Boolean).join(' ');

        return {
            id: apiUser._id,
            fullName: fullName,
            department: apiUser.dpto_residencia,
            email: apiUser.correo_sena,
            role: apiUser.rol_asigando,
            status: apiUser.estado_actual,
            image: '../assets/logo.png'
        };
    }
}