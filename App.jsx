import { Routes, Route } from "react-router-dom";
import Encabezado from "./components/Encabezado";
import RutaProtegida from "./components/RutaProtegida";
import Pie from "./components/Pie";
import Home from "./pages/Home";
import VacanteDetalle from "./pages/VacanteDetalle";
import Login from "./pages/Login";
import RegistroCandidato from "./pages/RegistroCandidato";

import MisSolicitudes from "./pages/MisSolicitudes";


import RegistroEmpresa from "./pages/RegistroEmpresa";
import EmpresaVacantes from "./pages/EmpresaVacantes";
import PublicarVacante from "./pages/PublicarVacante";
import SolicitudesRecibidas from "./pages/SolicitudesRecibidas";

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
          <Route path="/registro-empresa" element={<RegistroEmpresa />} />
          <Route path="/empresa/vacantes" element={<RutaProtegida rol="empresa"><EmpresaVacantes /></RutaProtegida>} />
          <Route path="/empresa/publicar" element={<RutaProtegida rol="empresa"><PublicarVacante /></RutaProtegida>} />
          <Route path="/empresa/solicitudes" element={<RutaProtegida rol="empresa"><SolicitudesRecibidas /></RutaProtegida>} />
          <Route path="*" element={<div className="contenedor"><h1>Página no encontrada</h1><p>Regresa al listado usando el menú.</p></div>} />
          <Route path="/mis-solicitudes" element={ <RutaProtegida rol="candidato"> <MisSolicitudes /> </RutaProtegida>}/>
        </Routes>
      </main>
      <Pie />
    </>
  );
}

export default App;
