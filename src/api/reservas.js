// src/api/reservas.js
import { request } from './http';

// Criar reserva
export const criarReserva = (data) => request('/reservas', 'POST', data);

// Buscar reserva por data
export const listarReservasPorData = (data) => request(`/reservas?data=${data}`, 'GET');

export const buscarReserva = (id) => request(`/reservas/${id}`, 'GET');

export const excluirReserva = (id) => request(`/reservas/${id}`, 'DELETE');

export const getRelatorioDoDia = (data) => request(`/reservas/relatorio?data=${data}`, 'GET');

// Listar salas
export const listarSalas = () => request('/salas');

// Obter tabela de preços vigente do dia
export const listarTabelaDoDia = () => request('/tabela-preco');

export const atualizarReserva = (id, data) => request(`/reservas/${id}`, 'PUT', data);
