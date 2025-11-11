import { useEffect, useState, useMemo } from 'react';
import { listarSalas, listarTabelaDoDia, criarReserva, listarReservasPorData, excluirReserva } from '../../api/reservas';
import { buildReservaDTO } from '../../dto/reservaDTO';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function hojeISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

const PAGAMENTOS = ['PIX', 'CARTAO', 'DINHEIRO'];

export default function Home() {
  const [salas, setSalas] = useState([]);
  const [salaId, setSalaId] = useState('');
  const [data, setData] = useState(hojeISO());
  const [horario, setHorario] = useState('14:30');
  const [numeroJogadores, setNumeroJogadores] = useState(1);
  const [observacoes, setObservacoes] = useState('');
  const [reservasDoDia, setReservasDoDia] = useState([]);
  const navigate = useNavigate();

  const [faixas, setFaixas] = useState([]);

  const [participantes, setParticipantes] = useState([
    { nome: '', email: '', telefone: '', tipoPagamento: 'PIX', desconto: 0, observacao: '' },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const [salasResp, faixasResp] = await Promise.all([listarSalas(), listarTabelaDoDia()]);
        setSalas(salasResp);
        setFaixas(faixasResp);
      } catch {
        alert('Falha ao carregar dados iniciais.');
      }
    })();
  }, []);

  useEffect(() => {
    setParticipantes((prev) => {
      const copia = [...prev];
      if (numeroJogadores > copia.length) {
        const paraAdd = numeroJogadores - copia.length;
        for (let i = 0; i < paraAdd; i++) {
          copia.push({ nome: '', email: '', telefone: '', tipoPagamento: 'PIX', desconto: 0, observacao: '' });
        }
      } else if (numeroJogadores < copia.length) {
        copia.length = numeroJogadores;
      }
      return copia;
    });
  }, [numeroJogadores]);

  const valorBasePorPessoa = useMemo(() => {
    const n = Number(numeroJogadores) || 0;
    const faixa = faixas.find((f) => n >= f.minJogadores && n <= f.maxJogadores);
    return faixa ? Number(faixa.precoPorPessoa) : 0;
  }, [faixas, numeroJogadores]);

  const valorTotal = useMemo(() => {
    return participantes.reduce((acc, p) => {
      const desc = Number(p.desconto) || 0;
      const vf = valorBasePorPessoa * (1 - desc / 100);
      return acc + vf;
    }, 0);
  }, [participantes, valorBasePorPessoa]);

  function onChangeParticipante(idx, campo, valor) {
    setParticipantes((prev) => {
      const copia = [...prev];
      copia[idx] = { ...copia[idx], [campo]: campo === 'desconto' ? Number(valor) : valor };
      return copia;
    });
  }

  async function onSalvar() {
    if (!salaId) return alert('Selecione uma sala.');
    if (!data || !horario) return alert('Informe data e horário.');

    try {
      const dto = buildReservaDTO({
        salaId: Number(salaId),
        data,
        horario,
        observacoes,
        numeroJogadores: Number(numeroJogadores),
        participantes,
      });
      await criarReserva(dto);
      console.log(dto);
      alert('Reserva criada com sucesso!');

      await carregarReservas();
      setSalaId('');
      setNumeroJogadores(1);
      setObservacoes('');
      setParticipantes([{ nome: '', email: '', telefone: '', tipoPagamento: 'PIX', desconto: 0, observacao: '' }]);
    } catch (err) {
      alert(err?.message || 'Falha ao salvar reserva.');
    }
  }

  async function carregarReservas() {
    if (!data) return;
    try {
      const lista = await listarReservasPorData(data);
      setReservasDoDia(lista);
    } catch {}
  }

  useEffect(() => {
    carregarReservas();
  }, [data]);

  async function onExcluirReserva(id) {
    if (!window.confirm('Deseja realmente excluir esta reserva?')) return;
    try {
      await excluirReserva(id);
      carregarReservas();
    } catch {
      alert('Erro ao excluir reserva.');
    }
  }

  return (
    <div className="home-container">
      <div className="new-reserva-card">
        <h1>Nova Reserva</h1>

        <div className="top-row">
          <select value={salaId} onChange={(e) => setSalaId(e.target.value)}>
            <option value="">Selecionar sala</option>
            {salas.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>

          <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          <input type="time" value={horario} step="1800" onChange={(e) => setHorario(e.target.value)} />
          <input type="number" min="1" value={numeroJogadores} onChange={(e) => setNumeroJogadores(Math.max(1, Number(e.target.value)))} />
          <button onClick={onSalvar}>Salvar</button>

          <div className="valor-total">
            <b>Total:</b> R$ {valorTotal.toFixed(2)}
          </div>
        </div>

        {/* Campo de observações fora da top-row */}
        <div className="linha-observacoes">
          <input
            type="text"
            placeholder="Observações da reserva (opcional)"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        </div>

        <div className="tabela" style={{ marginBottom: 12 }}>
          <div className="titulo-secundario">Tabela de preços de hoje</div>
          {faixas.length === 0 ? (
            <div>Carregando...</div>
          ) : (
            <table className="tabela-precos">
              <thead>
                <tr>
                  <th>Jogadores</th>
                  <th>Preço por pessoa</th>
                </tr>
              </thead>
              <tbody>
                {faixas.map((f) => (
                  <tr key={f.id}>
                    <td>
                      {f.minJogadores}
                      {f.minJogadores !== f.maxJogadores ? ` - ${f.maxJogadores}` : ''}
                    </td>
                    <td>R$ {Number(f.precoPorPessoa).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="tabela">
          {participantes.map((p, idx) => (
            <div key={idx} className="linha">
              <input placeholder="Nome" value={p.nome} onChange={(e) => onChangeParticipante(idx, 'nome', e.target.value)} />
              <select value={p.tipoPagamento} onChange={(e) => onChangeParticipante(idx, 'tipoPagamento', e.target.value)}>
                {PAGAMENTOS.map((tp) => (
                  <option key={tp} value={tp}>
                    {tp}
                  </option>
                ))}
              </select>
              <input placeholder="Email" value={p.email} onChange={(e) => onChangeParticipante(idx, 'email', e.target.value)} />
              <input placeholder="Telefone" value={p.telefone} onChange={(e) => onChangeParticipante(idx, 'telefone', e.target.value)} />
              <input
                type="number"
                placeholder="0"
                value={p.desconto}
                onChange={(e) => onChangeParticipante(idx, 'desconto', e.target.value)}
              />
              <input
                placeholder="Obs."
                value={p.observacao ?? ''}
                onChange={(e) => onChangeParticipante(idx, 'observacao', e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <h2>Reservas cadastradas para o dia</h2>
      <div className="reservas-cards">
        {reservasDoDia.length === 0 && <div style={{ opacity: 0.7 }}>Nenhuma reserva cadastrada nesta data.</div>}
        {reservasDoDia.map((r) => (
          <div key={r.id} className="reserva-card">
            <div className="reserva-info">
              <div className="reserva-titulo">{r.sala}</div>
              <div className="reserva-linha">⏱ {r.horario}</div>
              <div className="reserva-linha">👥 {r.numeroJogadores} jogadores</div>

              {r.observacoes && r.observacoes.trim() !== '' && <div className="reserva-observacoes">📝 {r.observacoes}</div>}

              <div className="reserva-total">💰 R$ {r.valorTotal?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="reserva-card-buttons">
              <button className="btn-editar" onClick={() => navigate(`/reservas/${r.id}/editar`)}>
                Editar
              </button>
              <button className="btn-excluir" onClick={() => onExcluirReserva(r.id)}>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
