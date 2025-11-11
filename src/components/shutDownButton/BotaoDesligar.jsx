import { request } from '../../api/http';
import './BotaoDesligar.css'; // <-- Caminho relativo correto

export default function BotaoDesligar() {
  async function desligar() {
    if (!window.confirm('Deseja realmente encerrar o sistema?')) return;
    await request('/shutdown', 'POST');
  }

  return (
    <button className="btn-desligar" onClick={desligar}>
      Desligar Sistema
    </button>
  );
}
