
import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { JuegosService } from '../../servicios/JuegosMesa';
import { EstadoJuego, JuegoMesa } from '../../modelos/juegoMesa';
 
@Component({
  imports: [DecimalPipe, RouterLink],
  selector: 'app-catalogo',
  styleUrl: './catalogo.css',
  templateUrl: './catalogo.html',
})
export class Catalogo {
  private juegosService = inject(JuegosService);
 
  juegos = toSignal(
    this.juegosService.listar().pipe(map((pagina) => pagina.contenido)),
    { initialValue: [] as JuegoMesa[] }
  );
 
  // Color de la etiqueta según el estado del juego
  badgeEstado(estado: EstadoJuego): string {
    switch (estado) {
      case 'DISPONIBLE': return 'text-bg-success';
      case 'PREVENTA':   return 'text-bg-warning';
      case 'AGOTADO':    return 'text-bg-secondary';
      default:           return 'text-bg-light';
    }
  }
 
  // Si la foto no carga, muestra una imagen de reemplazo
  imagenRota(evento: Event): void {
    const img = evento.target as HTMLImageElement;
    img.src = 'https://placehold.co/400x250?text=DICEVA';
  }
}
 
