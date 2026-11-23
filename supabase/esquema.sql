CREATE TABLE public.vacantes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo TEXT NOT NULL,
    empresa TEXT NOT NULL,
    ubicacion TEXT NOT NULL,
    tipo_empleo TEXT NOT NULL,
    horario TEXT NOT NULL,
    salario TEXT,
    descripcion TEXT NOT NULL
);

GRANT SELECT
ON public.vacantes
TO anon, authenticated;

ALTER TABLE public.vacantes
ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leer vacantes"
ON public.vacantes
FOR SELECT
TO anon, authenticated
USING (true);

INSERT INTO public.vacantes (
    titulo,
    empresa,
    ubicacion,
    tipo_empleo,
    horario,
    salario,
    descripcion
)
VALUES
(
    'Auxiliar administrativo',
    'Papelería El Roble',
    'Monterrey, N.L.',
    'Tiempo completo',
    'Matutino',
    '$9,500 mensuales',
    'Apoyo en actividades administrativas y atención a clientes.'
),
(
    'Cajero(a)',
    'Supermercado La Esquina',
    'Santa Catarina, N.L.',
    'Tiempo completo',
    'Vespertino',
    '$8,200 mensuales',
    'Cobro de productos y atención a clientes.'
),
(
    'Recepcionista',
    'Clínica Salud Vital',
    'San Pedro Garza García, N.L.',
    'Tiempo completo',
    'Matutino',
    '$10,000 mensuales',
    'Recepción de pacientes y manejo de citas.'
),
(
    'Ayudante de cocina',
    'Restaurante Doña Lupe',
    'Guadalupe, N.L.',
    'Medio tiempo',
    'Vespertino',
    '$7,800 mensuales',
    'Apoyo en preparación de alimentos y limpieza.'
),
(
    'Chofer repartidor',
    'Distribuidora Norte',
    'Apodaca, N.L.',
    'Tiempo completo',
    'Matutino',
    '$11,500 mensuales',
    'Entrega de pedidos en el área metropolitana.'
),
(
    'Mesero(a)',
    'Café Central',
    'Monterrey, N.L.',
    'Por horas',
    'Vespertino',
    '$7,500 mensuales',
    'Atención a clientes y servicio de alimentos.'
);