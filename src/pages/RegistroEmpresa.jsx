import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
export default function RegistroEmpresa() {
  const [ocupado,setOcupado]=useState(false), [error,setError]=useState(""), [exito,setExito]=useState("");
  const navigate=useNavigate();
  async function registrar(e) {
    e.preventDefault(); if(ocupado) return;
    const f=new FormData(e.currentTarget); const nombre=f.get("nombre").trim(), giro=f.get("giro").trim(), telefono=f.get("telefono").trim();
    if(!nombre || !giro || !/^[+\d ()-]{7,25}$/.test(telefono) || telefono.replace(/\D/g, "").length<7) {setError("Completa los datos y escribe un teléfono válido.");return;}
    setOcupado(true);setError("");
    try {
      const {data,error}=await supabase.auth.signUp({email:f.get("correo").trim(),password:f.get("clave"),options:{data:{rol:"empresa",nombre,giro,telefono}}});
      if(error) throw error;
      if(data.session) navigate("/empresa/vacantes",{replace:true});
      else setExito("Revisa tu correo para confirmar la cuenta. Después inicia sesión como empresa.");
    } catch {setError("No pudimos crear la cuenta. Revisa los datos e intenta nuevamente.");} finally {setOcupado(false);}
  }
  return <div className="contenedor contenedor--estrecho"><Link className="enlace-volver" to="/login">← Volver a iniciar sesión</Link><h1>Registrar empresa</h1><p className="subtitulo">Crea una cuenta para publicar oportunidades laborales.</p>
    {exito ? <><p className="aviso" role="status">{exito}</p><Link className="boton boton--primario" to="/login">Iniciar sesión</Link></> : <form onSubmit={registrar}><fieldset className="grupo-campos"><legend>Datos de la empresa</legend>
    {[["nombre","Nombre de la empresa","text","organization"],["giro","Giro de la empresa","text","off"],["telefono","Teléfono","tel","tel"],["correo","Correo electrónico","email","email"],["clave","Contraseña","password","new-password"]].map(([id,label,type,auto])=><div className="campo-formulario" key={id}><label htmlFor={id}>{label}</label><input id={id} name={id} type={type} autoComplete={auto} required minLength={id==="clave"?8:undefined} /></div>)}<p>Mínimo 8 caracteres para la contraseña.</p></fieldset>
    {error && <p className="aviso" role="alert">{error}</p>}<button className="boton boton--primario" disabled={ocupado}>{ocupado?"Registrando…":"Crear cuenta de empresa"}</button></form>}</div>;
}
