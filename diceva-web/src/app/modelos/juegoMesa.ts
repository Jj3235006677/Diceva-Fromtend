// Espejo de los enums del backend
export type ComplejidadJuego = 'BASICA' | 'INTERMEDIA' | 'AVANZADA';
export type EstadoJuego = 'PREVENTA' | 'DISPONIBLE' | 'AGOTADO';

// Espejo del record Precio
export interface Precio {
  precioProducto: number;
}

// Espejo del record RangoJugadores
export interface RangoJugadores {
  maximoJugadores: number;
  minimoJugadores: number;
}

// Espejo de JuegoMesaResponse
export interface JuegoMesa {
  id: string;
  cedulaProveedor: string;
  nombre: string;
  descripcion: string;
  precio: Precio;
  stock: number;
  rangoJugadores: RangoJugadores;
  complejidad: ComplejidadJuego;
  mecanicaDeJuego: string;
  tematicaDeJuego: string;
  edadRecomendada: number;
  imagenUrl: string;
  estado: EstadoJuego;
  eliminacionLogica: boolean;
}

// Espejo de ResultadoPaginado
export interface ResultadoPaginado<T> {
  contenido: T[];
  totalElementos: number;
  totalPaginas: number;
  paginaActual: number;
  tamanioPagina: number;
}


// Espejo de RankingJuegoResponse
export interface RankingJuego {
  nombre: string;
  cantidad: number;
}