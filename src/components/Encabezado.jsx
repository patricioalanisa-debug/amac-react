import { Link, NavLink } from "react-router-dom";

export default function Encabezado() {
  return (
    <>
      <div className="barra-ayuda">
        <div className="contenedor barra-ayuda__interior">
          <a href="tel:+528110223344">
            <img src="/img/icono-telefono.svg" alt="" width="24" height="24" />
            ¿Necesitas ayuda? Llama a AMAC: (81) 1022 3344
          </a>
        </div>
      </div>

      <header className="encabezado">
        <div className="contenedor encabezado__interior">
          <Link className="logo" to="/">
            <img src="/img/isotipo.svg" alt="" width="62" height="31" />
            <span className="logo__texto">
              <span className="logo__nombre">AMAC</span>
              <span className="logo__sub">Bolsa de trabajo</span>
            </span>
          </Link>
          <nav aria-label="Navegación principal">
            <ul className="menu__lista">
              <li><NavLink className="menu__enlace" to="/" end>Vacantes</NavLink></li>
              <li><NavLink className="menu__enlace" to="/quienes-somos">Quiénes somos</NavLink></li>
              <li><NavLink className="menu__enlace" to="/mis-solicitudes">Mis solicitudes</NavLink></li>
              <li><NavLink className="menu__enlace" to="/empresa/vacantes">Panel de empresa</NavLink></li>
              <li><NavLink className="menu__enlace menu__enlace--destacado" to="/login">Entrar</NavLink></li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}