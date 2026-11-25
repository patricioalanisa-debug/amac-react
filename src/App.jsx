import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import VacanteDetalle from "./pages/VacanteDetalle";
import Login from "./pages/Login";
import RegistroCandidato from "./pages/RegistroCandidato";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/vacante/:id" element={<VacanteDetalle />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<RegistroCandidato />} />
    </Routes>
  );
}

export default App;