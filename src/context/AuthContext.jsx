import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(undefined);
  const [resultado, setResultado] = useState({ id: null, perfil: null, error: "" });
  useEffect(() => {
    let vigente = true, cambio = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      cambio = true; if (vigente) setSesion(nuevaSesion);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (vigente && !cambio) setSesion(error ? null : data.session);
    }).catch(() => { if (vigente && !cambio) setSesion(null); });
    return () => { vigente = false; subscription.unsubscribe(); };
  }, []);
  const usuarioId = sesion?.user.id ?? null;
  useEffect(() => {
    let vigente = true;
    if (!usuarioId) { setResultado({ id: null, perfil: null, error: "" }); return; }
    async function cargar() {
      try {
        const { data, error } = await supabase.from("perfiles").select("*").eq("id", usuarioId).single();
        if (error) throw error;
        if (vigente) setResultado({ id: usuarioId, perfil: data, error: "" });
      } catch { if (vigente) setResultado({ id: usuarioId, perfil: null, error: "No pudimos cargar tu perfil. Recarga la página." }); }
    }
    cargar(); return () => { vigente = false; };
  }, [usuarioId]);
  const coincide = resultado.id === usuarioId;
  const cargando = sesion === undefined || (!!usuarioId && !coincide);
  return <AuthContext.Provider value={{ sesion, perfil: usuarioId && coincide ? resultado.perfil : null, cargando, errorPerfil: usuarioId && coincide ? resultado.error : "" }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
