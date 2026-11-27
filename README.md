# AMAC | Bolsa de trabajo

**OT2026-WEB · Entrega 3 final** — Plataforma de empleo de asociAMayores A.C. orientada a facilitar el acceso de adultos mayores a oportunidades laborales y a conectar candidatos con empresas. AMAC supervisa los registros y las ofertas mediante el panel administrativo.

- [Aplicación pública en Vercel](https://amac-react-chi.vercel.app/)
- [Repositorio amac-react](https://github.com/patricioalanisa-debug/amac-react/tree/base)
- [Diapositivas](presentacion/AMAC_presentacion.pdf)
- Video: **PENDIENTE — pegar enlace accesible después de grabar.**

## Integrantes y aportaciones

| Integrante | Responsabilidad |
|---|---|
| Patricio Alanís Álvarez | Infraestructura, conexión a Supabase, listado, búsqueda, filtros, detalle de vacantes, despliegue y modelo de datos. |
| Isaí Rico | Registro de candidato, sesión, postulaciones, mis solicitudes y cancelación. |
| Andrés Espinosa García | Registro de empresa, publicación y gestión de vacantes, solicitudes recibidas y ejemplos. Integración del panel de aprobación y mejoras visuales, según aportaciones reales. |

Distribución propuesta según las partes A, B y C; confirmar con el historial de commits.

## Tecnologías

React (componentes, props, estado y efectos), Vite (desarrollo y build), React Router (SPA y rutas protegidas), CSS (responsividad y alto contraste), Supabase (PostgreSQL, Auth, API y RLS), GitHub (control de versiones) y Vercel (hosting HTTPS y despliegue continuo).

## Instalación local

Usar Node.js 22.12+ de la serie 22 o Node.js 24 LTS. Clonar el repositorio y seleccionar la rama entregada:

```bash
git clone https://github.com/patricioalanisa-debug/amac-react.git
cd amac-react
git checkout base
npm install
```

Crear `.env.local` en la raíz usando `.env.example` como plantilla. Solicitar al equipo la URL del proyecto y la llave pública (anon o publishable).

```dotenv
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_LLAVE_PUBLICA
```

El nombre ANON_KEY coincide con `src/lib/supabase.js` en la versión revisada. No colocar llaves privadas ni credenciales SMTP en React.

```bash
npm run dev
npm run build
```

Abrir la URL local mostrada por Vite. En Vercel configurar las mismas variables públicas; build `npm run build`, salida `dist`. `vercel.json` redirige las rutas SPA a `index.html`. En Supabase, Site URL apunta al dominio publicado. La rama efectiva de producción y el historial de commits deben verificarse en Vercel/GitHub.

## Arquitectura y rutas

`main.jsx` monta BrowserRouter y AuthProvider; `App.jsx` define las rutas y usa Encabezado, Pie y RutaProtegida. `Home` consulta vacantes y utiliza TarjetaVacante. `AuthContext` mantiene sesión y perfil. `src/lib/supabase.js` conecta el cliente con la API.

| Rol | Rutas principales |
|---|---|
| Público | `/`, `/vacante/:id`, `/login`, `/registro`, `/registro-empresa` |
| Candidato | `/mis-solicitudes` |
| Empresa | `/empresa/vacantes`, `/empresa/publicar`, `/empresa/solicitudes` |
| Administrador | `/admin`, `/admin/candidatos`, `/admin/empresas`, `/admin/vacantes`, `/admin/solicitudes` |

## Cuentas de prueba

Completar con cuentas ficticias reales y verificadas. No usar contraseñas personales, ni publicar credenciales administrativas. Si el repositorio es público, entregar las contraseñas de prueba al profesor en un canal privado o usar un repositorio privado accesible al profesor; limitar privilegios y rotar credenciales después de la evaluación.

| Rol | Correo | Contraseña | Revisión |
|---|---|---|---|
| Candidato aprobado | candidato@example.com | [12345678] | aprobada |
| Candidato sin aprobar | candidato2@example.com | [12345678] | pendiente |
| Empresa | empresa2@example.com | [12345678] | aprobada |

La cuenta administrativa se comparte solo por canal privado si se requiere. La confirmación de correo es independiente de la revisión administrativa. En demo el profesor permite desactivarla temporalmente; para producción debe activarse y configurarse un SMTP apropiado.

## Modelo relacional

![Captura del Schema Visualizer](img/diagrama.png)

La captura incluida corresponde a una versión anterior del esquema. Sustituirla por una captura actual de Database → Schema Visualizer antes de entregar.

- `perfiles`: PK UUID vinculada a `auth.users.id`; rol, datos del usuario, `aprobado` y `revision`.
- `vacantes`: PK bigint; `empresa_id` FK a perfiles; datos de empleo, teléfono opcional, estado y revisión.
- `solicitudes`: PK bigint; `vacante_id` y `candidato_id` son FKs; fecha y estatus. `UNIQUE(vacante_id,candidato_id)` impide duplicar postulaciones.
- `al_crear_usuario` ejecuta `crear_perfil()` al registrar un usuario en Auth. El registro público no asigna admin. Los estados de revisión son pendiente, aprobada, rechazada y suspendida.

## Seguridad RLS (RF-010)

Políticas de la versión SQL reconstruida. RLS se activa en las tres tablas. Revisar las políticas contra la base real y comprobar con cuentas no administrativas; SQL Editor por sí solo no demuestra el aislamiento.

| Tabla | Política | Propósito |
|---|---|---|
| perfiles | Cada quien ve su perfil | Lectura del propietario. |
| perfiles | Todos ven los perfiles de empresas | Lectura de perfiles de empresa para el listado público; revisar minimización de datos. |
| perfiles | La empresa ve a quien aplicó a sus vacantes | Lectura de candidatos relacionados con sus ofertas. |
| perfiles | Cada quien edita su perfil | Actualización de campos permitidos en su propia fila. |
| perfiles | Admin lee perfiles | Lectura administrativa. |
| vacantes | Ver vacantes activas o las propias | Público: activa, aprobada y empresa aprobada; propietario: sus ofertas. |
| vacantes | El candidato sigue viendo las vacantes a las que aplicó | Conserva acceso histórico. |
| vacantes | Solo empresas publican, a su nombre | Empresa aprobada; inserción propia, pausada y pendiente. |
| vacantes | La empresa edita sus vacantes | Empresa aprobada, oferta propia aprobada y no cerrada; cambio de estado permitido. |
| vacantes | Admin lee vacantes | Lectura administrativa de todas las ofertas. |
| solicitudes | Candidato ve las suyas; empresa ve las de sus vacantes | Lectura de las partes relacionadas. |
| solicitudes | Solo candidatos aprobados se postulan | Identidad propia, Enviada, candidato y oferta aprobados, empresa aprobada, estado activo. |
| solicitudes | Candidato cancela si no está resuelta | Solo Enviada o En revisión pasan a Cancelada. |
| solicitudes | Empresa cambia el estatus | Empresa aprobada y propietaria; no canceladas; En revisión, Aceptada o Rechazada. |
| solicitudes | Admin lee solicitudes | Consulta administrativa, sin decidir contrataciones. |

Permisos por columna limitan las actualizaciones: perfil sin rol/aprobación/revisión; vacante solo estado por cliente; solicitud solo estatus. Las RPC `admin_revisar_perfil`, `admin_revisar_vacante`, `admin_cerrar_vacante` verifican el rol admin en PostgreSQL y son el canal de moderación. Suspender una empresa suspende sus ofertas abiertas. Las rutas protegidas son una barrera de interfaz; RLS y permisos de PostgreSQL son la protección real. No almacenar contraseñas en tablas públicas.

## Requerimientos funcionales

✅ = demostrado en capturas o confirmado de forma general por el equipo; 🟡 = implementado en archivos revisados, faltan casos de aceptación específicos; ❌ = no incluido en esta versión revisada. Confirmar cada prueba antes de entregar.

| RF | Funcionalidad | Estado |
|---|---|---|
| RF-001 | Listado de vacantes reales | ✅ |
| RF-002, RF-007 | Búsqueda y filtros; mensaje sin resultados | 🟡 |
| RF-003, RF-051 | Detalle y enlace tel condicional | 🟡 |
| RF-011, RF-012, RF-013 | Registro candidato, validación y términos | 🟡 |
| RF-008, RF-009 | Inicio y cierre de sesión | ✅ |
| RF-004, RF-054 | Postulación, aprobación y bloqueo duplicado | 🟡 |
| RF-005, RF-006 | Mis solicitudes y cancelación | 🟡 |
| RF-015 | Registro de empresa | 🟡 |
| RF-019 | Publicar vacante y teléfono condicional | 🟡 |
| RF-020, RF-021 | Mis vacantes, conteo, pausa, reactivar, cerrar | 🟡 |
| RF-022, RF-024 | Solicitudes recibidas y cambio de estatus | 🟡 |
| RF-010 | Rutas y RLS | 🟡 |
| RF-054 (extra) | Panel administrativo | ✅ |
| Extra | Revisión de empresas y ofertas | 🟡 |
| RF-014/RF-017, RF-016, RF-041, RF-029, RF-055 | Edición perfil, logo, favoritas, recuperación, etapas | ❌ (opcionales; no comprobados) |

## Accesibilidad y pruebas

Lighthouse del listado: 100/100 escritorio y 100/100 móvil según capturas y selección del equipo. No implica certificación de toda la app. Evidencias de 320, 390, 768, 1024 y 1440 px en `img/evidencias/`. Comprobar manualmente foco, navegación por teclado, texto ≥18 px, contraste, formularios, menú y desplazamiento sin recorte. A 320 px repetir captura desde la parte superior y verificar que la barra inferior no oculte acciones.

- [Lighthouse desktop](img/evidencias/lighthouse-desktop.png) · [Lighthouse móvil](img/evidencias/lighthouse-mobile.png)
- [320 px](img/evidencias/responsive-320.png) · [390 px](img/evidencias/responsive-390.png) · [768 px](img/evidencias/responsive-768.png) · [1024 px](img/evidencias/responsive-1024.png) · [1440 px](img/evidencias/responsive-1440.png)

## SQL y datos de ejemplo

`supabase/esquema.sql` reúne el esquema base, correcciones y migración administrativa de los paquetes utilizados. Es para una instalación nueva; **no volver a ejecutarlo en la base existente**. Se conserva `permisos_admin.sql` y `correcciones_parte_a.sql` como historial. Comparar el SQL con las políticas y columnas reales de Supabase; si hubo cambios manuales, documentarlos. `vacantes_ejemplo.sql` es opcional: cambiar el correo por una empresa ficticia existente y aprobar las ofertas desde el panel. No repetir la carga si ya existen seis ofertas públicas. Validar sin sesión que se vean al menos seis.

## Entrega

Confirmar commits de todos, cuentas de prueba, captura actual de Schema Visualizer, resultados de pruebas, fecha de Blackboard, enlace del video (12–15 min) y permisos del enlace. 
