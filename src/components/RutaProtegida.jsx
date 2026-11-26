import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RutaProtegida({ rol, children }) {
  const { perfil, cargando, errorPerfil } = useAuth();

  if (cargando) return <p role="status">Cargando…</p>;
  if (errorPerfil) return <p className="contenedor aviso" role="alert">{errorPerfil}</p>;
  if (!perfil) return <Navigate to="/login" replace />;
  if (perfil.rol !== rol) return <Navigate to="/" replace />;
  return children;
}