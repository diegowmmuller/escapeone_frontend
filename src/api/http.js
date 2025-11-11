// src/api/http.js
const API_URL = '';

export async function request(endpoint, method = 'GET', body = null) {
  const config = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (body !== null) config.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}${endpoint}`, config);

  // Caso DELETE, não tenta fazer .json()
  if (method === 'DELETE') {
    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || 'Erro na requisição');
    }
    return true;
  }

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || 'Erro na requisição');
  }

  return response.json();
}
