import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function Pie() {
  const { sesion, cargando, perfil } = useAuth();
  return <footer className="pie">
    <div className="contenedor pie__interior">
      <div><p className="pie__titulo">AMAC · asociAMayores A.C.</p><p>Envejecer es vivir.</p></div>
      <div><p className="pie__titulo">Contacto</p><address><a href="tel:+528110223344">(81) 1022 3344</a></address></div>
      <nav aria-label="Enlaces del pie de página"><p className="pie__titulo">Ir a</p><ul className="pie__lista"><li><Link to="/">Vacantes</Link></li>{perfil?.rol === "candidato" && <li><Link to="/mis-solicitudes">Mis solicitudes</Link></li>}{perfil?.rol === "empresa" && <><li><Link to="/empresa/vacantes">Mis vacantes</Link></li><li><Link to="/empresa/solicitudes">Solicitudes recibidas</Link></li></>}{!cargando && !sesion && <><li><Link to="/login">Iniciar sesión</Link></li><li><Link to="/registro">Registrarme</Link></li><li><Link to="/registro-empresa">Registrar empresa</Link></li></>}</ul></nav>
    </div><p className="pie__legal contenedor">© 2026 asociAMayores A.C. · Proyecto escolar OT2026-WEB</p>
  </footer>;
}
