import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function VacanteDetalle() {
  const { id } = useParams();
  const [vacante, setVacante] = useState(null);

  useEffect(() => {
    const cargarVacante = async () => {
      const { data, error } = await supabase
        .from("vacantes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.log(error);
      } else {
        setVacante(data);
      }
    };

    cargarVacante();
  }, [id]);

  if (!vacante) {
    return <p>Cargando vacante...</p>;
  }

  return (
    <main id="principal">
      <div className="contenedor">
        <h1>{vacante.titulo}</h1>

        <div className="dos-columnas">
          <div className="detalle-vacante">
            <section>
              <h2>Descripción</h2>
              <p>{vacante.descripcion}</p>
            </section>

            <section>
              <h2>Requisitos</h2>
              <p>{vacante.requisitos}</p>
            </section>

            <section>
              <h2>Prestaciones</h2>
              <p>{vacante.prestaciones}</p>
            </section>
          </div>

          <aside className="resumen">
            <h2>Resumen</h2>

            <dl>
              <dt>Sueldo</dt>
              <dd>${vacante.sueldo}</dd>

              <dt>Ubicación</dt>
              <dd>{vacante.ubicacion}</dd>

              <dt>Horario</dt>
              <dd>{vacante.horario}</dd>

              <dt>Categoría</dt>
              <dd>{vacante.categoria}</dd>
            </dl>

            {vacante.telefono_contacto && (
              <div className="acciones">
                <a
                  className="boton boton--primario"
                  href={`tel:${vacante.telefono_contacto}`}
                >
                  Llamar
                </a>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

export default VacanteDetalle;