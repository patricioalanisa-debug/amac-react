import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
export default function BotonPostularme({ vacanteId, estado }) {
  const { sesion, perfil, cargando, errorPerfil } = useAuth();
  const usuarioId = sesion?.user.id;
  const esCandidato = perfil?.rol === "candidato";
  const clave = `${usuarioId}:${vacanteId}`;
  const [consulta, setConsulta] = useState({ clave: "", aplicado: false, error: "" });
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  useEffect(() => {
    if (!esCandidato || !usuarioId) return;
    let vigente = true;
    async function cargar() {
      try {
        const { data, error } = await supabase.from("solicitudes").select("id").eq("vacante_id", vacanteId).eq("candidato_id", usuarioId).maybeSingle();
        if (error) throw error;
        if (vigente) setConsulta({ clave, aplicado: Boolean(data), error: "" });
      } catch { if (vigente) setConsulta({ clave, aplicado: false, error: "No pudimos verificar tu solicitud. Recarga la página." }); }
    }
    cargar(); return () => { vigente = false; };
  }, [esCandidato, usuarioId, vacanteId, clave]);
  const lista = consulta.clave === clave;
  const yaAplico = lista && consulta.aplicado;
  const permitido = lista && !consulta.error && !yaAplico && perfil?.aprobado && estado === "activa";
  async function postularme() {
    if (!permitido || enviando) return;
    setEnviando(true); setMensaje("");
    try {
      const { error } = await supabase.from("solicitudes").insert({ vacante_id: vacanteId, candidato_id: usuarioId });
      if (error?.code === "23505") { setConsulta({ clave, aplicado: true, error: "" }); setMensaje("Ya te postulaste a esta vacante."); }
      else if (error?.code === "42501") setMensaje("No puedes postularte. Comprueba la aprobación de tu cuenta y que la vacante siga activa.");
      else if (error) throw error;
      else { setConsulta({ clave, aplicado: true, error: "" }); setMensaje("¡Listo! Tu solicitud fue enviada."); }
    } catch { setMensaje("No pudimos enviar tu solicitud. Intenta nuevamente."); }
    finally { setEnviando(false); }
  }
  if (cargando) return <p role="status">Cargando sesión…</p>;
  if (errorPerfil) return <p role="alert">{errorPerfil}</p>;
  if (!sesion) return estado === "activa" ? <div className="acciones"><Link className="boton boton--primario boton--bloque" to="/login">Postularme</Link><p>Para postularte necesitas iniciar sesión.</p></div> : <p>Esta vacante no está activa.</p>;
  if (!esCandidato) return <p>Solo los candidatos pueden postularse.</p>;
  if (!lista) return <p role="status">Consultando solicitud…</p>;
  return <div className="acciones">
    {yaAplico ? <Link className="boton boton--secundario boton--bloque" to="/mis-solicitudes">Ver mis solicitudes</Link> : <button className="boton boton--primario boton--bloque" type="button" onClick={postularme} disabled={!permitido || enviando}>{enviando ? "Enviando…" : "Postularme"}</button>}
    {!yaAplico && !perfil.aprobado && <p>Tu cuenta está pendiente de aprobación de AMAC.</p>}
    {!yaAplico && estado !== "activa" && <p>Esta vacante no está activa.</p>}
    {consulta.error && <p role="alert">{consulta.error}</p>}
    {mensaje && <p role="status">{mensaje}</p>}
  </div>;
}
