import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CompraResponse } from '../modelos/compras';

@Injectable({ providedIn: 'root' })
export class ComprasService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/compras';

  crear() {
    return this.http.post<CompraResponse>(this.url, {});
  }

  obtenerPorId(id: string) {
    return this.http.get<CompraResponse>(`${this.url}/${id}`);
  }

  agregarJuego(idCompra: string, idJuego: string, cantidad: number) {
    const params = new HttpParams()
      .set('idCompra', idCompra)
      .set('idJuego', idJuego)
      .set('cantidad', cantidad);
    return this.http.patch<void>(`${this.url}/agregarJuego`, null, { params });
  }

  aplicarCupon(idCompra: string, codigo: string) {
    const params = new HttpParams().set('codigo', codigo);
    return this.http.patch<CompraResponse>(`${this.url}/${idCompra}/cupon`, null, { params });
  }
}