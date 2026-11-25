import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const vacio = {
  nombre: "",
  correo: "",
  telefono: "",
  edad: "",
  colonia: "",
  experiencia: "",
  contrasena: "",
  contrasena2: "",
};

export default function RegistroCandidato() {
  const navigate = useNavigate();
  const [datos, setDatos] = useState(vacio);
  const [terminos, setTerminos] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  function cambiar(evento) {
    setDatos({ ...datos, [evento.target.name]: evento.target.value });
  }

  async function enviar(evento) {
    evento.preventDefault();
    setMensaje("");

    const edad = Number(datos.edad);
    if (!datos.nombre || !datos.correo || !datos.telefono || !datos.colonia) {
      return setMensaje("Llena todos los campos obligatorios.");
    }
    if (!(edad >= 18 && edad <= 120)) {
      return setMensaje("Escribe una edad entre 18 y 120 años.");
    }
    if (datos.contrasena.length < 8) {
      return setMensaje("La contraseña debe tener al menos 8 caracteres.");
    }
    if (datos.contrasena !== datos.contrasena2) {
      return setMensaje("Las contraseñas no coinciden.");
    }
    if (!terminos) {
      return setMensaje("Debes aceptar los términos y el aviso de privacidad.");
    }

    setEnviando(true);
    const { error } = await supabase.auth.signUp({
      email: datos.correo,
      password: datos.contrasena,
      options: {
        data: {
          rol: "candidato",
          nombre: datos.nombre,
          telefono: datos.telefono,
          edad,
          colonia: datos.colonia,
          experiencia: datos.experiencia,
        },
      },
    });
    setEnviando(false);

    if (error) {
      return setMensaje(
        error.code === "user_already_exists"
          ? "Ese correo ya tiene una cuenta."
          : "No pudimos crear tu cuenta. Revisa tus datos e inténtalo de nuevo."
      );
    }
    navigate("/");
  }

  return (
    <div className="contenedor contenedor--estrecho">
      <Link className="enlace-volver" to="/login">← Volver al inicio de sesión</Link>
      <h1>Crear cuenta de candidato</h1>
      <p className="subtitulo">Llena tus datos. Después AMAC revisará tu registro.</p>

      <form onSubmit={enviar} noValidate>
        <fieldset className="grupo-campos">
          <legend>Datos personales</legend>
          <div className="campo-formulario">
            <label htmlFor="nombre">Nombre completo</label>
            <input id="nombre" name="nombre" type="text" autoComplete="name"
              value={datos.nombre} onChange={cambiar} />
          </div>
          <div className="campos-dobles">
            <div className="campo-formulario">
              <label htmlFor="correo">Correo electrónico</label>
              <input id="correo" name="correo" type="email" autoComplete="email"
                value={datos.correo} onChange={cambiar} />
            </div>
            <div className="campo-formulario">
              <label htmlFor="telefono">Teléfono</label>
              <input id="telefono" name="telefono" type="tel" autoComplete="tel"
                value={datos.telefono} onChange={cambiar} />
            </div>
            <div className="campo-formulario">
              <label htmlFor="edad">Edad</label>
              <input id="edad" name="edad" type="number" min="18" max="120"
                value={datos.edad} onChange={cambiar} />
            </div>
            <div className="campo-formulario">
              <label htmlFor="colonia">Colonia</label>
              <input id="colonia" name="colonia" type="text"
                value={datos.colonia} onChange={cambiar} />
            </div>
            <div className="campo-formulario">
              <label htmlFor="contrasena">Contraseña</label>
              <input id="contrasena" name="contrasena" type="password"
                autoComplete="new-password" value={datos.contrasena} onChange={cambiar} />
              <p className="campo-formulario__ayuda">Mínimo 8 caracteres.</p>
            </div>
            <div className="campo-formulario">
              <label htmlFor="contrasena2">Repetir contraseña</label>
              <input id="contrasena2" name="contrasena2" type="password"
                autoComplete="new-password" value={datos.contrasena2} onChange={cambiar} />
            </div>
          </div>
        </fieldset>

        <fieldset className="grupo-campos">
          <legend>Experiencia laboral</legend>
          <div className="campo-formulario">
            <label htmlFor="experiencia">Tu experiencia y habilidades</label>
            <textarea id="experiencia" name="experiencia"
              value={datos.experiencia} onChange={cambiar} />
            <p className="campo-formulario__ayuda">
              Ejemplo: 4 años como cajera, atención a clientes.
            </p>
          </div>
        </fieldset>

        <div className="opcion">
          <input id="terminos" type="checkbox" checked={terminos}
            onChange={(e) => setTerminos(e.target.checked)} />
          <label htmlFor="terminos">Acepto los términos y el aviso de privacidad</label>
        </div>

        {mensaje && <p role="alert" className="aviso">{mensaje}</p>}

        <div className="acciones acciones--fila">
          <button className="boton boton--primario" type="submit" disabled={enviando}>
            {enviando ? "Creando cuenta…" : "Crear mi cuenta"}
          </button>
          <Link className="boton boton--secundario" to="/login">Ya tengo cuenta</Link>
        </div>
      </form>
    </div>
  );
}