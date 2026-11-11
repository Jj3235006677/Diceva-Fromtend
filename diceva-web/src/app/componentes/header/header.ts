import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../servicios/auth';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  authService = inject(Auth);
  private router = inject(Router);
  isLoggedIn = this.authService.isAuthenticated;

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}