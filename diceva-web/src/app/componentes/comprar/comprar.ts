import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { map, switchMap } from 'rxjs';
import { ComprasService } from '../../servicios/compras';

@Component({
  selector: 'app-comprar',
  imports: [ReactiveFormsModule],
  templateUrl: './comprar.html',
  styleUrl: './comprar.css'
})
export class Comprar {
  private comprasService = inject(ComprasService);
  private destroyRef = inject(DestroyRef);

  result = signal('');
  isLoading = signal(false);

  compraForm = inject(FormBuilder).nonNullable.group({
    idJuego: ['', Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]]
  });

  onSubmit(): void {
    if (this.compraForm.invalid) return;
    const { idJuego, cantidad } = this.compraForm.getRawValue();
    this.isLoading.set(true);

    // Paso 1: crear la compra. Paso 2: agregarle el juego.
    this.comprasService.crear()
      .pipe(
        switchMap((compra) =>
          this.comprasService.agregarJuego(compra.id, idJuego, cantidad)
            .pipe(map(() => compra))
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (compra) => {
          this.result.set(`Compra registrada: ${compra.id} (PENDIENTE)`);
          this.compraForm.reset();
          this.isLoading.set(false);
        },
        error: (err) => {
          if (err.status === 404) {
            this.result.set('Error: ese juego no existe');
          } else if (err.status === 400) {
            this.result.set('Error: ' + (err.error?.mensaje ?? 'no se pudo realizar la compra'));
          } else if (err.status === 401 || err.status === 403) {
            this.result.set('Error: tienes que iniciar sesión para realizar la compra');
          } else {
            this.result.set('Ocurrió un error. Intenta de nuevo más tarde');
          }
          this.isLoading.set(false);
        }
      });
  }
}