import { useEffect, useState } from 'react';
import { listarSalas, criarSala, excluirSala } from '../../api/salas';
import './Salas.css';

export default function Salas() {
  const [salas, setSalas] = useState([]);
  const [nomeSala, setNomeSala] = useState('');

  async function carregar() {
    try {
      const data = await listarSalas();
      setSalas(data);
    } catch (e) {
      alert('Falha ao carregar salas');
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function onCriar() {
    if (!nomeSala.trim()) {
      alert('Digite o nome da sala.');
      return;
    }

    try {
      await criarSala({ nome: nomeSala });
      setNomeSala('');
      carregar();
    } catch (e) {
      alert('Erro ao criar sala.');
    }
  }

  async function onExcluir(id) {
    if (!window.confirm('Tem certeza que deseja excluir esta sala?')) return;

    try {
      await excluirSala(id);
      carregar();
    } catch (e) {
      alert('Erro ao excluir sala.');
    }
  }

  return (
    <div className="salas-container">
      <h1>Gerenciar Salas</h1>

      <div className="sala-form">
        <input type="text" placeholder="Nome da sala" value={nomeSala} onChange={(e) => setNomeSala(e.target.value)} />
        <button onClick={onCriar}>Adicionar</button>
      </div>

      <div className="sala-lista">
        {salas.map((s) => (
          <div key={s.id} className="sala-item">
            <span>{s.nome}</span>
            <button onClick={() => onExcluir(s.id)}>Excluir</button>
          </div>
        ))}
      </div>
    </div>
  );
}
