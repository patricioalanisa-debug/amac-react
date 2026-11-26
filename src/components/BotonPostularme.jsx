import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function BotonPostularme({ vacanteId }) {
  const { sesion, perfil, cargando } = useAuth();
  const [yaAplico, setYaAplico] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const usuarioId = sesion?.user.id;
  const esCandidato = perfil?.rol === "candidato";

  useEffect(() => {
    if (!esCandidato) return;
    let vigente = true;
    supabase
      .from("solicitudes")
      .select("id")
      .eq("vacante_id", vacanteId)
      .eq("candidato_id", usuarioId)
      .maybeSingle()
      .then(({ data }) => {
        if (vigente) setYaAplico(Boolean(data));
      });
    return () => {
      vigente = false;
    };
  }, [esCandidato, usuarioId, vacanteId]);

  async function postularme() {
    setMensaje("");
    setEnviando(true);
    const { error } = await supabase
      .from("solicitudes")
      .insert({ vacante_id: vacanteId, candidato_id: usuarioId });
    setEnviando(false);

    if (error?.code === "23505") {
      setYaAplico(true);
      setMensaje("Ya te postulaste a esta vacante.");
    } else if (error) {
      setMensaje("Tu registro aún no ha sido aprobado por AMAC. Por favor espera.");
    } else {
      setYaAplico(true);
      setMensaje("¡Listo! Tu solicitud fue enviada.");
    }
  }

  if (cargando || (sesion && !perfil)) return null;

  if (!sesion) {
    return (
      <>
        <div className="acciones">
          <Link className="boton boton--primario boton--bloque" to="/login">Postularme</Link>
        </div>
        <p className="resumen__nota">Para postularte necesitas iniciar sesión.</p>
      </>
    );
  }

  if (!esCandidato) {
    return <p className="resumen__nota">Solo los candidatos pueden postularse.</p>;
  }

  return (
    <>
      <div className="acciones">
        {yaAplico ? (
          <Link className="boton boton--secundario boton--bloque" to="/mis-solicitudes">
            Ver mis solicitudes
          </Link>
        ) : (
          <button
            className="boton boton--primario boton--bloque"
            type="button"
            onClick={postularme}
            disabled={enviando}
          >
            {enviando ? "Enviando…" : "Postularme"}
          </button>
        )}
      </div>
      {!perfil.aprobado && !yaAplico && (
        <p className="resumen__nota">Tu registro está pendiente de aprobación de AMAC.</p>
      )}
      {mensaje && <p role="status" className="resumen__nota"><strong>{mensaje}</strong></p>}
    </>
  );
}