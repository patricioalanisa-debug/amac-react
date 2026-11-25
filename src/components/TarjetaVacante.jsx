import { Link } from "react-router-dom";

function TarjetaVacante({ vacante }) {
  return (
    <article className="tarjeta-vacante">
      <h2 className="tarjeta-vacante__titulo">
        {vacante.titulo}
      </h2>

      <ul className="tarjeta-vacante__datos">
        <li>
          <strong>Sueldo:</strong> ${vacante.sueldo}
        </li>
        <li>
          <strong>Ubicación:</strong> {vacante.ubicacion}
        </li>
        <li>
          <strong>Horario:</strong> {vacante.horario}
        </li>
        <li>
          <strong>Categoría:</strong> {vacante.categoria}
        </li>
      </ul>

      <div className="tarjeta-vacante__acciones">
        <Link
          className="boton boton--primario"
          to={`/vacante/${vacante.id}`}
        >
          Ver vacante
        </Link>
      </div>
    </article>
  );
}

export default TarjetaVacante;