import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
export default function PublicarVacante(){
 const {sesion,perfil}=useAuth();const navigate=useNavigate();const [telefono,setTelefono]=useState(false),[ocupado,setOcupado]=useState(false),[error,setError]=useState("");
 async function publicar(e){e.preventDefault();if(ocupado||!perfil?.aprobado||perfil?.revision!=="aprobada")return;const f=new FormData(e.currentTarget);const datos={empresa_id:sesion.user.id,estado:"pausada",sueldo:Number(f.get("sueldo")),telefono_contacto:telefono?f.get("telefono_contacto").trim():null};
 for(const k of ["titulo","ubicacion","horario","categoria","descripcion","requisitos","prestaciones"]) datos[k]=f.get(k).trim();
 if(!["titulo","ubicacion","horario","categoria","descripcion","requisitos","prestaciones"].every(k=>datos[k]) || !Number.isFinite(datos.sueldo)||datos.sueldo<=0||datos.sueldo>99999999.99 || (telefono && (!/^[+\d ()-]{7,25}$/.test(datos.telefono_contacto)||datos.telefono_contacto.replace(/\D/g, "").length<7))){setError("Revisa los campos obligatorios, sueldo y teléfono.");return;}
 setOcupado(true);setError("");try{const {error}=await supabase.from("vacantes").insert(datos);if(error)throw error;navigate("/empresa/vacantes",{state:{mensaje:"Vacante enviada a revisión. AMAC debe aprobarla antes de publicarla."}});}catch{setError("No pudimos publicar la vacante. Revisa los datos e intenta nuevamente.");}finally{setOcupado(false);}}
 if(!perfil?.aprobado||perfil?.revision!=="aprobada")return <div className="contenedor"><h1>Publicar vacante</h1><p className="aviso">Tu empresa necesita aprobación de AMAC para enviar ofertas.</p><Link to="/empresa/vacantes">Volver a mis vacantes</Link></div>;
 return <div className="contenedor contenedor--estrecho"><Link className="enlace-volver" to="/empresa/vacantes">← Mis vacantes</Link><h1>Publicar vacante</h1><form onSubmit={publicar}><fieldset className="grupo-campos"><legend>Información del puesto</legend>
 {[["titulo","Título del puesto"],["ubicacion","Ubicación"],["categoria","Categoría"]].map(([k,l])=><div className="campo-formulario" key={k}><label htmlFor={k}>{l}</label><input id={k} name={k} required /></div>)}
 <div className="campo-formulario"><label htmlFor="sueldo">Sueldo mensual (MXN)</label><input id="sueldo" name="sueldo" type="number" min="0.01" max="99999999.99" step="0.01" required /></div>
 <div className="campo-formulario"><label htmlFor="horario">Horario</label><select id="horario" name="horario" required defaultValue=""><option value="">Selecciona un horario</option>{["Matutino","Vespertino","Medio tiempo","Fines de semana"].map(v=><option key={v}>{v}</option>)}</select></div>
 {[["descripcion","Descripción"],["requisitos","Requisitos"],["prestaciones","Prestaciones"]].map(([k,l])=><div className="campo-formulario" key={k}><label htmlFor={k}>{l}</label><textarea id={k} name={k} required /></div>)}</fieldset>
 <fieldset className="grupo-campos"><legend>Postulaciones</legend><p>Las personas pueden postularse desde la plataforma.</p><div className="opcion"><input id="por-telefono" type="checkbox" checked={telefono} onChange={e=>setTelefono(e.target.checked)}/><label htmlFor="por-telefono">También aceptar postulaciones por teléfono</label></div>{telefono&&<div className="campo-formulario"><label htmlFor="telefono_contacto">Teléfono de contacto</label><input id="telefono_contacto" name="telefono_contacto" type="tel" required /></div>}</fieldset>
 {error&&<p role="alert" className="aviso">{error}</p>}<button className="boton boton--primario" disabled={ocupado}>{ocupado?"Enviando…":"Enviar a revisión"}</button></form></div>;
}
