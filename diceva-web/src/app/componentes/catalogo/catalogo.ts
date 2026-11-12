import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  private destroyRef = inject(DestroyRef);

  juegos = signal<JuegoMesa[]>([]);
  pagina = signal(0);
  totalPaginas = signal(0);
  private tamanio = 4;

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.juegosService.listar('', this.pagina(), this.tamanio)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(resultado => {
        this.juegos.set(resultado.contenido);
        this.totalPaginas.set(resultado.totalPaginas);
      });
  }

  anterior(): void {
    if (this.pagina() > 0) {
      this.pagina.update(p => p - 1);
      this.cargar();
    }
  }

  siguiente(): void {
    if (this.pagina() < this.totalPaginas() - 1) {
      this.pagina.update(p => p + 1);
      this.cargar();
    }
  }

  badgeEstado(estado: EstadoJuego): string {
    switch (estado) {
      case 'DISPONIBLE': return 'text-bg-success';
      case 'PREVENTA':   return 'text-bg-warning';
      case 'AGOTADO':    return 'text-bg-secondary';
      default:           return 'text-bg-light';
    }
  }

  imagenRota(evento: Event): void {
    const img = evento.target as HTMLImageElement;
    img.src = 'https://placehold.co/400x250?text=DICEVA';
  }
}