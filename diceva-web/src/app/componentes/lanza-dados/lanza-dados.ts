import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { JuegosService } from '../../servicios/JuegosMesa';
import { JuegoMesa } from '../../modelos/juegoMesa';

interface EstiloJuego {
  fondo: string;
  color: string;
  icono: string;
}

interface Confeti {
  izquierda: number;
  color: string;
  retraso: number;
}

const ESTILOS: Record<string, EstiloJuego> = {
  'Catan':          { fondo: '#FAEEDA', color: '#633806', icono: 'fa-chess-rook' },
  'Dixit':          { fondo: '#FBEAF0', color: '#72243E', icono: 'fa-clone' },
  'Carcassonne':    { fondo: '#EAF3DE', color: '#27500A', icono: 'fa-map' },
  'Ticket to Ride': { fondo: '#E6F1FB', color: '#0C447C', icono: 'fa-train' },
  'Pandemic':       { fondo: '#FCEBEB', color: '#791F1F', icono: 'fa-virus' },
  'Azul':           { fondo: '#EEEDFE', color: '#3C3489', icono: 'fa-table-cells' },
  'Chess':          { fondo: '#F1EFE8', color: '#444441', icono: 'fa-chess-knight' },
  'Monopoly':       { fondo: '#E1F5EE', color: '#085041', icono: 'fa-house' },
};

const ESTILO_POR_DEFECTO: EstiloJuego = { fondo: '#E6F1FB', color: '#0C447C', icono: 'fa-dice' };

const PUNTOS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const ROTACION: Record<number, [number, number]> = {
  1: [0, 0],
  6: [0, 180],
  3: [0, -90],
  4: [0, 90],
  5: [-90, 0],
  2: [90, 0],
};

const COLORES_CONFETI = ['#EF9F27', '#F0997B', '#9FE1CB', '#AFA9EC', '#ED93B1', '#FFFFFF'];

@Component({
  selector: 'app-lanza-dados',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './lanza-dados.html',
  styleUrl: './lanza-dados.css',
})
export class LanzaDados {
  private juegosService = inject(JuegosService);
  private destroyRef = inject(DestroyRef);

  caras = [1, 2, 3, 4, 5, 6];
  casillas = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  jugadores = signal(4);
  juegos = signal<JuegoMesa[]>([]);
  volteadas = signal(0);
  error = signal('');
  lanzando = signal(false);
  animando = signal(false);
  asentando = signal(false);
  confeti = signal<Confeti[]>([]);

  dado1 = signal('rotateX(-90deg) rotateY(0deg)');
  dado2 = signal('rotateX(0deg) rotateY(-90deg)');

  private yaVistos: string[] = [];
  private giro = [{ x: -90, y: 0 }, { x: 0, y: -90 }];

  get personas(): number[] {
    return Array.from({ length: Math.min(this.jugadores(), 8) }, (_, i) => i);
  }

  tienePunto(cara: number, casilla: number): boolean {
    return PUNTOS[cara].includes(casilla);
  }

  estilo(nombre: string): EstiloJuego {
    return ESTILOS[nombre] ?? ESTILO_POR_DEFECTO;
  }

  cambiarJugadores(cambio: number): void {
    if (this.lanzando()) return;
    const nuevo = this.jugadores() + cambio;
    if (nuevo < 1 || nuevo > 12) return;

    this.jugadores.set(nuevo);
    this.yaVistos = [];
    this.limpiar();
  }

  lanzar(): void {
    if (this.lanzando()) return;

    this.lanzando.set(true);
    this.limpiar();
    this.tirarDados();

    this.juegosService.aleatorio(this.jugadores(), this.yaVistos)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (juegos) => setTimeout(() => this.mostrar(juegos), 1500),
        error: (err) => setTimeout(() => {
          this.error.set(err.error?.mensaje ?? 'No pudimos lanzar los dados. Intenta de nuevo.');
          this.lanzando.set(false);
        }, 1500),
      });
  }

  private mostrar(juegos: JuegoMesa[]): void {
    this.juegos.set(juegos);
    this.yaVistos = juegos.map(juego => juego.id);

    juegos.forEach((_, i) => {
      setTimeout(() => this.volteadas.update(n => n + 1), 200 + i * 350);
    });

    setTimeout(() => {
      this.lanzarConfeti();
      this.lanzando.set(false);
    }, 200 + juegos.length * 350 + 300);
  }

  private tirarDados(): void {
    this.animando.set(false);
    this.asentando.set(false);

    setTimeout(() => {
      this.dado1.set(this.girar(0));
      this.dado2.set(this.girar(1));
      this.animando.set(true);
      setTimeout(() => this.asentando.set(true), 1250);
    }, 20);
  }

  private girar(indice: number): string {
    const cara = 1 + Math.floor(Math.random() * 6);
    const [x, y] = ROTACION[cara];
    const g = this.giro[indice];

    g.x = Math.round(g.x / 360) * 360 + x + (2 + Math.floor(Math.random() * 2)) * 360;
    g.y = Math.round(g.y / 360) * 360 + y + (1 + Math.floor(Math.random() * 2)) * 360;

    return `rotateX(${g.x}deg) rotateY(${g.y}deg)`;
  }

  private lanzarConfeti(): void {
    this.confeti.set(
      Array.from({ length: 26 }, (_, i) => ({
        izquierda: Math.random() * 100,
        color: COLORES_CONFETI[i % COLORES_CONFETI.length],
        retraso: Math.random() * 0.4,
      }))
    );
    setTimeout(() => this.confeti.set([]), 2200);
  }

  private limpiar(): void {
    this.juegos.set([]);
    this.volteadas.set(0);
    this.error.set('');
  }
}