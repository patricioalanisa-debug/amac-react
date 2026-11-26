-- Ejecutar en SQL Editor como propietario. Migración única, repetible sin resetear decisiones.
BEGIN;
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS revision text;
UPDATE public.perfiles SET revision = CASE WHEN aprobado THEN 'aprobada' ELSE 'pendiente' END WHERE revision IS NULL;
ALTER TABLE public.perfiles ALTER COLUMN revision SET DEFAULT 'pendiente', ALTER COLUMN revision SET NOT NULL;
ALTER TABLE public.perfiles DROP CONSTRAINT IF EXISTS perfiles_revision_check;
ALTER TABLE public.perfiles ADD CONSTRAINT perfiles_revision_check CHECK (revision IN ('pendiente','aprobada','rechazada','suspendida'));
ALTER TABLE public.vacantes ADD COLUMN IF NOT EXISTS revision text;
-- Las ofertas existentes pasan a revisión; se conservan todos sus datos y solicitudes.
UPDATE public.vacantes SET revision='pendiente', estado=CASE WHEN estado='cerrada' THEN 'cerrada' ELSE 'pausada' END WHERE revision IS NULL;
ALTER TABLE public.vacantes ALTER COLUMN revision SET DEFAULT 'pendiente', ALTER COLUMN revision SET NOT NULL, ALTER COLUMN estado SET DEFAULT 'pausada';
ALTER TABLE public.vacantes DROP CONSTRAINT IF EXISTS vacantes_revision_check;
ALTER TABLE public.vacantes ADD CONSTRAINT vacantes_revision_check CHECK (revision IN ('pendiente','aprobada','rechazada','suspendida'));
CREATE OR REPLACE FUNCTION public.empresa_aprobada(p_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM public.perfiles WHERE id=p_id AND rol='empresa' AND aprobado AND revision='aprobada');
$$;
CREATE OR REPLACE FUNCTION public.candidato_aprobado() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT EXISTS(SELECT 1 FROM public.perfiles WHERE id=auth.uid() AND rol='candidato' AND aprobado AND revision='aprobada');
$$;
REVOKE ALL ON FUNCTION public.empresa_aprobada(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.empresa_aprobada(uuid) TO anon, authenticated;
REVOKE UPDATE ON public.perfiles FROM PUBLIC, anon, authenticated;
REVOKE UPDATE (id,rol,aprobado,revision) ON public.perfiles FROM PUBLIC, anon, authenticated;
GRANT UPDATE(nombre,telefono,edad,colonia,experiencia,giro) ON public.perfiles TO authenticated;
REVOKE INSERT, UPDATE ON public.vacantes FROM PUBLIC, anon, authenticated;
REVOKE INSERT (revision), UPDATE (revision) ON public.vacantes FROM PUBLIC, anon, authenticated;
GRANT INSERT (empresa_id,titulo,sueldo,ubicacion,horario,categoria,descripcion,requisitos,prestaciones,telefono_contacto,estado) ON public.vacantes TO authenticated;
GRANT UPDATE (estado) ON public.vacantes TO authenticated;
DROP POLICY IF EXISTS "Leer vacantes" ON public.vacantes;
DROP POLICY IF EXISTS "Ver vacantes activas o las propias" ON public.vacantes;
CREATE POLICY "Ver vacantes activas o las propias" ON public.vacantes FOR SELECT USING ((estado='activa' AND revision='aprobada' AND public.empresa_aprobada(empresa_id)) OR empresa_id=auth.uid());
DROP POLICY IF EXISTS "Solo empresas publican, a su nombre" ON public.vacantes;
CREATE POLICY "Solo empresas publican, a su nombre" ON public.vacantes FOR INSERT TO authenticated WITH CHECK (empresa_id=auth.uid() AND public.empresa_aprobada(auth.uid()) AND estado='pausada' AND revision='pendiente');
DROP POLICY IF EXISTS "La empresa edita sus vacantes" ON public.vacantes;
CREATE POLICY "La empresa edita sus vacantes" ON public.vacantes FOR UPDATE TO authenticated USING (empresa_id=auth.uid() AND public.empresa_aprobada(auth.uid()) AND revision='aprobada' AND estado<>'cerrada') WITH CHECK (empresa_id=auth.uid() AND public.empresa_aprobada(auth.uid()) AND revision='aprobada' AND estado IN ('activa','pausada','cerrada'));
DROP POLICY IF EXISTS "Solo candidatos aprobados se postulan" ON public.solicitudes;
CREATE POLICY "Solo candidatos aprobados se postulan" ON public.solicitudes FOR INSERT TO authenticated WITH CHECK (candidato_id=auth.uid() AND estatus='Enviada' AND public.candidato_aprobado() AND EXISTS(SELECT 1 FROM public.vacantes v WHERE v.id=vacante_id AND v.estado='activa' AND v.revision='aprobada' AND public.empresa_aprobada(v.empresa_id)));
-- Una empresa suspendida no puede cambiar estados de contratación.
DROP POLICY IF EXISTS "Empresa cambia el estatus" ON public.solicitudes;
CREATE POLICY "Empresa cambia el estatus" ON public.solicitudes FOR UPDATE TO authenticated USING (public.empresa_aprobada(auth.uid()) AND estatus<>'Cancelada' AND EXISTS(SELECT 1 FROM public.vacantes v WHERE v.id=vacante_id AND v.empresa_id=auth.uid())) WITH CHECK(public.empresa_aprobada(auth.uid()) AND estatus IN ('En revisión','Aceptada','Rechazada') AND EXISTS(SELECT 1 FROM public.vacantes v WHERE v.id=vacante_id AND v.empresa_id=auth.uid()));
DROP POLICY IF EXISTS "Admin lee perfiles" ON public.perfiles;
CREATE POLICY "Admin lee perfiles" ON public.perfiles FOR SELECT TO authenticated USING(public.mi_rol()='admin');
DROP POLICY IF EXISTS "Admin lee vacantes" ON public.vacantes;
CREATE POLICY "Admin lee vacantes" ON public.vacantes FOR SELECT TO authenticated USING(public.mi_rol()='admin');
DROP POLICY IF EXISTS "Admin lee solicitudes" ON public.solicitudes;
CREATE POLICY "Admin lee solicitudes" ON public.solicitudes FOR SELECT TO authenticated USING(public.mi_rol()='admin');
CREATE OR REPLACE FUNCTION public.admin_revisar_perfil(p_id uuid,p_revision text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF public.mi_rol() IS DISTINCT FROM 'admin' THEN RAISE EXCEPTION 'Acceso denegado' USING ERRCODE='42501'; END IF;
 IF p_revision IS NULL OR p_revision NOT IN ('aprobada','rechazada','suspendida','pendiente') THEN RAISE EXCEPTION 'Revisión inválida'; END IF;
 UPDATE public.perfiles SET revision=p_revision, aprobado=(p_revision='aprobada') WHERE id=p_id AND rol IN ('candidato','empresa');
 IF NOT FOUND THEN RAISE EXCEPTION 'Perfil no encontrado'; END IF;
 -- Retirar aprobación de empresa obliga a revisar de nuevo sus ofertas antes de reactivarlas.
 IF p_revision<>'aprobada' AND EXISTS(SELECT 1 FROM public.perfiles WHERE id=p_id AND rol='empresa') THEN
 UPDATE public.vacantes SET revision='suspendida',estado='pausada' WHERE empresa_id=p_id AND estado<>'cerrada'; END IF;
END; $$;
CREATE OR REPLACE FUNCTION public.admin_revisar_vacante(p_id bigint,p_revision text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF public.mi_rol() IS DISTINCT FROM 'admin' THEN RAISE EXCEPTION 'Acceso denegado' USING ERRCODE='42501'; END IF;
 IF p_revision IS NULL OR p_revision NOT IN ('aprobada','rechazada','suspendida','pendiente') THEN RAISE EXCEPTION 'Revisión inválida'; END IF;
 UPDATE public.vacantes SET revision=p_revision,estado=CASE WHEN p_revision='aprobada' THEN 'activa' ELSE 'pausada' END WHERE id=p_id AND estado<>'cerrada' AND (p_revision<>'aprobada' OR public.empresa_aprobada(empresa_id));
 IF NOT FOUND THEN RAISE EXCEPTION 'Vacante cerrada, inexistente o empresa sin aprobación'; END IF;
END; $$;
DROP FUNCTION IF EXISTS public.admin_aprobar_candidato(uuid,boolean);
DROP FUNCTION IF EXISTS public.admin_moderar_vacante(bigint,text);
REVOKE ALL ON FUNCTION public.admin_revisar_perfil(uuid,text), public.admin_revisar_vacante(bigint,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_revisar_perfil(uuid,text), public.admin_revisar_vacante(bigint,text) TO authenticated;
CREATE OR REPLACE FUNCTION public.admin_cerrar_vacante(p_id bigint) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF public.mi_rol() IS DISTINCT FROM 'admin' THEN RAISE EXCEPTION 'Acceso denegado' USING ERRCODE='42501'; END IF;
 UPDATE public.vacantes SET estado='cerrada' WHERE id=p_id AND estado<>'cerrada';
 IF NOT FOUND THEN RAISE EXCEPTION 'Vacante cerrada o inexistente'; END IF;
END; $$;
REVOKE ALL ON FUNCTION public.admin_cerrar_vacante(bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_cerrar_vacante(bigint) TO authenticated;
COMMIT;
