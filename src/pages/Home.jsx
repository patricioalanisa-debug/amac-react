import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import TarjetaVacante from "../components/TarjetaVacante";

function Home() {
  const [vacantes, setVacantes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [horario, setHorario] = useState("");
  const [categoria, setCategoria] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    let vigente = true;
    async function cargarVacantes() {
      try {
        const { data, error } = await supabase.from("vacantes")
          .select("*, empresa:perfiles(nombre)")
          .eq("estado", "activa").order("creada_en", { ascending: false });
        if (error) throw error;
        if (vigente) setVacantes(data ?? []);
      } catch (error) {
        console.error(error);
        if (vigente) setMensajeError("No pudimos cargar las vacantes. Intenta recargar la página.");
      } finally { if (vigente) setCargando(false); }
    }
    cargarVacantes();
    return () => { vigente = false; };
  }, []);

  const categorias = [...new Set(vacantes.map(v => v.categoria))].sort((a,b) => a.localeCompare(b, "es"));

  const vacantesFiltradas = vacantes.filter((vacante) => {
    const coincideBusqueda =
      vacante.titulo.toLowerCase().includes(busqueda.trim().toLowerCase()) ||
      vacante.ubicacion.toLowerCase().includes(busqueda.trim().toLowerCase());

    const coincideHorario =
      horario === "" || vacante.horario === horario;

    const coincideCategoria =
      categoria === "" || vacante.categoria === categoria;

    return coincideBusqueda && coincideHorario && coincideCategoria;
  });

  return (
    <div>
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
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </fieldset>
        </div>

        {cargando ? <p role="status">Cargando vacantes…</p> : mensajeError ? <p role="alert" className="aviso">{mensajeError}</p> : vacantesFiltradas.length === 0 ? (
          <p role="status">No hay vacantes para mostrar</p>
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
    </div>
  );
}

export default Home;