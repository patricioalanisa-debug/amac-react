import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function Encabezado() {
  const { perfil, sesion, cargando } = useAuth();
  const navigate = useNavigate();
  const [cerrando, setCerrando] = useState(false);
  const [errorSalida, setErrorSalida] = useState("");
  async function cerrarSesion() {
    setCerrando(true); setErrorSalida("");
    try { const { error } = await supabase.auth.signOut(); if (error) throw error; navigate("/", { replace: true }); }
    catch { setErrorSalida("No pudimos cerrar sesión. Intenta nuevamente."); }
    finally { setCerrando(false); }
  }
  const [contraste, setContraste] = useState(() => {
    try {
      const guardado = localStorage.getItem("amac-contraste");
      if (guardado) return guardado === "alto";
    } catch { /* almacenamiento no disponible */ }
    return window.matchMedia("(prefers-contrast: more)").matches;
  });
  useEffect(() => {
    if (contraste) document.documentElement.setAttribute("data-contraste", "alto");
    else document.documentElement.removeAttribute("data-contraste");
    try { localStorage.setItem("amac-contraste", contraste ? "alto" : "normal"); } catch { /* sin almacenamiento */ }
  }, [contraste]);
  const enlaces = [{ ruta: "/", texto: "Vacantes", icono: "maletin" }];
  if (!cargando && !sesion) enlaces.push(
    { ruta: "/login", texto: "Iniciar sesión", icono: "usuario" },
    { ruta: "/registro", texto: "Registrarme", icono: "documento" }
  );
  if (!cargando && perfil?.rol === "candidato") enlaces.push({ ruta: "/mis-solicitudes", texto: "Mis solicitudes", icono: "lista" });
  if (!cargando && perfil?.rol === "empresa") enlaces.push({ ruta: "/empresa/vacantes", texto: "Mis vacantes", icono: "edificio" }, { ruta: "/empresa/solicitudes", texto: "Solicitudes", icono: "lista" });
  if (!cargando && perfil?.rol === "admin") enlaces.push({ ruta: "/admin", texto: "Administración", icono: "escudo" });
  return <>
    <a className="saltar-contenido" href="#principal">Saltar al contenido</a>
    <div className="barra-ayuda"><div className="contenedor barra-ayuda__interior">
      <a className="barra-ayuda__telefono" href="tel:+528110223344"><span className="icono icono--telefono" aria-hidden="true" />¿Necesitas ayuda? Llama a AMAC: (81) 1022 3344</a>
      <button className="boton boton--secundario boton--chico" id="boton-contraste" type="button" aria-pressed={contraste} onClick={() => setContraste(v => !v)}>Alto contraste</button>
    </div></div>
    <header className="encabezado"><div className="contenedor encabezado__interior">
      <Link className="logo" to="/"><img src="/isotipo.svg" alt="" width="62" height="31" /><span className="logo__texto"><span className="logo__nombre">AMAC</span><span className="logo__sub">Bolsa de trabajo</span></span></Link>
      <nav className="menu" aria-label="Navegación principal"><ul className="menu__lista">
        {enlaces.map(e => <li key={e.ruta}><NavLink end={e.ruta === "/"} className="menu__enlace" to={e.ruta}><span className="menu__icono"><span className={`icono icono--${e.icono}`} aria-hidden="true" /></span><span className="menu__texto">{e.texto}</span></NavLink></li>)}
        {sesion && <li><button className="menu__enlace menu__salir" type="button" onClick={cerrarSesion} disabled={cerrando}><span className="menu__icono"><span className="icono icono--usuario" aria-hidden="true" /></span><span className="menu__texto">{cerrando ? "Saliendo…" : "Cerrar sesión"}</span></button></li>}
      </ul></nav>
      {perfil && <p className="encabezado__rol">{perfil.nombre}</p>}
    </div>{errorSalida && <p className="aviso" role="alert">{errorSalida}</p>}</header>
  </>;
}
