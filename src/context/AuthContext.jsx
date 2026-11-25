import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(undefined); // undefined = aún no sabemos
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSesion(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSesion(nuevaSesion);
    });
    return () => subscription.unsubscribe();
  }, []);

  const sesionLista = sesion !== undefined;
  const usuarioId = sesion?.user.id;

  useEffect(() => {
    if (!sesionLista) return;
    if (!usuarioId) {
      setPerfil(null);
      setCargando(false);
      return;
    }
    setCargando(true);
    supabase
      .from("perfiles")
      .select("*")
      .eq("id", usuarioId)
      .single()
      .then(({ data }) => {
        setPerfil(data);
        setCargando(false);
      });
  }, [sesionLista, usuarioId]);

  return (
    <AuthContext.Provider value={{ sesion, perfil, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);