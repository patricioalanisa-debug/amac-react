import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import BotonPostularme from "../components/BotonPostularme";

function VacanteDetalle() {
  const { id } = useParams();
  const { perfil, cargando } = useAuth();
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

  const estados = { activa: ["Activa", "aceptado"], pausada: ["Pausada", "pausada"], cerrada: ["Cerrada", "rechazado"] };
  const [estadoTexto, estadoClase] = estados[vacante.estado] ?? [vacante.estado, "revision"];
  const empresa = vacante.empresa?.nombre ?? "Empresa no disponible";
  const sueldo = Number(vacante.sueldo).toLocaleString("es-MX", { style: "currency", currency: "MXN" });
  const secciones = [
    { titulo: "Descripción", icono: "documento", texto: vacante.descripcion },
    { titulo: "Requisitos", icono: "lista", texto: vacante.requisitos },
    { titulo: "Prestaciones", icono: "escudo", texto: vacante.prestaciones },
  ];
  const datos = [
    { titulo: "Ubicación", icono: "ubicacion", texto: vacante.ubicacion },
    { titulo: "Horario", icono: "reloj", texto: vacante.horario },
    { titulo: "Categoría", icono: "maletin", texto: vacante.categoria },
    { titulo: "Empresa", icono: "edificio", texto: empresa },
  ];
  return (
    <div className="contenedor ficha-vacante">
      <Link to="/" className="enlace-volver">← Volver a vacantes</Link>
      <header className="ficha-vacante__cabecera">
        <p className="sobre-titulo">Bolsa de trabajo · Detalle de vacante</p>
        <div className="ficha-vacante__titulo">
          <span className="ficha-vacante__simbolo"><span className="icono icono--maletin" aria-hidden="true" /></span>
          <div><h1>{vacante.titulo}</h1><p className="ficha-vacante__empresa"><span className="icono icono--edificio" aria-hidden="true" />{empresa}</p></div>
        </div>
        <div className="ficha-vacante__etiquetas">
          <span className={`etiqueta-estatus etiqueta-estatus--${estadoClase}`}>{estadoTexto}</span>
          <span className="ficha-vacante__chip"><span className="icono icono--maletin" aria-hidden="true" />{vacante.categoria}</span>
          <span className="ficha-vacante__chip"><span className="icono icono--reloj" aria-hidden="true" />{vacante.horario}</span>
        </div>
      </header>
      <div className="ficha-vacante__rejilla">
        <div className="ficha-vacante__secciones">
          {secciones.map(s => <section key={s.titulo} className="ficha-vacante__tarjeta">
            <h2><span className="ficha-vacante__icono"><span className={`icono icono--${s.icono}`} aria-hidden="true" /></span>{s.titulo}</h2>
            <p>{s.texto || "Información no indicada."}</p>
          </section>)}
        </div>
        <aside className="ficha-vacante__lateral" aria-label="Resumen de la vacante">
          <div className="ficha-vacante__sueldo">
            <h2><span className="icono icono--dinero" aria-hidden="true" /> Sueldo mensual</h2>
            <p>{sueldo}</p><span>MXN al mes</span>
          </div>
          <div className="ficha-vacante__resumen">
            <h2>Información del puesto</h2>
            <dl>{datos.map(d => <div key={d.titulo}><dt><span className={`icono icono--${d.icono}`} aria-hidden="true" />{d.titulo}</dt><dd>{d.texto || "No indicada"}</dd></div>)}</dl>
            <div className="ficha-vacante__accion">
              {!cargando && perfil?.rol === "admin" ? <p className="ficha-vacante__nota"><span className="icono icono--escudo" aria-hidden="true" />Vista de administrador. Consulta informativa.</p> : !cargando && perfil?.rol === "empresa" ? <><p className="ficha-vacante__nota"><span className="icono icono--edificio" aria-hidden="true" />Vista de empresa. Solo los candidatos pueden postularse.</p>{perfil.id === vacante.empresa_id && <Link className="boton boton--secundario boton--bloque" to="/empresa/vacantes">Administrar mis vacantes</Link>}</> : <BotonPostularme key={vacante.id} vacanteId={vacante.id} estado={vacante.estado} />}
              {vacante.telefono_contacto && <a className="boton boton--secundario boton--bloque" href={`tel:${vacante.telefono_contacto}`}><span className="icono icono--telefono" aria-hidden="true" />Llamar</a>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default VacanteDetalle;
