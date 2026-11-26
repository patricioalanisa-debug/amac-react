import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import BotonPostularme from "../components/BotonPostularme";

function VacanteDetalle() {
  const { id } = useParams();
  const [vacante, setVacante] = useState(null);

  const [resultado, setResultado] = useState({ id: null, error: "" });
  useEffect(() => {
    let vigente = true;
    async function cargarVacante() {
      try {
        const { data, error } = await supabase.from("vacantes")
          .select("*, empresa:perfiles(nombre)").eq("id", id).maybeSingle();
        if (error) throw error;
        if (vigente) { setVacante(data); setResultado({ id, error: "" }); }
      } catch (error) {
        console.error(error);
        if (vigente) { setVacante(null); setResultado({ id, error: "No pudimos cargar la vacante." }); }
      }
    }
    cargarVacante();
    return () => { vigente = false; };
  }, [id]);
  if (resultado.id !== id) return <div className="contenedor"><p role="status">Cargando vacante…</p></div>;
  if (resultado.error || !vacante) return <div className="contenedor"><h1>Vacante no disponible</h1><p role="alert">{resultado.error || "No encontramos esta vacante."}</p><Link to="/" className="enlace-volver">Volver a vacantes</Link></div>;

  return (
    <div>
      <div className="contenedor">
        <Link to="/" className="enlace-volver">← Volver a vacantes</Link>
        <h1>{vacante.titulo}</h1>
        <p className="subtitulo">{vacante.empresa?.nombre ?? "Empresa no disponible"}</p>

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
            <BotonPostularme vacanteId={vacante.id} />
            <dl>
              <dt>Sueldo</dt>
              <dd>{Number(vacante.sueldo).toLocaleString("es-MX", {style:"currency",currency:"MXN"})} mensuales</dd>

              <dt>Ubicación</dt>
              <dd>{vacante.ubicacion}</dd>

              <dt>Horario</dt>
              <dd>{vacante.horario}</dd>

              <dt>Estado</dt>
              <dd>{vacante.estado}</dd>
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
    </div>
  );
}

export default VacanteDetalle;