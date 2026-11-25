import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setMensaje("");
    if (!correo || !contrasena) {
      setMensaje("Escribe tu correo y tu contraseña.");
      return;
    }
    setEnviando(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo,
      password: contrasena,
    });
    if (error) {
      setEnviando(false);
      setMensaje("Correo o contraseña incorrectos."); 
      return;
    }
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", data.user.id)
      .single();
    setEnviando(false);
    navigate(perfil?.rol === "empresa" ? "/empresa/vacantes" : "/mis-solicitudes");
  }

  return (
    <div className="contenedor contenedor--estrecho">
      <h1>Iniciar sesión</h1>
      <p className="subtitulo">Entra con tu correo y tu contraseña.</p>

      <form onSubmit={manejarEnvio} noValidate>
        <div className="campo-formulario">
          <label htmlFor="correo">Correo electrónico</label>
          <input
            type="email"
            id="correo"
            autoComplete="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>
        <div className="campo-formulario">
          <label htmlFor="contrasena">Contraseña</label>
          <input
            type="password"
            id="contrasena"
            autoComplete="current-password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />
        </div>

        {mensaje && <p role="alert" className="aviso">{mensaje}</p>}

        <div className="acciones">
          <button className="boton boton--primario boton--bloque" type="submit" disabled={enviando}>
            {enviando ? "Entrando…" : "Entrar"}
          </button>
          <Link className="boton boton--acento boton--bloque" to="/registro">
            Crear cuenta de candidato
          </Link>
        </div>
      </form>
    </div>
  );
}