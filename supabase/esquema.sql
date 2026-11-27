-- AMAC | Esquema final consolidado
-- Para instalar en una base Supabase nueva, no ejecutar sobre la base existente.
-- Parte 1: esquema original. Parte 2: migración administrativa aplicada.

-- Tabla perfiles

CREATE TABLE public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    rol TEXT NOT NULL DEFAULT 'candidato'
        CHECK (rol IN ('candidato', 'empresa', 'admin')),
    nombre TEXT NOT NULL,
    telefono TEXT,
    edad INT CHECK (edad BETWEEN 18 AND 120),
    colonia TEXT,
    experiencia TEXT,
    giro TEXT,
    aprobado BOOLEAN NOT NULL DEFAULT FALSE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Tabla vacantes

CREATE TABLE public.vacantes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    empresa_id UUID NOT NULL
        REFERENCES public.perfiles(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    sueldo NUMERIC(10,2) NOT NULL CHECK (sueldo > 0),
    ubicacion TEXT NOT NULL,
    horario TEXT NOT NULL
        CHECK (
            horario IN (
                'Matutino',
                'Vespertino',
                'Medio tiempo',
                'Fines de semana'
            )
        ),
    categoria TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    requisitos TEXT NOT NULL,
    prestaciones TEXT NOT NULL,
    telefono_contacto TEXT,
    estado TEXT NOT NULL DEFAULT 'activa'
        CHECK (estado IN ('activa', 'pausada', 'cerrada')),
    creada_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Tabla solicitudes

CREATE TABLE public.solicitudes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vacante_id BIGINT NOT NULL
        REFERENCES public.vacantes(id) ON DELETE CASCADE,
    candidato_id UUID NOT NULL
        REFERENCES public.perfiles(id) ON DELETE CASCADE,
    estatus TEXT NOT NULL DEFAULT 'Enviada'
        CHECK (
            estatus IN (
                'Enviada',
                'En revisión',
                'Aceptada',
                'Rechazada',
                'Cancelada'
            )
        ),
    creada_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (vacante_id, candidato_id)
);


-- Crear perfil automáticamente al registrar un usuario

CREATE OR REPLACE FUNCTION public.crear_perfil()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.perfiles (
        id,
        rol,
        nombre,
        telefono,
        edad,
        colonia,
        experiencia,
        giro
    )
    VALUES (
        NEW.id,
        CASE
            WHEN NEW.raw_user_meta_data->>'rol' = 'empresa'
                THEN 'empresa'
            ELSE 'candidato'
        END,
        COALESCE(NEW.raw_user_meta_data->>'nombre', 'Sin nombre'),
        NEW.raw_user_meta_data->>'telefono',
        NULLIF(NEW.raw_user_meta_data->>'edad', '')::INT,
        NEW.raw_user_meta_data->>'colonia',
        NEW.raw_user_meta_data->>'experiencia',
        NEW.raw_user_meta_data->>'giro'
    );

    RETURN NEW;
END;
$$;

CREATE TRIGGER al_crear_usuario
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.crear_perfil();


-- Funciones auxiliares

CREATE OR REPLACE FUNCTION public.mi_rol()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT rol
    FROM public.perfiles
    WHERE id = auth.uid();
$$;


CREATE OR REPLACE FUNCTION public.candidato_aprobado()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT COALESCE(
        (
            SELECT aprobado
            FROM public.perfiles
            WHERE id = auth.uid()
              AND rol = 'candidato'
        ),
        FALSE
    );
$$;


CREATE OR REPLACE FUNCTION public.candidato_aplico(vacante_id_param BIGINT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.solicitudes
        WHERE vacante_id = vacante_id_param
          AND candidato_id = auth.uid()
    );
$$;


CREATE OR REPLACE FUNCTION public.empresa_ve_candidato(candidato_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.solicitudes
        JOIN public.vacantes
          ON vacantes.id = solicitudes.vacante_id
        WHERE solicitudes.candidato_id = candidato_id_param
          AND vacantes.empresa_id = auth.uid()
    );
