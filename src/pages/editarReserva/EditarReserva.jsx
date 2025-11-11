// src/pages/editar/EditarReserva.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buscarReserva, atualizarReserva, listarSalas } from '../../api/reservas';
import { buildReservaDTO } from '../../dto/reservaDTO';
import './EditarReserva.css';
import '../home/Home.css';

const PAGAMENTOS = ['PIX', 'CARTAO', 'DINHEIRO'];

export default function EditarReserva() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [salas, setSalas] = useState([]);
  const [salaId, setSalaId] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [numeroJogadores, setNumeroJogadores] = useState(1);
  const [participantes, setParticipantes] = useState([]);

  // Carregar reserva + salas
  useEffect(() => {
    (async () => {
      try {
        const reserva = await buscarReserva(id);
        const salasResp = await listarSalas();

        console.log('RESERVA CARREGADA:', reserva);
        console.log('SALAS DISPONÍVEIS:', salasResp);

        const salaEncontrada = salasResp.find((s) => s.nome === reserva.sala);
        if (!salaEncontrada) {
          alert('A sala desta reserva não existe mais no sistema.');
          navigate('/');
          return;
        }

        setSalas(salasResp);
        setSalaId(salaEncontrada.id);
        setData(reserva.data);
        setHorario(reserva.horario);
        setNumeroJogadores(reserva.numeroJogadores);
        setParticipantes(
          reserva.participantes.map((p) => ({
            nome: p.nome ?? '',
            email: p.email ?? '',
            telefone: p.telefone ?? '',
            tipoPagamento: p.tipoPagamento,
            desconto: p.descontoPercentual ?? 0,
            observacao: p.observacao ?? '',
          }))
        );
      } catch (err) {
        alert('Erro ao carregar reserva.');
        navigate('/');
      }
    })();
  }, [id, navigate]);

  function onChangeParticipante(idx, campo, valor) {
    setParticipantes((prev) => {
      const copia = [...prev];
      copia[idx] = { ...copia[idx], [campo]: campo === 'desconto' ? Number(valor) : valor };
      return copia;
    });
  }

  // Ajustar quantidade de linhas conforme número de jogadores
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

  async function onSalvarAlteracoes() {
    try {
      const dto = buildReservaDTO({
        salaId: Number(salaId),
        data,
        horario,
        numeroJogadores: Number(numeroJogadores),
        participantes,
      });
      console.log('DTO ENVIADO:', dto);

      await atualizarReserva(id, dto); // ✅ Aqui o id é o useParams()
      alert('Reserva atualizada com sucesso!');
      navigate('/');
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar alterações.');
    }
  }

  return (
    <div className="home-container">
      <h1>Editar Reserva</h1>

      <div className="top-row">
        <select value={salaId} onChange={(e) => setSalaId(Number(e.target.value))}>
          <option value="">Selecione a sala</option>
          {salas.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>

        <input type="date" value={data} onChange={(e) => setData(e.target.value)} />

        <input type="time" value={horario} step="1800" onChange={(e) => setHorario(e.target.value)} />

        <input type="number" min="1" value={numeroJogadores} onChange={(e) => setNumeroJogadores(Math.max(1, Number(e.target.value)))} />

        <button onClick={onSalvarAlteracoes}>Salvar alterações</button>
        <button onClick={() => navigate('/')}>Voltar</button>
      </div>

      <h2 style={{ marginTop: '32px' }}>Participantes</h2>

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

            <input type="number" value={p.desconto} onChange={(e) => onChangeParticipante(idx, 'desconto', e.target.value)} />

            <input placeholder="Obs." value={p.observacao} onChange={(e) => onChangeParticipante(idx, 'observacao', e.target.value)} />
          </div>
        ))}
      </div>
    </div>
  );
}
