import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CompraResponse } from '../modelos/compras';

@Injectable({ providedIn: 'root' }) // lo marca como servicio
export class ComprasService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/compras';

  // Paso 1: crea una compra vacía (el backend saca la cédula del token)
  crear() {
    return this.http.post<CompraResponse>(this.url, {});
  }

  // Paso 2: agrega un juego a la compra
  agregarJuego(idCompra: string, idJuego: string, cantidad: number) {
    const params = new HttpParams()
      .set('idCompra', idCompra)
      .set('idJuego', idJuego)
      .set('cantidad', cantidad);
    return this.http.patch<void>(`${this.url}/agregarJuego`, null, { params });
  }
}