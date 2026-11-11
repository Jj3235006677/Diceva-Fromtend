import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JuegoMesa, ResultadoPaginado } from '../modelos/juegoMesa';

// Servicio que trae los juegos de mesa desde el backend
@Injectable({ providedIn: 'root' })
export class JuegosService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/juegoMesa';

  // Trae una página del catálogo
  listar(texto = '', pagina = 0, tamanio = 10) {
    let params = new HttpParams()
      .set('pagina', pagina)
      .set('tamanio', tamanio);

    if (texto) {
      params = params.set('texto', texto);
    }

    return this.http.get<ResultadoPaginado<JuegoMesa>>(this.url, { params });
  }//TRAIGAN COMPRA , CREAR COMPRA, PAGINACION, LOGUIN, LISTEN PRODUCTOS, CREAR COMPRAS

  // Trae un solo juego por su id
  obtenerPorId(id: string) {
    return this.http.get<JuegoMesa>(`${this.url}/${id}`);
  }
}