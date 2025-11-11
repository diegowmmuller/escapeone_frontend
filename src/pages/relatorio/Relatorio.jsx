import { useEffect, useState } from 'react';
import { getRelatorioDoDia } from '../../api/reservas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Relatorio.css';

export default function Relatorio() {
  function hojeISO() {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }

  const [data, setData] = useState(hojeISO());
  const [relatorio, setRelatorio] = useState(null);

  async function carregar() {
    try {
      const r = await getRelatorioDoDia(data);
      console.log('RELATÓRIO COMPLETO:', r);
      setRelatorio(r);
    } catch (e) {
      alert('Erro ao carregar relatório.');
    }
  }

  useEffect(() => {
    carregar();
  }, [data]);

  function exportarPDF() {
    if (!relatorio) return;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    let y = margin;

    doc.setFontSize(18);
    doc.text(`Relatório do dia ${relatorio.data}`, margin, y);
    y += 30;

    doc.setFontSize(12);
    doc.text(`Total de reservas: ${relatorio.totalReservas}`, margin, y);
    y += 18;
    doc.text(`Total de participantes: ${relatorio.totalParticipantes}`, margin, y);
    y += 18;
    doc.text(`Total arrecadado: R$ ${relatorio.totalArrecadado.toFixed(2)}`, margin, y);
    y += 35;

    const tableData = relatorio.reservas.map((r) => [
      r.id,
      r.sala,
      r.horario.slice(0, 5),
      r.numeroJogadores,
      `R$ ${r.valorTotal.toFixed(2)}`,
      r.observacoes ? r.observacoes : 'Nenhuma',
    ]);

    autoTable(doc, {
      startY: y,
      head: [['ID', 'Sala', 'Horário', 'Jogadores', 'Total', 'Observações']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [35, 35, 35], textColor: 255 },
      styles: { fontSize: 11, cellPadding: 6 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`relatorio-${relatorio.data}.pdf`);
  }

  return (
    <div className="relatorio-container">
      <h1>Relatório do Dia</h1>

      <div className="linha-data">
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
        <button onClick={exportarPDF}>Exportar PDF</button>
      </div>

      {!relatorio && <div>Carregando...</div>}

      {relatorio && (
        <div className="relatorio-box">
          <div className="resumo">
            <div>
              <b>Total reservas:</b> {relatorio.totalReservas}
            </div>
            <div>
              <b>Total participantes:</b> {relatorio.totalParticipantes}
            </div>
            <div>
              <b>Total arrecadado:</b> R$ {relatorio.totalArrecadado.toFixed(2)}
            </div>
          </div>

          <h2>Reservas</h2>

          <table className="tabela-relatorio">
            <thead>
              <tr>
                <th>ID</th>
                <th>Sala</th>
                <th>Horário</th>
                <th>Jogadores</th>
                <th>Total</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              {relatorio.reservas.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.sala}</td>
                  <td>{r.horario.slice(0, 5)}</td>
                  <td>{r.numeroJogadores}</td>
                  <td>R$ {r.valorTotal.toFixed(2)}</td>
                  <td>{r.observacoes || 'Nenhuma'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
