import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Auth } from '../servicios/auth';

// Agrega el token a todas las peticiones que salen hacia el backend
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(Auth).getToken();

  if (token) {
    const peticionConToken = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(peticionConToken);
  }

  return next(req);
};