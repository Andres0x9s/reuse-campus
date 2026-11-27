# Pruebas y trazabilidad

Realizar cada prueba con cuentas demo y anotar resultado real, fecha y evidencia (captura, respuesta HTTP o consulta SQL). Todos los casos están pendientes hasta que se ejecuten. No utilizar cuentas o datos reales.

| Caso | Acción | Esperado |
|---|---|---|
| CP01 | Login válido e inválido | 200 con sesión; 401 si clave incorrecta |
| CP02 | Crear publicación sin token | 401 |
| CP03 | Ana publica libro | 201; DISPONIBLE; usuarioId de Ana |
| CP04 | Ana solicita su propio libro | 409 |
| CP05 | Bruno solicita y repite | 201 y luego 409 |
| CP06 | Carla solicita el mismo libro | 201; ambas PENDIENTE |
| CP07 | Bruno intenta aceptar | 403 |
| CP08 | Ana acepta una solicitud | 200; una ACEPTADA; otra RECHAZADA; publicación RESERVADA; entrega PENDIENTE |
| CP09 | Dos aceptaciones simultáneas | Una 200 y otra 409; solo una entrega |
| CP10 | Intentar solicitar estando reservada | 409 |
| CP11 | Ana confirma entrega | COMPLETADA; fechaEntrega; publicación ENTREGADA |
| CP12 | Solicitar artículo entregado o repetir confirmación | 409 |
| CP13 | Cancelar una solicitud pendiente propia | CANCELADA; historial presente; no puede cancelar aceptada |
| CP14 | Cancelar publicación disponible | CANCELADA; pendientes RECHAZADAS; nuevas solicitudes 409 |
| CP15 | Datos vacíos e ID inexistente | 400 y 404 |
| CP16 | Usuario común abre API de usuarios | 403 |
| CP17 | Admin crea, edita y desactiva usuario | 201/200; login posterior falla |
| CP18 | Detener Express y actualizar Angular | Mensaje de conexión comprensible |
| CP19 | Reiniciar Express y recargar Angular | Registros permanecen en MySQL |
| CP20 | Intentar crear entrega manual o borrarla | 405; historial intacto |

Para comprobar base de datos, ejecutar en Workbench:

```sql
USE reuse_campus;
SELECT id,titulo,estado,usuarioId FROM publicaciones ORDER BY id DESC;
SELECT id,publicacionId,solicitanteId,estado FROM solicitudes ORDER BY id DESC;
SELECT id,publicacionId,solicitudId,propietarioId,receptorId,estado,fechaEntrega FROM entregas ORDER BY id DESC;
```

## Reglas de negocio y archivos

| Regla | Implementación |
|---|---|
| RN01 | auth.js y publicaciones.js: token obligatorio |
| RN02 | publicaciones.js y esquema: usuarioId de sesión + FK |
| RN03 | solicitudes.js POST: compara propietario con solicitante |
| RN04 | helpers.js available + solicitudes.js POST |
| RN05 | solicitudes.js POST + uq_pendiente de MySQL |
| RN06 | solicitudes.js POST: diferentes solicitantes permitidos |
| RN07 | solicitudes.js PATCH + owner en helpers.js |
| RN08 | solicitudes.js aceptar + uq_aceptada + bloqueo FOR UPDATE |
| RN09 | solicitudes.js aceptar: UPDATE a RESERVADA |
| RN10 | solicitudes.js aceptar: UPDATE de pendientes a RECHAZADA |
| RN11 | solicitudes.js aceptar: INSERT entrega PENDIENTE |
| RN12 | available en solicitudes.js impide solicitar reservada |
| RN13 | publicaciones.js no acepta estado de entrada; entregas.js requiere RESERVADA |
| RN14 | entregas.js completar: ambos UPDATE dentro de transacción |
| RN15 | available impide solicitar entregada |
| RN16 | solicitudes.js DELETE: solicitante + pending |
| RN17 | bajas lógicas y rechazo de borrado físico de entregas |
| RN18 | auth.js, helpers.js y routers verifican permisos y estados en servidor |

## Defensa individual
1. Demostrar publicación → HttpClient → Express → MySQL → respuesta → actualización de Angular.
2. Abrir solicitudes.js y explicar aceptar, transacción, bloqueos, restricciones únicas y rollback.
3. Explicar claves foráneas y relaciones: usuario 1:N publicación, publicación 1:N solicitud, solicitud 0:1 entrega.
4. Mostrar por qué ocultar un botón no es seguridad; repetir operación sin permiso usando API.
5. Practicar modificación en vivo: cambiar límite de descripción, filtro, validación o mensaje; explicar qué capas se deben modificar.
