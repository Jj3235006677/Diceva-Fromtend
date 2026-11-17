# DICEVA · Frontend

**Programación Avanzada · Universidad del Quindío · Entrega 3: Frontend conectado al backend**

**Nicho:** Marketplace de juegos de mesa
**Integrantes:** Juan Pablo Buitrago

Aplicación en Angular que consume la API REST de DICEVA (Spring Boot). Todos los datos que se ven en pantalla salen del backend: no hay datos quemados.

## Cómo ejecutar

Primero el backend y después el frontend. Los dos deben estar corriendo al mismo tiempo.

### 1. Backend

Requisitos: Java 21. En la carpeta `ecommerce` del repositorio del backend:

    ./gradlew bootRun

Queda en http://localhost:8080. La base de datos es H2 en memoria y los datos de prueba se cargan al arrancar.

### 2. Frontend

Requisitos: Node.js y Angular CLI. En la carpeta `diceva-web`:

    npm install
    ng serve

Abrir http://localhost:4200.

## Usuarios de prueba

| Correo | Contraseña | Rol |
|---|---|---|
| admin@diceva.com | Admin123! | ADMIN |
| ana@diceva.com | Ana123! | USER |
| bruno@diceva.com | Bruno123! | USER |
| carla@diceva.com | Carla123! | USER |
| diego@diceva.com | Diego123! | USER |
| elena@diceva.com | Elena123! | USER |

## Cupones de prueba

| Código | Descuento | Estado |
|---|---|---|
| DICEVA10 | 10 % | Vigente |
| JUEGANAVIDAD | 20 % | Vigente |
| VIEJO15 | 15 % | Vencido (para probar el error) |

## Pantallas

| Pantalla | Ruta | Qué tiene |
|---|---|---|
| Inicio | `/` | Bienvenida con saludo al usuario y, lado a lado, la mesa de **Lanza los dados** y el podio de **los más vendidos** |
| Catálogo | `/catalogo` | Juegos reales con búsqueda **en vivo** por nombre (espera 400 ms después de escribir) y paginación (Anterior, Siguiente y "Página X de Y") pedidas al backend. Se **refresca solo cada 10 segundos**. Barra lateral con **Lanza los dados** y **los más vendidos** |
| Iniciar sesión | `/login` | Formulario reactivo con validaciones y mensajes de error |
| Comprar | `/comprar?juego={id}` | Compra del juego elegido en el catálogo, con cantidad y **cupón de descuento** que actualiza el precio al escribirlo. Requiere sesión |
| Mis compras | `/mis-compras` | Historial del usuario con el estado de cada compra (pendiente, aprobada o reembolsada), aviso cuando el admin la aprueba y botón para **pedir reembolso** de las pendientes. Requiere sesión |
| Confirmar compras | `/admin/compras` | Solo para el **ADMIN**: compras pendientes de todos, actualizadas en vivo, con botones para **confirmar** o **reembolsar** |
| Administrar juegos | `/admin/juegos` | Solo para el **ADMIN**: formulario para agregar juegos al catálogo y lista con botón para **eliminarlos** (eliminación lógica) |

Además, en todas las pantallas:

- **Menú (navbar)** que cambia según la sesión y el rol: el cliente ve *Mis compras* y el admin *Confirmar compras* y *Juegos (ADMIN)*. Tiene saludo al usuario y cierre de sesión. En celular se convierte en menú hamburguesa.
- **Avisos** de éxito, error e información que aparecen y desaparecen solos.

## Funcionalidades propias

| Funcionalidad | Qué hace |
|---|---|
| Cupones de descuento | Al comprar se escribe un cupón; el backend valida que exista y esté vigente, y el total se actualiza al instante. La compra guarda el cupón y el porcentaje aplicado |
| Lanza los dados | Se elige el número de jugadores y los dados recomiendan 3 juegos al azar que sirvan para esa cantidad, que no estén eliminados y que tengan stock. "Lanzar otra vez" prioriza juegos que no se hayan mostrado |
| Los más vendidos | Ranking calculado en la base de datos con los juegos más vendidos; al tocar uno, el catálogo lo busca |

## Cómo está organizado

| Carpeta | Qué contiene |
|---|---|
| `modelos` | Interfaces espejo de los DTOs del backend, con los mismos nombres de campos |
