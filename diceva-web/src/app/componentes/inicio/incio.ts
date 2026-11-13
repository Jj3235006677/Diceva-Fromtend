import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { JuegosService } from '../../servicios/JuegosMesa';
import { RankingJuego } from '../../modelos/juegoMesa';

interface EstiloJuego {
  fondo: string;
  color: string;
  icono: string;
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

@Component({
  imports: [RouterLink],
  selector: 'app-incio',
  styleUrl: './incio.css',
  templateUrl: './incio.html',
})
export class Inicio {
  private juegosService = inject(JuegosService);

  ranking = toSignal(this.juegosService.ranking(), { initialValue: [] as RankingJuego[] });

  podio = computed(() => this.ranking().slice(0, 3));
  siguientes = computed(() => this.ranking().slice(3, 5));
  maximo = computed(() => this.ranking()[0]?.cantidad ?? 1);

  estilo(nombre: string): EstiloJuego {
    return ESTILOS[nombre] ?? ESTILO_POR_DEFECTO;
  }

  porcentaje(cantidad: number): number {
    return Math.round((cantidad / this.maximo()) * 100);
  }
}