import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function VacanteDetalle() {
  const { id } = useParams();
  const [vacante, setVacante] = useState(null);

  useEffect(() => {
    const cargarVacante = async () => {
      const { data, error } = await supabase
        .from("vacantes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.log(error);
      } else {
        setVacante(data);
      }
    };

    cargarVacante();
  }, [id]);

  if (!vacante) {
    return <p>Cargando vacante...</p>;
  }

  return (
    <main>
      <h1>{vacante.titulo}</h1>
      <p>{vacante.empresa}</p>
      <p>{vacante.ubicacion}</p>
      <p>{vacante.tipo_empleo}</p>
      <p>{vacante.horario}</p>
      <p>{vacante.salario}</p>
      <p>{vacante.descripcion}</p>
    </main>
  );
}

export default VacanteDetalle;