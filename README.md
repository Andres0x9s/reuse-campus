# ReUse Campus

Plataforma educativa para donar e intercambiar artículos. El flujo relaciona usuarios, publicaciones, solicitudes y entregas, con historial y restricciones de estado.

**Autor:** Sebastian Bonilla, Andres Saldias y Anthony Rebolledo

## Tecnologías y requisitos
- Node.js 22.12 o superior dentro de la rama 22 LTS, npm, Angular 20.3, Express 5, MySQL 8, Git y VS Code.
- HttpClient, Angular Router, FormsModule, mysql2, JWT y bcryptjs.

## Configuración y ejecución (Windows PowerShell)
1. Abrir `database/01-schema.sql` en MySQL Workbench, conectarse al servidor local y ejecutar todo el archivo. No se eliminan tablas existentes.
2. Abrir una terminal en la carpeta raíz del proyecto y ejecutar:

```powershell
cd backend
Copy-Item .env.example .env
npm.cmd install
```

Editar `backend/.env`: introducir usuario y contraseña de MySQL, y reemplazar JWT_SECRET por un secreto aleatorio de al menos 32 caracteres. Para generar uno:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copiar la salida en JWT_SECRET. No publicar `.env`. Después:

```powershell
npm.cmd run seed
npm.cmd run dev
```

Comprobar http://localhost:3000/api/health (respuesta `{"status":"ok"}`). En otra terminal abierta en la raíz:

```powershell
cd frontend
npm.cmd install
npm.cmd start
```

Abrir http://localhost:4200. Usar `npm.cmd run build` para compilar. npm.cmd evita el bloqueo de npm.ps1 en PowerShell.

## Cuentas de prueba local
Todas tienen inicialmente la clave `Demo1234!`. Son cuentas ficticias, solo para pruebas; no usar ni desplegar estas credenciales en producción.

| Correo | Rol |
|---|---|
| admin@demo.cl | ADMINISTRADOR |
| ana@demo.cl | USUARIO |
| bruno@demo.cl | USUARIO |
| carla@demo.cl | USUARIO |

`npm run seed` no cambia las contraseñas de usuarios existentes. Si las cambiaron, usen sus claves actualizadas o una base de datos de pruebas nueva.

## Estructura
- `database/`: esquema relacional e integridad referencial.
- `backend/src/`: servidor Express, autenticación, conexión, transacciones y routers de las cuatro entidades.
- `backend/test/`: prueba automática de integración HTTP.
- `frontend/src/app/`: componentes standalone, modelos, servicios, rutas, guardias e interceptor.
- `docs/`: pruebas manuales y matriz de reglas.

## Funcionalidades
Login, roles, administración de usuarios, creación/edición/cancelación de publicaciones, solicitudes con aceptación/rechazo/cancelación, entrega automática al aceptar, confirmación de entrega, historial, validaciones y errores. Las bajas son lógicas. No se permite crear o eliminar entregas directamente: su alta proviene de la aceptación y su actualización de la confirmación. La pauta exige CRUD coherente con las reglas, no borrado indiscriminado. Los roles se validan en el servidor. Se decidió que solo el propietario confirma la entrega; el administrador consulta todo el historial y administra usuarios, pero no sustituye al propietario al aceptar o rechazar.

## Pruebas
Ejecutar en otra terminal, con la API en ejecución y cuentas demo iniciales:

```powershell
cd backend
npm.cmd test
```

La prueba crea datos en la base local, verifica estados, permisos, duplicados, solicitudes simultáneas y desactivación. Usar exclusivamente una base de pruebas. Los registros se conservan para evidenciar persistencia. Consultar `docs/PRUEBAS.md` y completar resultados reales. No afirmar que una prueba pasó hasta ejecutarla.

Estado de verificación del material inicial: sintaxis JavaScript y JSON revisados; instalación npm, compilación Angular, ejecución SQL y pruebas integradas realizadas en entorno local

## Declaración de uso de inteligencia artificial
 La plantilla y el código inicial de este material fueron generados con ayuda de ChatGPT, incluyendo propuesta de esquema SQL realizada en workbrech MySQL, módulos Express y prueba de integración. Cada estudiante realizo correcciones hizo personalmente.
