// Configuración de la API
const API_URL = import.meta.env.VITE_API_URL || 'https://mdt-hsrp.onrender.com';
const API_KEY = import.meta.env.VITE_API_KEY || 'HSRP_API_KEY_2026_CAMBIAR_EN_PRODUCCION_12345';

console.log('[API Config] URL:', API_URL);

export { API_URL };

// Cliente HTTP con manejo de tokens
class ApiClient {
  constructor() {
    this.baseURL = API_URL;
  }

  getHeaders() {
    const token = sessionStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
export default api;
