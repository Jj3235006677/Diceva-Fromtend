import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, timer } from 'rxjs';
import { ComprasService } from '../../servicios/compras';
import { JuegosService } from '../../servicios/JuegosMesa';
import { AvisosService } from '../../servicios/avisos';
import { CompraResponse, EstadoPago } from '../../modelos/compras';

@Component({
  selector: 'app-mis-compras',
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './mis-compras.html',
  styleUrl: './mis-compras.css',
})
export class MisCompras {
  private comprasService = inject(ComprasService);
  private juegosService = inject(JuegosService);
  private avisos = inject(AvisosService);
  private destroyRef = inject(DestroyRef);

  compras = signal<CompraResponse[]>([]);
  cargando = signal(true);
  cancelando = signal<string | null>(null);
  private nombres = signal<Record<string, string>>({});
  private estadosAnteriores = new Map<string, EstadoPago>();

  constructor() {
    this.cargarNombres();

    // Pide las compras al entrar y luego cada 10 segundos
    timer(0, 10000)
      .pipe(
        switchMap(() => this.comprasService.misCompras().pipe(catchError(() => of(null)))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(compras => {
        if (compras) {
          this.avisarCambios(compras);
          this.compras.set(compras);
        }
        this.cargando.set(false);
      });
  }

  cancelar(compra: CompraResponse): void {
    if (!confirm('¿Quieres que te devolvamos el dinero de esta compra?')) return;

    this.cancelando.set(compra.id);

    this.comprasService.cancelar(compra.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cancelada) => {
          this.compras.update(lista => lista.map(c => c.id === cancelada.id ? cancelada : c));
          this.estadosAnteriores.set(cancelada.id, cancelada.estadoPago);
          this.avisos.info('Listo: tu compra quedó reembolsada y te devolvemos el dinero.');
          this.cancelando.set(null);
        },
        error: (err) => {
          this.avisos.error(err.error?.mensaje ?? 'No se pudo reembolsar la compra.');
          this.cancelando.set(null);
        },
      });
  }

  nombreJuego(id: string): string {
    return this.nombres()[id] ?? 'Juego';
  }

  textoEstado(estado: EstadoPago): string {
    switch (estado) {
      case 'PENDIENTE':   return 'Pendiente';
      case 'APROBADO':    return 'Aprobada';
      case 'REEMBOLSADO': return 'Reembolsada';
      default:            return estado;
    }
  }

  claseEstado(estado: EstadoPago): string {
    switch (estado) {
      case 'PENDIENTE':   return 'text-bg-warning';
      case 'APROBADO':    return 'text-bg-success';
      case 'REEMBOLSADO': return 'text-bg-secondary';
      default:            return 'text-bg-light';
    }
  }

  iconoEstado(estado: EstadoPago): string {
    switch (estado) {
      case 'PENDIENTE':   return 'fa-hourglass-half';
      case 'APROBADO':    return 'fa-circle-check';
      case 'REEMBOLSADO': return 'fa-rotate-left';
      default:            return 'fa-circle';
    }
  }

  // Si una compra pendiente fue aprobada o cancelada por el admin, avisa al usuario
  private avisarCambios(compras: CompraResponse[]): void {
    compras.forEach(compra => {
      const antes = this.estadosAnteriores.get(compra.id);
      const juego = compra.detalles.length > 0
        ? this.nombreJuego(compra.detalles[0].idJuego)
        : 'tus juegos';
      if (antes === 'PENDIENTE' && compra.estadoPago === 'APROBADO') {
        this.avisos.exito(`¡Tu compra de ${juego} fue aprobada!`);
      }
      if (antes === 'PENDIENTE' && compra.estadoPago === 'REEMBOLSADO') {
        this.avisos.info(`DICEVA reembolsó tu compra de ${juego}.`);
      }
      this.estadosAnteriores.set(compra.id, compra.estadoPago);
    });
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