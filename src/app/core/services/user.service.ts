import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '../../shared/models/user.model';

// Interfaz para la respuesta de la lista de usuarios
interface UserApiResponse {
    _id: string;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    dpto_residencia: string;
    correo_sena: string;
    rol_asignado: string;
    estado_actual: boolean;
    [key: string]: any;
}

interface CreateUserPayload {
  tenantId: number;
  tipo_de_identificacion: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  fecha_nacimiento: string;
  pais_residencia: string;
  dpto_residencia: string;
  mncpio_residencia: string;
  direccion_residencia: string;
  correo_sena: string;
  correo_particular?: string;
  telefono_entidad?: string;
  extension_telefonica?: string;
  numero_celular: string;
  estado_actual: boolean;
  fecha_inicio_contrato: string;
  fecha_fin_contrato: string;
  numero_contrato?: string;
  usuario_asignado: string;
  rol_asignado: string;
  password?: string;
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

    createUser(userData: any): Observable<User> {
        const headers = new HttpHeaders({
        'Content-Type': 'application/json'
        });
        return this.http.post<any>(this.apiUrl, userData, { headers: headers }).pipe(
        map(createdApiUser => this.mapApiToUser(createdApiUser))
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
            role: apiUser.rol_asignado,
            status: apiUser.estado_actual,
            image: '../assets/logo.png'
        };
    }
}