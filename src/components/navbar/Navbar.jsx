import { Link } from 'react-router-dom';
import './Navbar.css';

import BotaoDesligar from '../shutDownButton/BotaoDesligar';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-logo">EscapeOne</div>

      <div className="nav-links">
        <Link to="/">Nova Reserva</Link>
        <Link to="/salas">Salas</Link>
        <Link to="/relatorios">Relatórios</Link>
      </div>

      <div className="nav-right">
        <BotaoDesligar />
      </div>
    </nav>
  );
}
