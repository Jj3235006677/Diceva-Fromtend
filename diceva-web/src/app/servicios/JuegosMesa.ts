import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JuegoMesa, RankingJuego, ResultadoPaginado } from '../modelos/juegoMesa';

@Injectable({ providedIn: 'root' })
export class JuegosService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/juegoMesa';

  listar(texto = '', pagina = 0, tamanio = 10) {
    let params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio);

    if (texto) {
      params = params.set('texto', texto);
    }

    return this.http.get<ResultadoPaginado<JuegoMesa>>(this.url, { params });
  }

  obtenerPorId(id: string) {
    return this.http.get<JuegoMesa>(`${this.url}/${id}`);
  }

  ranking() {
    return this.http.get<RankingJuego[]>(`${this.url}/ranking`);
  }
}