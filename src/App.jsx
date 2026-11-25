import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import VacanteDetalle from "./pages/VacanteDetalle";
import Login from "./pages/Login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/vacante/:id" element={<VacanteDetalle />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;