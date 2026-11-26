import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function RegistroCandidato() {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setMensaje("");
    const f = new FormData(evento.currentTarget);

    if (!["nombre", "correo", "telefono", "colonia"].every(k => String(f.get(k) ?? "").trim()) || !f.get("terminos")) return setMensaje("Completa los campos obligatorios y acepta los términos.");
    if (String(f.get("clave")).length < 8) return setMensaje("La contraseña debe tener al menos 8 caracteres.");
    const edad = Number(f.get("edad"));
    if (!Number.isInteger(edad) || !(edad >= 18 && edad <= 120)) {
      return setMensaje("Escribe una edad entre 18 y 120 años.");
    }
    if (f.get("clave") !== f.get("clave2")) {
      return setMensaje("Las contraseñas no coinciden.");
    }

    const partes = [];
    if (f.get("puesto")) partes.push(`Último puesto: ${f.get("puesto")}`);
    if (f.get("empresa")) partes.push(`Empresa: ${f.get("empresa")}`);
    if (f.get("anios")) partes.push(`Años de experiencia: ${f.get("anios")}`);
    if (f.get("habilidades")) partes.push(`Habilidades: ${f.get("habilidades")}`);

    setEnviando(true);
    const { data, error } = await supabase.auth.signUp({
      email: f.get("correo").trim(),
      password: f.get("clave"),
      options: {
        data: {
          rol: "candidato",
          nombre: f.get("nombre").trim(),
          telefono: f.get("telefono").trim(),
          edad,
          colonia: f.get("colonia").trim(),
          experiencia: partes.join(". "),
        },
      },
    });
    setEnviando(false);

    if (error) {
      console.error(error);
      return setMensaje(
        error.code === "user_already_exists"
          ? "Ese correo ya tiene una cuenta."
          : "No pudimos crear tu cuenta. Revisa tus datos e inténtalo de nuevo."
      );
    }
    setExito(data.session ? "Tu cuenta fue creada. AMAC debe aprobarla antes de que puedas postularte." : "Revisa tu correo para confirmar tu cuenta. AMAC debe aprobarla antes de que puedas postularte.");
  }

  if (exito) return <div className="contenedor contenedor--estrecho"><h1>Registro recibido</h1><p role="status" className="aviso">{exito}</p><button className="boton boton--primario" onClick={() => navigate("/", { replace: true })}>Ver vacantes</button></div>;
  return (
    <div className="contenedor contenedor--estrecho">
      <Link className="enlace-volver" to="/login">← Volver al inicio de sesión</Link>
      <h1>Crear cuenta de candidato</h1>
      <p className="subtitulo">Llena tus datos. Los campos son necesarios para poder postularte.</p>

      <form onSubmit={enviar}>
        <fieldset className="grupo-campos">
          <legend>Datos personales</legend>
          <div className="campo-formulario">
            <label htmlFor="nombre">Nombre completo</label>
            <input type="text" id="nombre" name="nombre" autoComplete="name" required />
          </div>
          <div className="campos-dobles">
            <div className="campo-formulario">
              <label htmlFor="correo">Correo electrónico</label>
              <input type="email" id="correo" name="correo" autoComplete="email" required />
              <p className="campo-formulario__ayuda">Ejemplo: nombre@correo.com</p>
            </div>
            <div className="campo-formulario">
              <label htmlFor="telefono">Teléfono</label>
              <input type="tel" id="telefono" name="telefono" autoComplete="tel" required />
              <p className="campo-formulario__ayuda">Ejemplo: 81 1234 5678</p>
            </div>
            <div className="campo-formulario">
              <label htmlFor="edad">Edad</label>
              <input type="number" id="edad" name="edad" min="18" max="120" required />
            </div>
            <div className="campo-formulario">
              <label htmlFor="clave">Contraseña</label>
              <input type="password" id="clave" name="clave" autoComplete="new-password" minLength={8} required />
              <p className="campo-formulario__ayuda">Mínimo 8 caracteres.</p>
            </div>
            <div className="campo-formulario">
              <label htmlFor="clave2">Repetir contraseña</label>
              <input type="password" id="clave2" name="clave2" autoComplete="new-password" minLength={8} required />
            </div>
          </div>
        </fieldset>



        <fieldset className="grupo-campos">
          <legend>Dirección</legend>

          <div className="campos-dobles">
            <div className="campo-formulario">
              <label htmlFor="colonia">Colonia</label>
              <input type="text" id="colonia" name="colonia" required />
            </div>
          </div>
        </fieldset>

        <fieldset className="grupo-campos">
          <legend>Experiencia laboral</legend>
          <div className="campos-dobles">
            <div className="campo-formulario">
              <label htmlFor="puesto">Último puesto</label>
              <input type="text" id="puesto" name="puesto" />
              <p className="campo-formulario__ayuda">Ejemplo: Cajera</p>
            </div>
            <div className="campo-formulario">
              <label htmlFor="empresa">Empresa donde trabajaste</label>
              <input type="text" id="empresa" name="empresa" />
            </div>
            <div className="campo-formulario">
              <label htmlFor="anios">Años de experiencia</label>
              <input type="number" id="anios" name="anios" min="0" max="60" />
            </div>
          </div>
          <div className="campo-formulario">
            <label htmlFor="habilidades">Habilidades</label>
            <textarea id="habilidades" name="habilidades" />
            <p className="campo-formulario__ayuda">Ejemplo: atención a clientes, caja, computadora.</p>
          </div>
        </fieldset>

        <div className="opcion">
          <input type="checkbox" id="terminos" name="terminos" required />
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