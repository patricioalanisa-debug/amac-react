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
      <a className="saltar-contenido" href="#principal">Saltar al contenido</a>
      <Encabezado />
      <main id="principal">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vacante/:id" element={<VacanteDetalle />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<RegistroCandidato />} />
        </Routes>
      </main>
      <Pie />
    </>
  );
}

export default App;