import { Link } from "react-router-dom";
export default function TarjetaVacante({ vacante }) {
  const sueldo = Number(vacante.sueldo).toLocaleString("es-MX", {style:"currency",currency:"MXN",maximumFractionDigits:2});
  return <article className="tarjeta-vacante">
    <h2 className="tarjeta-vacante__titulo">{vacante.titulo}</h2>
    <p className="tarjeta-vacante__empresa">{vacante.empresa?.nombre ?? "Empresa no disponible"}</p>
    <ul className="tarjeta-vacante__datos">
      {[["dinero","Sueldo",`${sueldo} mensuales`],["ubicacion","Ubicación",vacante.ubicacion],["reloj","Horario",vacante.horario],["maletin","Categoría",vacante.categoria]].map(([icono, etiqueta, valor]) => <li key={etiqueta}><span className={`icono icono--${icono}`} aria-hidden="true"/><span><strong>{etiqueta}: </strong>{valor}</span></li>)}
    </ul>
    <div className="tarjeta-vacante__acciones"><Link className="boton boton--primario" to={`/vacante/${vacante.id}`}>Ver vacante<span className="solo-lector">: {vacante.titulo}</span></Link></div>
  </article>;
}
