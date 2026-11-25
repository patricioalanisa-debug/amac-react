import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Home() {
  const [vacantes, setVacantes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [horario, setHorario] = useState("");
  const [tipoEmpleo, setTipoEmpleo] = useState("");

  useEffect(() => {
    const cargarVacantes = async () => {
      const { data, error } = await supabase
        .from("vacantes")
        .select("*");

      if (error) {
        console.log(error);
      } else {
        setVacantes(data);
      }
    };

    cargarVacantes();
  }, []);

  const vacantesFiltradas = vacantes.filter((vacante) => {
    const coincideBusqueda =
      vacante.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      vacante.empresa.toLowerCase().includes(busqueda.toLowerCase());

    const coincideHorario =
      horario === "" || vacante.horario === horario;

    const coincideTipoEmpleo =
      tipoEmpleo === "" || vacante.tipo_empleo === tipoEmpleo;

    return coincideBusqueda && coincideHorario && coincideTipoEmpleo;
  });

  return (
    <main>
      <h1>Vacantes disponibles</h1>

      <input
        type="text"
        placeholder="Buscar vacante..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <select
        value={horario}
        onChange={(e) => setHorario(e.target.value)}
      >
        <option value="">Todos los horarios</option>
        <option value="Matutino">Matutino</option>
        <option value="Vespertino">Vespertino</option>
      </select>

      <select
        value={tipoEmpleo}
        onChange={(e) => setTipoEmpleo(e.target.value)}
      >
        <option value="">Todos los tipos de empleo</option>
        <option value="Tiempo completo">Tiempo completo</option>
        <option value="Medio tiempo">Medio tiempo</option>
        <option value="Por horas">Por horas</option>
      </select>

      {vacantesFiltradas.map((vacante) => (
        <article key={vacante.id}>
          <h2>{vacante.titulo}</h2>
          <p>{vacante.empresa}</p>
          <p>{vacante.ubicacion}</p>
          <p>{vacante.tipo_empleo}</p>
          <p>{vacante.horario}</p>
          <p>{vacante.salario}</p>

          <Link to={`/vacante/${vacante.id}`}>
            Ver vacante
          </Link>
        </article>
      ))}
    </main>
  );
}

export default Home;