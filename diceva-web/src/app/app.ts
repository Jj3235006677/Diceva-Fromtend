import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Auth } from './servicios/auth';

@Component({
  imports: [RouterOutlet, RouterLink],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  auth = inject(Auth);
  title = signal('Diceva Juegos de mesa');
  footer = signal('Universidad del Quindío');
}