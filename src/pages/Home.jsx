import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import TarjetaVacante from "../components/TarjetaVacante";

function Home() {
  const [vacantes, setVacantes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [horario, setHorario] = useState("");
  const [categoria, setCategoria] = useState("");

  useEffect(() => {
    const cargarVacantes = async () => {
      const { data, error } = await supabase
        .from("vacantes")
        .select("*")
        .eq("estado", "activa");

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
      vacante.ubicacion.toLowerCase().includes(busqueda.toLowerCase());

    const coincideHorario =
      horario === "" || vacante.horario === horario;

    const coincideCategoria =
      categoria === "" || vacante.categoria === categoria;

    return coincideBusqueda && coincideHorario && coincideCategoria;
  });

  return (
    <main id="principal">
      <div className="contenedor">
        <h1>Vacantes disponibles</h1>
        <p className="subtitulo">
          Encuentra trabajo cerca de ti.
        </p>

        <div className="buscador">
          <div className="campo-formulario">
            <label htmlFor="buscar">
              Buscar por título o ubicación
            </label>

            <input
              type="search"
              id="buscar"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="filtros">
          <fieldset className="grupo-campos">
            <legend>Filtrar vacantes</legend>

            <div className="filtros__campos">
              <div className="campo-formulario">
                <label htmlFor="horario">Horario</label>

                <select
                  id="horario"
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                >
                  <option value="">Todos los horarios</option>
                  <option value="Matutino">Matutino</option>
                  <option value="Vespertino">Vespertino</option>
                  <option value="Medio tiempo">Medio tiempo</option>
                  <option value="Fines de semana">
                    Fines de semana
                  </option>
                </select>
              </div>

              <div className="campo-formulario">
                <label htmlFor="categoria">Categoría</label>

                <select
                  id="categoria"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  <option value="Administración">
                    Administración
                  </option>
                  <option value="Atención al cliente">
                    Atención al cliente
                  </option>
                  <option value="Alimentos">Alimentos</option>
                  <option value="Transporte">Transporte</option>
                </select>
              </div>
            </div>
          </fieldset>
        </div>

        {vacantesFiltradas.length === 0 ? (
          <p>No hay vacantes para mostrar</p>
        ) : (
          <section
            className="lista-tarjetas"
            aria-label="Lista de vacantes"
          >
            {vacantesFiltradas.map((vacante) => (
              <TarjetaVacante
                key={vacante.id}
                vacante={vacante}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

export default Home;