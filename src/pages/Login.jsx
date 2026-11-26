import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function iniciarSesion(evento) {
    evento.preventDefault();
    setMensaje("");
    const formulario = new FormData(evento.currentTarget);
    setEnviando(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formulario.get("correo").trim(),
      password: formulario.get("clave"),
    });
    if (error) {
      setEnviando(false);
      setMensaje("Correo o contraseña incorrectos."); 
      return;
    }

    const { data: perfil, error: errorPerfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", data.user.id)
      .single();
    if (errorPerfil || !perfil || perfil.rol !== formulario.get("rol")) {
      const { error: salida } = await supabase.auth.signOut();
      setEnviando(false);
      setMensaje(salida ? "No pudimos cerrar la sesión. Intenta nuevamente." : "No pudimos iniciar sesión con ese tipo de cuenta.");
      return;
    }
    setEnviando(false);

    const destinos = { candidato: "/mis-solicitudes", empresa: "/", admin: "/" };
    navigate(destinos[perfil?.rol] ?? "/");
  }

  const aviso = mensaje && <p role="alert" className="aviso">{mensaje}</p>;

  return (
    <div className="contenedor contenedor--estrecho">
      <h1>Iniciar sesión</h1>
      <p className="subtitulo">Elige cómo quieres entrar.</p>

      <div className="selector-acceso">
        <fieldset className="selector-acceso__grupo">
          <legend>¿Quién eres?</legend>
          <input className="selector-acceso__radio" type="radio" name="tipo" id="tipo-candidato" defaultChecked />
          <label className="selector-acceso__opcion" htmlFor="tipo-candidato">Candidato</label>
          <input className="selector-acceso__radio" type="radio" name="tipo" id="tipo-empresa" />
          <label className="selector-acceso__opcion" htmlFor="tipo-empresa">Empresa</label>
          <input className="selector-acceso__radio" type="radio" name="tipo" id="tipo-admin" />
          <label className="selector-acceso__opcion" htmlFor="tipo-admin">Administrador</label>
          <input className="selector-acceso__radio" type="radio" name="tipo" id="tipo-visitante" />
          <label className="selector-acceso__opcion" htmlFor="tipo-visitante">Visitante</label>
        </fieldset>

        <section className="panel panel-candidato" aria-labelledby="titulo-candidato">
          <h2 id="titulo-candidato">Entrar como candidato</h2>
          <form onSubmit={iniciarSesion}>
            <input type="hidden" name="rol" value="candidato" />
            <div className="campo-formulario">
              <label htmlFor="candidato-correo">Correo electrónico</label>
              <input type="email" id="candidato-correo" name="correo" autoComplete="email" required />
              <p className="campo-formulario__ayuda">Ejemplo: nombre@correo.com</p>
            </div>
            <div className="campo-formulario">
              <label htmlFor="candidato-clave">Contraseña</label>
              <input type="password" id="candidato-clave" name="clave" autoComplete="current-password" required />
            </div>
            {aviso}
            <div className="acciones">
              <button className="boton boton--primario boton--bloque" type="submit" disabled={enviando}>
                {enviando ? "Entrando…" : "Entrar"}
              </button>
              <Link className="boton boton--acento boton--bloque" to="/registro">Crear cuenta de candidato</Link>
            </div>
          </form>
          <p className="resumen__nota">
            ¿Olvidaste tu contraseña? <a href="tel:+528110223344">Llama a AMAC</a> y te ayudamos.
          </p>
        </section>

        <section className="panel panel-empresa" aria-labelledby="titulo-empresa">
          <h2 id="titulo-empresa">Entrar como empresa</h2>
          <form onSubmit={iniciarSesion}>
            <input type="hidden" name="rol" value="empresa" />
            <div className="campo-formulario">
              <label htmlFor="empresa-correo">Correo de la empresa</label>
              <input type="email" id="empresa-correo" name="correo" autoComplete="email" required />
              <p className="campo-formulario__ayuda">Ejemplo: contacto@miempresa.mx</p>
            </div>
            <div className="campo-formulario">
              <label htmlFor="empresa-clave">Contraseña</label>
              <input type="password" id="empresa-clave" name="clave" autoComplete="current-password" required />
            </div>
            {aviso}
            <div className="acciones">
              <button className="boton boton--primario boton--bloque" type="submit" disabled={enviando}>
                {enviando ? "Entrando…" : "Entrar"}
              </button>
            </div>
          </form>
          <p className="resumen__nota">
            ¿Tu empresa aún no está registrada? <a href="tel:+528110223344">Llama a AMAC</a> para registrarla.
          </p>
        </section>

        <section className="panel panel-admin" aria-labelledby="titulo-admin">
          <h2 id="titulo-admin">Entrar como administrador</h2>
          <p>Solo para el equipo de AMAC.</p>
          <form onSubmit={iniciarSesion}>
            <input type="hidden" name="rol" value="admin" />
            <div className="campo-formulario">
              <label htmlFor="admin-correo">Correo institucional</label>
              <input type="email" id="admin-correo" name="correo" autoComplete="email" required />
              <p className="campo-formulario__ayuda">Ejemplo: nombre@amac.org</p>
            </div>
            <div className="campo-formulario">
              <label htmlFor="admin-clave">Contraseña</label>
              <input type="password" id="admin-clave" name="clave" autoComplete="current-password" required />
            </div>
            {aviso}
            <div className="acciones">
              <button className="boton boton--primario boton--bloque" type="submit" disabled={enviando}>
                {enviando ? "Entrando…" : "Entrar"}
              </button>
            </div>
          </form>
        </section>

        <section className="panel panel-visitante" aria-labelledby="titulo-visitante">
          <h2 id="titulo-visitante">Entrar como visitante</h2>
          <p>Puedes entrar sin crear una cuenta y:</p>
          <ul>
            <li>Ver las vacantes disponibles</li>
            <li>Consultar los detalles de las ofertas</li>
            <li>Consultar el nombre de las empresas</li>
          </ul>
          <div className="acciones">
            <Link className="boton boton--primario boton--bloque" to="/">Entrar como visitante</Link>
          </div>
          <p className="resumen__nota">Para postularte a una vacante necesitas una cuenta de candidato.</p>
        </section>
      </div>
    </div>
  );
}