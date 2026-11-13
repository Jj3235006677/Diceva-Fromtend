import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, timer } from 'rxjs';
import { ComprasService } from '../../servicios/compras';
import { JuegosService } from '../../servicios/JuegosMesa';
import { AvisosService } from '../../servicios/avisos';
import { CompraResponse } from '../../modelos/compras';

@Component({
  selector: 'app-confirmar-compras',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './confirmar-compras.html',
  styleUrl: './confirmar-compras.css',
})
export class ConfirmarCompras {
  private comprasService = inject(ComprasService);
  private juegosService = inject(JuegosService);
  private avisos = inject(AvisosService);
  private destroyRef = inject(DestroyRef);

  compras = signal<CompraResponse[]>([]);
  cargando = signal(true);
  confirmando = signal<string | null>(null);
  nuevas = signal<Set<string>>(new Set());

  private nombres = signal<Record<string, string>>({});
  private vistas = new Set<string>();
  private primeraCarga = true;
  private errorMostrado = false;

  constructor() {
    this.cargarNombres();

    // Revisa las compras pendientes al entrar y luego cada 3 segundos
    timer(0, 3000)
      .pipe(
        switchMap(() => this.comprasService.pendientes().pipe(
          catchError((err) => {
            this.mostrarError(err);
            return of(null);
          })
        )),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(compras => {
        if (compras) {
          this.marcarNuevas(compras);
          this.compras.set(compras);
        }
        this.cargando.set(false);
      });
  }

  cargar(): void {
    this.comprasService.pendientes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (compras) => {
          this.marcarNuevas(compras);
          this.compras.set(compras);
        },
        error: (err) => this.mostrarError(err),
      });
  }

  confirmar(compra: CompraResponse): void {
    this.confirmando.set(compra.id);

    this.comprasService.confirmar(compra.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.compras.update(lista => lista.filter(c => c.id !== compra.id));
          this.avisos.exito('Compra confirmada: ahora está aprobada.');
          this.confirmando.set(null);
        },
        error: (err) => {
          this.avisos.error(err.error?.mensaje ?? 'No se pudo confirmar la compra.');
          this.confirmando.set(null);
        },
      });
  }

  cancelar(compra: CompraResponse): void {
    if (!confirm('¿Reembolsar esta compra? Se le devuelve el dinero al cliente y las unidades vuelven al catálogo.')) return;

    this.confirmando.set(compra.id);

    this.comprasService.cancelar(compra.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.compras.update(lista => lista.filter(c => c.id !== compra.id));
          this.avisos.info('Compra reembolsada: el dinero se devuelve y el stock volvió al catálogo.');
          this.confirmando.set(null);
        },
        error: (err) => {
          this.avisos.error(err.error?.mensaje ?? 'No se pudo reembolsar la compra.');
          this.confirmando.set(null);
        },
      });
  }

  nombreJuego(id: string): string {
    return this.nombres()[id] ?? 'Juego';
  }

  esNueva(id: string): boolean {
    return this.nuevas().has(id);
  }

  // Detecta las compras que no estaban antes, avisa y las resalta unos segundos
  private marcarNuevas(compras: CompraResponse[]): void {
    const recienLlegadas = compras.filter(compra => !this.vistas.has(compra.id));
    compras.forEach(compra => this.vistas.add(compra.id));

    if (this.primeraCarga) {
      this.primeraCarga = false;
      return;
    }

    if (recienLlegadas.length > 0) {
      const ids = recienLlegadas.map(compra => compra.id);
      this.avisos.info(recienLlegadas.length === 1
        ? '¡Llegó una compra nueva para confirmar!'
        : `¡Llegaron ${recienLlegadas.length} compras nuevas para confirmar!`);

      this.nuevas.update(actual => new Set([...actual, ...ids]));
      setTimeout(() => {
        this.nuevas.update(actual => new Set([...actual].filter(id => !ids.includes(id))));
      }, 4000);
    }
  }

  private mostrarError(err: any): void {
    if (this.errorMostrado) return;
    this.errorMostrado = true;
    this.avisos.error(err.status === 403
      ? 'Solo el administrador puede ver esta página.'
      : 'No se pudieron cargar las compras.');
  }

  private cargarNombres(): void {
    this.juegosService.listar('', 0, 100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(resultado => {
        const mapa: Record<string, string> = {};
        resultado.contenido.forEach(juego => mapa[juego.id] = juego.nombre);
        this.nombres.set(mapa);
      });
  }
}