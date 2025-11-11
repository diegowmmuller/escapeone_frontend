import { useState } from 'react';
import { login } from '../../api/auth'; // chamando serviço separado
import logo from '../../assets/logo.png';
import './Login.css';

export default function Login({ onLogin }) {
  const [senha, setSenha] = useState('');

  async function handleLogin(e) {
    e.preventDefault();

    try {
      await login(senha);
      onLogin();
    } catch (err) {
      alert(err.message || 'Erro ao autenticar');
    }
  }

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <img src={logo} alt="EscapeOne" className="login-logo" />

        <input type="password" placeholder="Senha de acesso" value={senha} onChange={(e) => setSenha(e.target.value)} />

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
