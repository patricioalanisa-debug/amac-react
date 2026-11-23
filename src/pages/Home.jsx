import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

function Home() {
  const [vacantes, setVacantes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [horario, setHorario] = useState("");

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

    return coincideBusqueda && coincideHorario;
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