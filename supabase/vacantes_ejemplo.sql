-- Ejecutar en SQL Editor DESPUÉS de registrar una empresa ficticia de prueba.
-- Sustituir el correo por el correo exacto de esa empresa. No crea usuarios ni contraseñas.
BEGIN;
DO $$
DECLARE empresa UUID; correo TEXT := 'empresa.demo@example.com';
BEGIN
 SELECT p.id INTO empresa FROM public.perfiles p JOIN auth.users u ON u.id=p.id WHERE lower(u.email)=lower(correo) AND p.rol='empresa';
 IF empresa IS NULL THEN RAISE EXCEPTION 'Primero registra la empresa de prueba y revisa su correo'; END IF;
 INSERT INTO public.vacantes(empresa_id,titulo,sueldo,ubicacion,horario,categoria,descripcion,requisitos,prestaciones,telefono_contacto,estado)
 SELECT empresa,v.* FROM (VALUES
 ('Auxiliar administrativo (demo)',10000::numeric,'San Pedro Garza García','Matutino','Administración','Apoyo con archivos y atención telefónica.','Organización y manejo básico de computadora.','Prestaciones de ley',NULL::text,'activa'),
 ('Recepcionista (demo)',9500,'Monterrey','Vespertino','Atención al cliente','Recibir visitantes y orientar al público.','Trato amable y puntualidad.','Prestaciones de ley',NULL,'activa'),
 ('Auxiliar de biblioteca (demo)',8500,'San Nicolás','Medio tiempo','Educación','Organizar libros y apoyar a lectores.','Lectura y organización.','Prestaciones de ley',NULL,'activa'),
 ('Asistente de tienda (demo)',9000,'Guadalupe','Matutino','Comercio','Acomodar mercancía y atender clientes.','Actitud de servicio.','Prestaciones de ley',NULL,'activa'),
 ('Apoyo en cafetería (demo)',6500,'Monterrey','Fines de semana','Alimentos','Atender pedidos y mantener el área limpia.','Higiene y trabajo en equipo.','Prestaciones de ley',NULL,'activa'),
 ('Auxiliar de archivo (demo)',10500,'Santa Catarina','Vespertino','Administración','Clasificar y digitalizar documentos.','Atención al detalle.','Prestaciones de ley',NULL,'activa')
 ) AS v(titulo,sueldo,ubicacion,horario,categoria,descripcion,requisitos,prestaciones,telefono_contacto,estado)
 WHERE NOT EXISTS(SELECT 1 FROM public.vacantes x WHERE x.empresa_id=empresa AND x.titulo=v.titulo);
END $$;
COMMIT;
-- Para la prueba de llamada, publica una vacante con un teléfono de prueba autorizado desde la app.
-- Los seis ejemplos son ficticios; no representan ofertas reales. No ejecutar esquema.sql otra vez.
