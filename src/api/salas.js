import { request } from './http';

export const listarSalas = () => request('/salas');
export const buscarSala = (id) => request(`/salas/${id}`);
export const criarSala = (data) => request('/salas', 'POST', data);
export const excluirSala = (id) => request(`/salas/${id}`, 'DELETE');
