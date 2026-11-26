import { Link } from "react-router-dom";

export default function Pie() {
  return (
    <footer className="pie">
      <div className="contenedor pie__interior">
        <div>
          <p className="pie__titulo"><strong>AMAC · asociAMayores A.C.</strong></p>
          <p>Envejecer es vivir.</p>
        </div>
        <div>
          <p className="pie__titulo"><strong>Contacto</strong></p>
          <address>
            Av. Gómez Morín #234, San Pedro Garza García, N.L.<br />
            <a href="tel:+528110223344">(81) 1022 3344</a><br />
            <a href="https://www.amac.org" target="_blank" rel="noopener noreferrer">
              www.amac.org<span className="solo-lector"> (se abre en una pestaña nueva)</span>
            </a>
          </address>
        </div>
        <nav aria-label="Enlaces del pie de página">
          <p className="pie__titulo"><strong>Ir a</strong></p>
          <ul className="pie__lista">
            <li><Link to="/">Vacantes</Link></li>
            <li><Link to="/quienes-somos">Quiénes somos</Link></li>
            <li><Link to="/mis-solicitudes">Mis solicitudes</Link></li>
            <li><Link to="/empresa/vacantes">Panel de empresa</Link></li>
            <li><Link to="/login">Iniciar sesión</Link></li>
          </ul>
        </nav>
      </div>
      <p className="pie__legal contenedor">© 2026 asociAMayores A.C. · Proyecto escolar OT2026-WEB</p>
    </footer>
  );
}