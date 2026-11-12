import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginRequest, TokenResponse } from '../modelos/auth';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/auth/login';

  isAuthenticated = signal(!!localStorage.getItem('token'));
  nombre = signal(this.leerNombre());

  login(credenciales: LoginRequest) {
    return this.http.post<TokenResponse>(this.url, credenciales);
  }

  guardarSesion(respuesta: TokenResponse): void {
    localStorage.setItem('token', respuesta.token);
    localStorage.setItem('roles', JSON.stringify(respuesta.roles));
    this.nombre.set(this.leerNombre());
    this.isAuthenticated.set(true);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    this.nombre.set('');
    this.isAuthenticated.set(false);
  }

  private leerNombre(): string {
    const token = localStorage.getItem('token');
    if (!token) {
      return '';
    }
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const datos = JSON.parse(atob(payload));
      const usuario: string = datos.sub.split('@')[0];
      return usuario.charAt(0).toUpperCase() + usuario.slice(1);
    } catch {
      return '';
    }
  }
}