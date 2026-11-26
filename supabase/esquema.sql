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