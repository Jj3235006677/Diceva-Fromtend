
//Espejos de los dtos 
export interface LoginRequest {
    correo:string
    contraseña:string}


export interface TokenResponse{
    token:string 
    type:string
    expiredAt:string 
    roles:string[]

}
