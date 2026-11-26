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

La URL real de Vercel, integrantes, cuentas de prueba, tabla RF, tecnologías y resultados de pruebas deben completarse en equipo con información verificada.
