import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import VacanteDetalle from "./pages/VacanteDetalle";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/vacante/:id" element={<VacanteDetalle />} />
    </Routes>
  );
}

export default App;