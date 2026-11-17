import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, interval, of, switchMap } from 'rxjs';
import { JuegosService } from '../../servicios/JuegosMesa';
import { AvisosService } from '../../servicios/avisos';
import { EstadoJuego, JuegoMesa, ResultadoPaginado } from '../../modelos/juegoMesa';
import { MasVendidos } from '../mas-vendidos/mas-vendidos';
import { LanzaDados } from '../lanza-dados/lanza-dados';

@Component({
  selector: 'app-catalogo',
  imports: [DecimalPipe, RouterLink, MasVendidos, LanzaDados],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo {
  private juegosService = inject(JuegosService);
  private avisos = inject(AvisosService);

  // En qué página estoy y qué estoy escribiendo
  readonly tamanio = 4;
  pagina = signal(0);
  texto = signal('');

  // Reloj: hace "tic" cada 10 segundos para refrescar el catálogo solo
  private reloj = toSignal(interval(10000), { initialValue: 0 });

  // Lo que se busca de verdad: espera 400 ms después de la última letra
  busqueda = toSignal(
    toObservable(this.texto).pipe(
      debounceTime(400),
      distinctUntilChanged()
    ),
    { initialValue: '' }
  );

  // Junta la página, la búsqueda y el reloj en un solo objeto
  private consulta = computed(() => ({
    pagina: this.pagina(),
    busqueda: this.busqueda(),
    tic: this.reloj(),
  }));

  // Cada vez que cambia la consulta, le pide al backend esa página
  respuesta = toSignal(
    toObservable(this.consulta).pipe(
      switchMap(c =>
        this.juegosService.listar(c.busqueda.trim(), c.pagina, this.tamanio).pipe(
          catchError(() => {
            this.avisos.error('No pudimos cargar el catálogo.');
            return of(null);
          })
        )
      )
    ),
    { initialValue: null as ResultadoPaginado<JuegoMesa> | null }
  );

  juegos = computed(() => this.respuesta()?.contenido ?? []);
  totalPaginas = computed(() => this.respuesta()?.totalPaginas ?? 0);
  total = computed(() => this.respuesta()?.totalElementos ?? 0);
  esPrimera = computed(() => this.pagina() === 0);
  esUltima = computed(() => this.pagina() >= this.totalPaginas() - 1);

  escribir(valor: string): void {
    this.texto.set(valor);
    this.pagina.set(0);
  }

  anterior(): void { this.pagina.update(p => p - 1); }
  siguiente(): void { this.pagina.update(p => p + 1); }

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