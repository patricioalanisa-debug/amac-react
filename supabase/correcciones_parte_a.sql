-- Ejecutar SOLO en la base existente con las tres tablas ya creadas.
-- No borra registros ni recrea tablas. Revisar permisos heredados si los hubiera.
BEGIN;
GRANT SELECT ON public.perfiles TO anon, authenticated;
REVOKE UPDATE ON public.perfiles FROM anon, authenticated;
GRANT UPDATE (nombre, telefono, edad, colonia, experiencia, giro) ON public.perfiles TO authenticated;
REVOKE UPDATE ON public.solicitudes FROM anon, authenticated;
GRANT UPDATE (estatus) ON public.solicitudes TO authenticated;
-- Si sobrevivió la política antigua de la primera versión, eliminarla.
DROP POLICY IF EXISTS "Leer vacantes" ON public.vacantes;
DROP POLICY IF EXISTS "Solo candidatos aprobados se postulan" ON public.solicitudes;
CREATE POLICY "Solo candidatos aprobados se postulan" ON public.solicitudes
FOR INSERT WITH CHECK (
  candidato_id = auth.uid() AND estatus = 'Enviada'
  AND public.candidato_aprobado()
  AND EXISTS (SELECT 1 FROM public.vacantes v WHERE v.id = vacante_id AND v.estado = 'activa')
);
COMMIT;
