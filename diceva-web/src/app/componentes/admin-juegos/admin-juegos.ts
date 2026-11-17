import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { JuegosService } from '../../servicios/JuegosMesa';
import { AvisosService } from '../../servicios/avisos';
import { JuegoMesa, JuegoMesaRequest } from '../../modelos/juegoMesa';

@Component({
  selector: 'app-admin-juegos',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './admin-juegos.html',
  styleUrl: './admin-juegos.css',
})
export class AdminJuegos {
  private juegosService = inject(JuegosService);
  private avisos = inject(AvisosService);
  private destroyRef = inject(DestroyRef);

  juegos = signal<JuegoMesa[]>([]);
  guardando = signal(false);
  eliminando = signal<string | null>(null);

  // Proveedor principal de DICEVA (el backend lo pide como UUID)
  private readonly PROVEEDOR_DICEVA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  form = inject(FormBuilder).nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(1)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    minimoJugadores: [2, [Validators.required, Validators.min(1)]],
    maximoJugadores: [4, [Validators.required, Validators.min(1)]],
    edadRecomendada: [8, [Validators.required, Validators.min(0)]],
    complejidad: ['BASICA' as JuegoMesaRequest['complejidad'], Validators.required],
    estado: ['DISPONIBLE' as JuegoMesaRequest['estado'], Validators.required],
    mecanicaDeJuego: ['', Validators.required],
    tematicaDeJuego: ['', Validators.required],
    imagenUrl: ['https://placehold.co/400x250?text=DICEVA', Validators.required],
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.juegosService.listar('', 0, 100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resultado) => this.juegos.set(resultado.contenido),
        error: () => this.avisos.error('No se pudieron cargar los juegos.'),
      });
  }

  invalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  crear(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const f = this.form.getRawValue();
    const juego: JuegoMesaRequest = {
      cedulaProveedor: this.PROVEEDOR_DICEVA,
      nombre: f.nombre.trim(),
      descripcion: f.descripcion.trim(),
      precio: { precioProducto: f.precio },
      stock: f.stock,
      rangoJugadores: { minimoJugadores: f.minimoJugadores, maximoJugadores: f.maximoJugadores },
      complejidad: f.complejidad,
      mecanicaDeJuego: f.mecanicaDeJuego.trim(),
      tematicaDeJuego: f.tematicaDeJuego.trim(),
      edadRecomendada: f.edadRecomendada,
      imagenUrl: f.imagenUrl.trim(),
      estado: f.estado,
    };

    this.guardando.set(true);

    this.juegosService.crear(juego)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (creado) => {
          this.avisos.exito(`Juego "${creado.nombre}" agregado al catálogo.`);
          this.form.reset();
          this.guardando.set(false);
          this.cargar();
        },
        error: (err) => {
          this.avisos.error(err.error?.mensaje ?? 'No se pudo crear el juego.');
          this.guardando.set(false);
        },
      });
  }

  eliminar(juego: JuegoMesa): void {
    if (!confirm(`¿Eliminar "${juego.nombre}" del catálogo?`)) return;

    this.eliminando.set(juego.id);

    this.juegosService.eliminar(juego.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.juegos.update(lista => lista.filter(j => j.id !== juego.id));
          this.avisos.info(`"${juego.nombre}" ya no aparece en el catálogo.`);
          this.eliminando.set(null);
        },
        error: (err) => {
          this.avisos.error(err.error?.mensaje ?? 'No se pudo eliminar el juego.');
          this.eliminando.set(null);
        },
      });
  }
}