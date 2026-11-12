import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { ComprasService } from '../../servicios/compras';
import { JuegosService } from '../../servicios/JuegosMesa';
import { CuponesService } from '../../servicios/cupones';
import { AvisosService } from '../../servicios/avisos';
import { JuegoMesa } from '../../modelos/juegoMesa';
import { CompraResponse } from '../../modelos/compras';
import { CuponResponse } from '../../modelos/cupones';

@Component({
  selector: 'app-comprar',
  imports: [ReactiveFormsModule, DecimalPipe, RouterLink],
  templateUrl: './comprar.html',
  styleUrl: './comprar.css'
})
export class Comprar {
  private comprasService = inject(ComprasService);
  private juegosService = inject(JuegosService);
  private cuponesService = inject(CuponesService);
  private avisos = inject(AvisosService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  juego = signal<JuegoMesa | null>(null);
  compraCreada = signal<CompraResponse | null>(null);
  isLoading = signal(false);

  cupon = signal<CuponResponse | null>(null);
  errorCupon = signal('');
  verificandoCupon = signal(false);

  compraForm = inject(FormBuilder).nonNullable.group({
    cantidad: [1, [Validators.required, Validators.min(1)]],
    cupon: ['']
  });

  private cantidad = toSignal(this.compraForm.controls.cantidad.valueChanges, { initialValue: 1 });

  subtotal = computed(() => (this.juego()?.precio.precioProducto ?? 0) * (this.cantidad() || 0));

  total = computed(() => {
    const c = this.cupon();
    return c ? Math.floor(this.subtotal() * (100 - c.porcentaje) / 100) : this.subtotal();
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

    this.compraForm.controls.cupon.valueChanges
      .pipe(
        map(valor => valor.trim()),
        tap(() => {
          this.cupon.set(null);
          this.errorCupon.set('');
        }),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(codigo => {
          if (!codigo) {
            return of(null);
          }
          this.verificandoCupon.set(true);
          return this.cuponesService.consultar(codigo).pipe(
            catchError(err => {
              this.errorCupon.set(err.error?.mensaje ?? 'Ese cupón no es válido.');
              return of(null);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(cupon => {
        this.cupon.set(cupon);
        this.verificandoCupon.set(false);
      });
  }

  onSubmit(): void {
    const juego = this.juego();
    if (!juego || this.compraForm.invalid) return;

    const cantidad = this.compraForm.getRawValue().cantidad;
    const cuponValido = this.cupon();
    this.isLoading.set(true);

    this.comprasService.crear()
      .pipe(
        switchMap((compra) =>
          this.comprasService.agregarJuego(compra.id, juego.id, cantidad)
            .pipe(switchMap(() => cuponValido
              ? this.comprasService.aplicarCupon(compra.id, cuponValido.codigo)
              : this.comprasService.obtenerPorId(compra.id)))
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
          this.avisos.error(this.traducirError(err));
          this.isLoading.set(false);
        }
      });
  }

  private traducirError(err: any): string {
    if (err.status === 400) {
      return err.error?.mensaje ?? 'Revisa los datos e intenta de nuevo.';
    }
    if (err.status === 404) {
      return 'No encontramos lo que buscabas.';
    }
    if (err.status === 401 || err.status === 403) {
      return 'Inicia sesión para poder comprar.';
    }
    return 'Ocurrió un error. Intenta de nuevo más tarde.';
  }
}