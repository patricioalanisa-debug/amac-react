# AMAC · Bolsa de trabajo

## Diagrama de base de datos

![Diagrama](img/diagrama.png)

- `perfiles`: información de usuarios, rol y aprobación. Su ID referencia a `auth.users.id`.
- `vacantes`: ofertas laborales; `empresa_id` referencia al perfil de la empresa (uno a muchos).
- `solicitudes`: postulaciones; `vacante_id` y `candidato_id` referencian la vacante y el perfil. La restricción `UNIQUE (vacante_id, candidato_id)` evita duplicados.
- El trigger `al_crear_usuario` crea el perfil al registrarse mediante Supabase Auth. Las contraseñas no se guardan en estas tablas.

## Seguridad RLS (RF-010)

RLS se activa en las tres tablas. PostgreSQL comprueba las reglas incluso si se manipula el frontend. Las funciones auxiliares consultan el rol, aprobación y relaciones sin recursión de políticas.

| Tabla | Política | Explicación |
|---|---|---|
| perfiles | Cada quien ve su perfil | Solo el propietario puede leer su propio perfil, además de las excepciones siguientes. |
| perfiles | Todos ven los perfiles de empresas | Permite mostrar el nombre de la empresa, también a visitantes. |
| perfiles | La empresa ve a quien aplicó a sus vacantes | Limita la lectura de candidatos a quienes solicitaron sus ofertas. |
| perfiles | Cada quien edita su perfil | Solo su propia fila; los permisos por columna impiden cambiar rol o aprobación. |
| vacantes | Ver vacantes activas o las propias | El público ve activas; la empresa puede ver las suyas en cualquier estado. |
| vacantes | El candidato sigue viendo las vacantes a las que aplicó | Permite consultar la oferta incluso si fue pausada o cerrada. |
| vacantes | Solo empresas publican, a su nombre | Comprueba rol de empresa y propietario. |
| vacantes | La empresa edita sus vacantes | Limita actualización a las propias. |
| solicitudes | Candidato ve las suyas; empresa ve las de sus vacantes | Restringe lectura a las partes relacionadas. |
| solicitudes | Solo candidatos aprobados se postulan | Comprueba identidad, aprobación, estatus inicial y vacante activa. |
| solicitudes | Candidato cancela si no está resuelta | Solo Enviada o En revisión pueden pasar a Cancelada. |
| solicitudes | Empresa cambia el estatus | Solo solicitudes de sus ofertas, no canceladas, a En revisión, Aceptada o Rechazada. |

Los permisos de actualización de solicitudes se limitan a `estatus`. La aprobación se cambia desde el Table Editor por el equipo autorizado. `supabase/esquema.sql` describe una instalación nueva; `supabase/correcciones_parte_a.sql` aplica los ajustes a la base existente.

## Configuración local y despliegue (parte A)

Usar Node.js 22.12 o superior dentro de la serie 22, o una versión compatible posterior. Ejecutar `npm install`, configurar `.env.local` y ejecutar `npm run dev`.

```dotenv
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_LLAVE_PUBLICA
```

Usar únicamente la llave pública anon o publishable, nunca service_role ni secret key. No subir `.env.local`. Configurar las mismas variables en Vercel; el build es `npm run build` y la salida `dist`. `vercel.json` permite recargar las rutas de React. Configurar la URL publicada como Site URL en Supabase Auth.

## Tecnologías e integrantes

React, Vite, React Router, Supabase (PostgreSQL, Auth, RLS), CSS y Vercel.

- A: infraestructura, vacantes y seguridad. Nombre: pendiente.
- B: registro, sesión y solicitudes del candidato. Nombre: pendiente.
- C: flujo de empresa y datos de ejemplo. Nombre: pendiente.
- URL pública Vercel: pendiente de confirmar.

## Tabla de requerimientos (Entrega 3)

🟡 = código implementado, pendiente de prueba real; ❌ = pendiente en la versión revisada. Marcar ✅ solo después de verificar.

| RF | Funcionalidad | Estado |
|---|---|---|
| RF-001 | Listado de vacantes activas | 🟡 |
| RF-002, RF-007 | Búsqueda y filtros | 🟡 |
| RF-003, RF-051 | Detalle y llamada | 🟡 |
| RF-011, RF-012, RF-013 | Registro de candidato | 🟡 |
| RF-008, RF-009 | Inicio y cierre de sesión | 🟡 |
| RF-004, RF-054 | Postulación y aprobación | 🟡 |
| RF-005, RF-006 | Mis solicitudes y cancelación | 🟡 |
| RF-015 | Registro de empresa | ❌ |
| RF-019 | Publicar vacante | ❌ |
| RF-020, RF-021 | Mis vacantes | ❌ |
| RF-022, RF-024 | Solicitudes recibidas | ❌ |
| RF-010 | Seguridad RLS | 🟡 |

## Cuentas de prueba (pendientes de crear y verificar)

| Rol | Correo de prueba | Contraseña de prueba |
|---|---|---|
| Candidato aprobado | Pendiente | Pendiente |
| Candidato sin aprobar | Pendiente | Pendiente |
| Empresa | Pendiente | Pendiente |

Crear cuentas ficticias exclusivas de la demo, sin reutilizar credenciales personales. Confirmar sus correos si Auth lo requiere. El equipo autorizado debe marcar `aprobado = true` únicamente para el candidato de prueba aprobado desde Table Editor. Completar la tabla con las credenciales de demostración solicitadas por el profesor, sin publicar claves de administración ni llaves privadas.

## Pruebas de A y B

1. Como visitante, verificar listado, búsqueda, filtros y detalle.
2. Registrar candidato y verificar que el trigger cree su perfil; comprobar confirmación de correo si está habilitada.
3. Iniciar sesión como candidato sin aprobar: no debe poder postularse.
4. Iniciar sesión como candidato aprobado: postularse a una vacante activa y confirmar que no puede duplicarla.
5. En Mis solicitudes verificar empresa, fecha y estatus; cancelar una pendiente y comprobar que no se pueda cancelar una resuelta.
6. Cerrar sesión y comprobar que /mis-solicitudes redirija a login. Verificar aislamiento entre cuentas y restricciones RLS con usuarios no administradores.
7. Comprobar alto contraste, teclado, móvil y Lighthouse (accesibilidad ≥ 90).
8. Verificar compilación, URL pública, recarga de rutas y seis vacantes de ejemplo cuando C las cargue.

Pendientes: resultados reales, URL de Vercel, video y diapositivas. Al integrar C, actualizar rutas, tabla RF y pruebas.
