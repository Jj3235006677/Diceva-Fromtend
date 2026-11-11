import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { JuegosService } from '../../servicios/JuegosMesa';
import { JuegoMesa } from '../../modelos/juegoMesa';

@Component({
  imports: [],
  selector: 'app-catalogo',
  styleUrl: './catalogo.css',
  templateUrl: './catalogo.html',
})
export class Catalogo {
  private juegosService = inject(JuegosService);

  juegos = toSignal(
    this.juegosService.listar().pipe(map((pagina) => pagina.contenido)),
    { initialValue: [] as JuegoMesa[] }
  );
}