import { Routes, Route } from "react-router-dom";
import Encabezado from "./components/Encabezado";
import Pie from "./components/Pie";
import Home from "./pages/Home";
import VacanteDetalle from "./pages/VacanteDetalle";
import Login from "./pages/Login";
import RegistroCandidato from "./pages/RegistroCandidato";


function App() {
  return (
    <>
      <Encabezado />
      <main id="principal" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vacante/:id" element={<VacanteDetalle />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<RegistroCandidato />} />
      <Route path="/" element={<Home />} />
      <Route path="/vacante/:id" element={<VacanteDetalle />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<RegistroCandidato />} />
          <Route path="*" element={<div className="contenedor"><h1>Página no encontrada</h1><p>Regresa al listado usando el menú.</p></div>} />
        </Routes>
      </main>
      <Pie />
    </>
  );
}

export default App;