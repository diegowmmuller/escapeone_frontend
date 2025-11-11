export function buildReservaDTO({ salaId, data, horario, observacoes, numeroJogadores, participantes }) {
  return {
    salaId,
    data,
    horario,
    observacoes: observacoes || null,
    numeroJogadores,
    participantes: participantes.map((p) => ({
      nome: p.nome || null,
      email: p.email || null,
      telefone: p.telefone || null,
      tipoPagamento: p.tipoPagamento,
      desconto: p.desconto ?? 0,
      observacao: p.observacao || null,
    })),
  };
}
