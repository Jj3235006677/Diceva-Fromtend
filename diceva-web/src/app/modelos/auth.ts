// Espejos de los DTOs del backend
export interface LoginRequest {
  correo: string;
  contraseña: string;
}

export interface TokenResponse {
  token: string;
  type: string;
  expireAt: string;
  roles: string[];
}