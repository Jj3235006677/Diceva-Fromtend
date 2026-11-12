import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CuponResponse } from '../modelos/cupones';

@Injectable({ providedIn: 'root' })
export class CuponesService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/cupones';

  consultar(codigo: string) {
    return this.http.get<CuponResponse>(`${this.url}/${encodeURIComponent(codigo)}`);
  }
}