import { Injectable, signal } from '@angular/core';

export type TipoAviso = 'exito' | 'error' | 'info';

export interface Aviso {
  id: number;
  tipo: TipoAviso;
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class AvisosService {
  avisos = signal<Aviso[]>([]);
  private siguienteId = 0;

  exito(mensaje: string) {
    this.mostrar('exito', mensaje);
  }

  error(mensaje: string) {
    this.mostrar('error', mensaje);
  }

  info(mensaje: string) {
    this.mostrar('info', mensaje);
  }

  cerrar(id: number) {
    this.avisos.update(lista => lista.filter(a => a.id !== id));
  }

  private mostrar(tipo: TipoAviso, mensaje: string) {
    const id = ++this.siguienteId;
    this.avisos.update(lista => [...lista, { id, tipo, mensaje }]);
    setTimeout(() => this.cerrar(id), 4000);
  }
}