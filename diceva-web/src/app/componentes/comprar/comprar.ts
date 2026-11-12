import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map, switchMap } from 'rxjs';
import { ComprasService } from '../../servicios/compras';
import { JuegosService } from '../../servicios/JuegosMesa';
import { AvisosService } from '../../servicios/avisos';
import { JuegoMesa } from '../../modelos/juegoMesa';
import { CompraResponse } from '../../modelos/compras';

@Component({
  selector: 'app-comprar',
  imports: [ReactiveFormsModule, DecimalPipe, RouterLink],
  templateUrl: './comprar.html',
  styleUrl: './comprar.css'
})
export class Comprar {
  private comprasService = inject(ComprasService);
  private juegosService = inject(JuegosService);
  private avisos = inject(AvisosService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  juego = signal<JuegoMesa | null>(null);
  compraCreada = signal<CompraResponse | null>(null);
  isLoading = signal(false);

  compraForm = inject(FormBuilder).nonNullable.group({
    cantidad: [1, [Validators.required, Validators.min(1)]]
  });

  constructor() {
    const id = this.route.snapshot.queryParamMap.get('juego');
    if (id) {
      this.juegosService.obtenerPorId(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (juego) => this.juego.set(juego),
          error: () => this.avisos.error('Ese juego no existe.')
        });
    }
  }

  onSubmit(): void {
    const juego = this.juego();
    if (!juego || this.compraForm.invalid) return;

    const cantidad = this.compraForm.getRawValue().cantidad;
    this.isLoading.set(true);

    this.comprasService.crear()
      .pipe(
        switchMap((compra) =>
          this.comprasService.agregarJuego(compra.id, juego.id, cantidad)
            .pipe(map(() => compra))
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (compra) => {
          this.compraCreada.set(compra);
          this.avisos.exito(`Compra registrada: ${cantidad} x ${juego.nombre}.`);
          this.isLoading.set(false);
        },
        error: (err) => {
          if (err.status === 400) {
            this.avisos.error(err.error?.mensaje ?? 'Revisa los datos de la compra.');
          } else if (err.status === 404) {
            this.avisos.error('Ese juego no existe.');
          } else if (err.status === 401 || err.status === 403) {
            this.avisos.error('Inicia sesión para poder comprar.');
          } else {
            this.avisos.error('Ocurrió un error. Intenta de nuevo más tarde.');
          }
          this.isLoading.set(false);
        }
      });
  }
}