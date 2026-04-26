// API de Reportes - Conexión con el backend del bot
const BOT_API_URL = import.meta.env.VITE_BOT_API_URL || 'http://localhost:3000';
const API_KEY = import.meta.env.VITE_BOT_API_KEY || 'HSRP_API_KEY_CAMBIAR_EN_PRODUCCION';

// Cliente para reportes
class ReportesAPI {
  constructor() {
    this.baseURL = BOT_API_URL;
    this.apiKey = localStorage.getItem('api_key') || API_KEY;
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
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

  // Reporte General
  async getReporteGeneral(fechaInicio, fechaFin) {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/reportes/general${query}`);
  }

  // Reporte de Actividad Policial
  async getReporteActividadPolicial(fechaInicio, fechaFin, departamento) {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    if (departamento) params.append('departamento', departamento);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/reportes/actividad-policial${query}`);
  }

  // Reporte de Criminalidad
  async getReporteCriminalidad(fechaInicio, fechaFin) {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/reportes/criminalidad${query}`);
  }

  // Reporte Financiero
  async getReporteFinanciero(fechaInicio, fechaFin) {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/reportes/financiero${query}`);
  }

  // Reporte de Oficiales
  async getReporteOficiales(departamento, estado) {
    const params = new URLSearchParams();
    if (departamento) params.append('departamento', departamento);
    if (estado) params.append('estado', estado);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/reportes/oficiales${query}`);
  }

  // Reporte de Vehículos
  async getReporteVehiculos() {
    return this.request('/api/reportes/vehiculos');
  }

  // Reporte de Denuncias
  async getReporteDenuncias(fechaInicio, fechaFin, estado, prioridad) {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    if (estado) params.append('estado', estado);
    if (prioridad) params.append('prioridad', prioridad);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/reportes/denuncias${query}`);
  }
}

export const reportesAPI = new ReportesAPI();
export default reportesAPI;
