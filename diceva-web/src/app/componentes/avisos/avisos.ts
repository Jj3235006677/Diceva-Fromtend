import { Component, inject } from '@angular/core';
import { AvisosService } from '../../servicios/avisos';

@Component({
  selector: 'app-avisos',
  imports: [],
  templateUrl: './avisos.html',
  styleUrl: './avisos.css',
})
export class Avisos {
  avisosService = inject(AvisosService);
}