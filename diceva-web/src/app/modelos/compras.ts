import { Precio } from './juegoMesa';

// Espejo del enum EstadoPago
export type EstadoPago = 'PENDIENTE' | 'APROBADO' | 'REEMBOLSADO';

// Espejo del record DetalleCompra
export interface DetalleCompra {
  idJuego: string;
  cantidad: number;
  precioUnitario: Precio;
}

// Espejo de CompraResponse
export interface CompraResponse {
  id: string;
  detalles: DetalleCompra[];
  cedulaUsuario: string;
  precioTotal: Precio;
  fechaCompra: string;
  estadoPago: EstadoPago;
  codigoCupon: string | null;
  porcentajeDescuento: number;
  totalAPagar: Precio;
}