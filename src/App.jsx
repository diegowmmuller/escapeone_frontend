import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/login/Login';
import Home from './pages/home/Home';
import Salas from './pages/salas/Salas';
import Navbar from './components/navbar/Navbar';
import EditarReserva from './pages/editarReserva/EditarReserva';
import Relatorio from './pages/relatorio/Relatorio';

export default function App() {
  const [logado, setLogado] = useState(false);

  function handleLogin() {
    setLogado(true);
  }

  return (
    <BrowserRouter>
      {logado && <Navbar />}

      <Routes>
        {!logado && <Route path="*" element={<Login onLogin={handleLogin} />} />}

        {logado && (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/salas" element={<Salas />} />
            <Route path="/relatorios" element={<Relatorio />} />
            <Route path="/reservas/:id/editar" element={<EditarReserva />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
