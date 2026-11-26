import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const ESTATUS = {
  "Enviada": { clase: "revision", texto: "Enviada" },
  "En revisión": { clase: "revision", texto: "En revisión" },
  "Aceptada": { clase: "aceptado", texto: "Aceptada" },
  "Rechazada": { clase: "rechazado", texto: "Rechazada" },
  "Cancelada": { clase: "pausada", texto: "Cancelada" },
};

export default function MisSolicitudes() {
  const { sesion } = useAuth();
  const usuarioId = sesion?.user.id;
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cancelando, setCancelando] = useState(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!usuarioId) return;
    let vigente = true;
    async function cargar() {
      const { data, error } = await supabase
        .from("solicitudes")
        .select("id, estatus, creada_en, vacante:vacantes(id, titulo, empresa:perfiles(nombre))")
        .eq("candidato_id", usuarioId)
        .order("creada_en", { ascending: false });
      if (!vigente) return;
      if (error) {
        console.error(error);
        setMensaje("No pudimos cargar tus solicitudes.");
      } else {
        setSolicitudes(data);
      }
      setCargando(false);
    }
    cargar();
    return () => {
      vigente = false;
    };
  }, [usuarioId]);

  async function cancelar(solicitud) {
    if (cancelando !== null) return;
    if (!window.confirm("¿Seguro que quieres cancelar esta solicitud?")) return;
    setMensaje("");
    setCancelando(solicitud.id);
    try {
    const { data, error } = await supabase
      .from("solicitudes")
      .update({ estatus: "Cancelada" })
      .eq("id", solicitud.id)
      .eq("candidato_id", usuarioId)
      .in("estatus", ["Enviada", "En revisión"])
      .select("id");
    if (error || !data || data.length === 0) {
      setMensaje("No pudimos cancelar la solicitud. Puede que ya haya sido resuelta.");
      return;
    }
    setSolicitudes(
      anteriores => anteriores.map((s) => (s.id === solicitud.id ? { ...s, estatus: "Cancelada" } : s))
    );
    } catch { setMensaje("No pudimos cancelar la solicitud. Intenta nuevamente."); }
    finally { setCancelando(null); }
  }

  return (
    <div className="contenedor">
      <h1>Mis solicitudes</h1>
      <p className="subtitulo">Aquí ves cómo va cada una.</p>
      <div className="aviso">
        <p>Consulta aquí el estatus actualizado de tus solicitudes.</p>
      </div>

      {mensaje && <p role="alert" className="aviso">{mensaje}</p>}
      {cargando && <p role="status">Cargando tus solicitudes…</p>}

      {!cargando && solicitudes.length === 0 && !mensaje && (
        <>
          <p>Aún no tienes solicitudes.</p>
          <div className="acciones acciones--fila">
            <Link className="boton boton--primario" to="/">Ver vacantes</Link>
          </div>
        </>
      )}

      <section className="lista-tarjetas lista-tarjetas--doble" aria-label="Lista de solicitudes">
        {solicitudes.map((s) => {
          const estatus = ESTATUS[s.estatus] ?? ESTATUS["Enviada"];
          const sePuedeCancelar = s.estatus === "Enviada" || s.estatus === "En revisión";
          return (
            <article className="tarjeta-vacante" key={s.id}>
              <h2 className="tarjeta-vacante__titulo">{s.vacante?.titulo}</h2>
              <p className="tarjeta-vacante__empresa">
                {s.vacante?.empresa?.nombre ?? "Empresa no disponible"}
              </p>
              <p className={`etiqueta-estatus etiqueta-estatus--${estatus.clase}`}>
                {estatus.texto}
              </p>
              <ul className="tarjeta-vacante__datos">
                <li>
                  <strong>Enviada:</strong>{" "}
                  <time dateTime={s.creada_en}>
                    {new Date(s.creada_en).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                </li>
              </ul>
              {sePuedeCancelar && (
                <div className="tarjeta-vacante__acciones">
                  <button
                    className="boton boton--secundario"
                    type="button"
                    onClick={() => cancelar(s)}
                    disabled={cancelando !== null}
                  >
                    {cancelando === s.id ? "Cancelando…" : "Cancelar solicitud"}
                    <span className="solo-lector"> de {s.vacante?.titulo}</span>
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}