$$;


-- Activar RLS

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes ENABLE ROW LEVEL SECURITY;


-- Permisos

GRANT SELECT
ON public.perfiles
TO anon, authenticated;

REVOKE UPDATE ON public.perfiles FROM anon, authenticated;

GRANT UPDATE (
    nombre,
    telefono,
    edad,
    colonia,
    experiencia,
    giro
)
ON public.perfiles
TO authenticated;


GRANT SELECT
ON public.vacantes
TO anon, authenticated;

GRANT INSERT, UPDATE
ON public.vacantes
TO authenticated;


GRANT SELECT, INSERT
ON public.solicitudes
TO authenticated;

REVOKE UPDATE ON public.solicitudes FROM anon, authenticated;

GRANT UPDATE (estatus)
ON public.solicitudes
TO authenticated;


-- Políticas RLS de perfiles

CREATE POLICY "Cada quien ve su perfil"
ON public.perfiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Todos ven los perfiles de empresas"
ON public.perfiles
FOR SELECT
USING (rol = 'empresa');

CREATE POLICY "La empresa ve a quien aplicó a sus vacantes"
ON public.perfiles
FOR SELECT
USING (public.empresa_ve_candidato(id));

CREATE POLICY "Cada quien edita su perfil"
ON public.perfiles
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());


-- Políticas RLS de vacantes

CREATE POLICY "Ver vacantes activas o las propias"
ON public.vacantes
FOR SELECT
USING (
    estado = 'activa'
    OR empresa_id = auth.uid()
);

CREATE POLICY "El candidato sigue viendo las vacantes a las que aplicó"
ON public.vacantes
FOR SELECT
USING (
    public.candidato_aplico(id)
);

CREATE POLICY "Solo empresas publican, a su nombre"
ON public.vacantes
FOR INSERT
WITH CHECK (
    empresa_id = auth.uid()
    AND public.mi_rol() = 'empresa'
);

CREATE POLICY "La empresa edita sus vacantes"
ON public.vacantes
FOR UPDATE
USING (
    empresa_id = auth.uid()
)
WITH CHECK (
    empresa_id = auth.uid()
);


-- Políticas RLS de solicitudes

CREATE POLICY "Candidato ve las suyas; empresa ve las de sus vacantes"
ON public.solicitudes
FOR SELECT
USING (
    candidato_id = auth.uid()
    OR EXISTS (
        SELECT 1
        FROM public.vacantes v
        WHERE v.id = vacante_id
          AND v.empresa_id = auth.uid()
    )
);

CREATE POLICY "Solo candidatos aprobados se postulan"
ON public.solicitudes
FOR INSERT
WITH CHECK (
    candidato_id = auth.uid()
    AND estatus = 'Enviada'
    AND public.candidato_aprobado()
    AND EXISTS (SELECT 1 FROM public.vacantes v WHERE v.id = vacante_id AND v.estado = 'activa')
);

CREATE POLICY "Candidato cancela si no está resuelta"
ON public.solicitudes
FOR UPDATE
USING (
    candidato_id = auth.uid()
    AND estatus IN ('Enviada', 'En revisión')
)
WITH CHECK (
    candidato_id = auth.uid()
    AND estatus = 'Cancelada'
);

CREATE POLICY "Empresa cambia el estatus"
ON public.solicitudes
FOR UPDATE
USING (
    estatus <> 'Cancelada'
    AND EXISTS (
        SELECT 1
        FROM public.vacantes v
        WHERE v.id = vacante_id
          AND v.empresa_id = auth.uid()
    )
)
WITH CHECK (
    estatus IN ('En revisión', 'Aceptada', 'Rechazada')
    AND EXISTS (
        SELECT 1
        FROM public.vacantes v
        WHERE v.id = vacante_id
          AND v.empresa_id = auth.uid()
    )
);

-- PARTE 2: APROBACIONES ADMINISTRATIVAS
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
