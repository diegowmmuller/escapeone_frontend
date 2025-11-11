import { request } from './http';

export const login = (senha) => {
  return request('/auth/login', 'POST', { senha });
};
