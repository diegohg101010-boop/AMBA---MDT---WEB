import axios from 'axios';

function getBotConfig() {
    const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:7843';
    const BOT_API_KEY = process.env.BOT_API_KEY || 'ARM_API_KEY_2026_CAMBIAR_EN_PRODUCCION_RENACIMIENTO';

    return { BOT_API_URL, BOT_API_KEY };
}

function createBotAPI() {
    const { BOT_API_URL, BOT_API_KEY } = getBotConfig();

    return axios.create({
        baseURL: BOT_API_URL,
        headers: {
            'X-API-Key': BOT_API_KEY,
            'Content-Type': 'application/json'
        },
        timeout: 30000,
        validateStatus(status) {
            return status >= 200 && status < 500;
        }
    });
}

function getBotAPI() {
    return createBotAPI();
}

// Interceptor para logging (opcional)
async function botRequest(method, url, data, params) {
    const botAPI = getBotAPI();

    botAPI.interceptors.request.use(
        (config) => {
            console.log(`[BOT API] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
            console.log(`[BOT API] Headers:`, config.headers);
            return config;
        },
        (error) => Promise.reject(error)
    );

    botAPI.interceptors.response.use(
        (response) => {
            if (response.status >= 400) {
                const error = new Error(response.data?.message || 'Error en la petición');
                error.response = response;
                throw error;
            }
            return response;
        },
        (error) => {
            if (error.response) {
                console.error(`[BOT API ERROR] ${error.response.status}: ${error.response.data?.message || 'Error desconocido'}`);
            } else if (error.request) {
                console.error('[BOT API ERROR] No se recibió respuesta del servidor del bot');
                console.error('[BOT API ERROR] URL intentada:', error.config?.baseURL + error.config?.url);
            } else {
                console.error('[BOT API ERROR]', error.message);
            }
            return Promise.reject(error);
        }
    );

    return botAPI.request({ method, url, data, params });
}

/**
 * Funciones helper para llamar a la API del bot
 */

// Ciudadanos
export async function getCiudadanos(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await botRequest('get', `/api/ciudadanos?${queryString}`);
    return response.data;
}

export async function searchCiudadanos(query) {
    const response = await botRequest('get', `/api/ciudadanos/search?q=${encodeURIComponent(query)}`);
    return response.data;
}

export async function getCiudadano(dni) {
    const response = await botRequest('get', `/api/ciudadanos/${dni}`);
    return response.data;
}

export async function updateCiudadanoEstado(dni, data) {
    const response = await botRequest('put', `/api/ciudadanos/${dni}/estado`, data);
    return response.data;
}

// Vehículos
export async function getAllVehiculos() {
    const response = await botRequest('get', '/api/vehiculos');
    return response.data;
}

export async function searchVehiculos(matricula) {
    const response = await botRequest('get', `/api/vehiculos/search?matricula=${encodeURIComponent(matricula)}`);
    return response.data;
}

export async function getVehiculo(matricula) {
    const response = await botRequest('get', `/api/vehiculos/${matricula}`);
    return response.data;
}

export async function createVehiculo(data) {
    const response = await botRequest('post', '/api/vehiculos', data);
    return response.data;
}

// Denuncias
export async function getDenuncias(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await botRequest('get', `/api/denuncias?${queryString}`);
    return response.data;
}

export async function getDenuncia(numero) {
    const response = await botRequest('get', `/api/denuncias/${numero}`);
    return response.data;
}

export async function updateDenuncia(numero, data) {
    const response = await botRequest('put', `/api/denuncias/${numero}`, data);
    return response.data;
}

export async function createDenuncia(data) {
    const response = await botRequest('post', '/api/denuncias', data);
    return response.data;
}

export async function deleteDenuncia(numero) {
    try {
        console.log(`[BOT API] Eliminando denuncia: ${numero}`);
        const response = await botRequest('delete', `/api/denuncias/${numero}`);
        console.log(`[BOT API] Respuesta:`, response.status, response.data);
        return response.data;
    } catch (error) {
        console.error(`[BOT API] Error al eliminar denuncia ${numero}:`, error.message);
        if (error.response) {
            console.error(`[BOT API] Status:`, error.response.status);
            console.error(`[BOT API] Data:`, error.response.data);
        }
        throw error;
    }
}

// Búsqueda y Captura
export async function getBusquedaCaptura(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await botRequest('get', `/api/busqueda-captura?${queryString}`);
    return response.data;
}

export async function getOrdenBusqueda(numero) {
    const response = await botRequest('get', `/api/busqueda-captura/${numero}`);
    return response.data;
}

export async function createOrdenBusqueda(data) {
    const response = await botRequest('post', '/api/busqueda-captura', data);
    return response.data;
}

// Arrestos
export async function getArrestos(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await botRequest('get', `/api/arrestos?${queryString}`);
    return response.data;
}

export async function getArresto(id) {
    const response = await botRequest('get', `/api/arrestos/${id}`);
    return response.data;
}

export async function createArresto(data) {
    const response = await botRequest('post', '/api/arrestos', data);
    return response.data;
}

export async function deleteArresto(id) {
    try {
        console.log(`[BOT API] Eliminando arresto: ${id}`);
        const response = await botRequest('delete', `/api/arrestos/${id}`);
        console.log(`[BOT API] Respuesta:`, response.status, response.data);
        return response.data;
    } catch (error) {
        console.error(`[BOT API] Error al eliminar arresto ${id}:`, error.message);
        if (error.response) {
            console.error(`[BOT API] Status:`, error.response.status);
            console.error(`[BOT API] Data:`, error.response.data);
        }
        throw error;
    }
}

// Multas
export async function getMultas(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await botRequest('get', `/api/multas?${queryString}`);
    return response.data;
}

export async function createMulta(data) {
    console.log('[BOT API] Creando multa con datos:', data);
    console.log('[BOT API] Campos en data:', Object.keys(data));
    console.log('[BOT API] Articulos:', data.articulos);
    const response = await botRequest('post', '/api/multas', data);
    console.log('[BOT API] Respuesta de crear multa:', response.data);
    return response.data;
}

export async function deleteMulta(id) {
    try {
        console.log(`[BOT API] Eliminando multa: ${id}`);
        const response = await botRequest('delete', `/api/multas/${id}`);
        console.log(`[BOT API] Respuesta:`, response.status, response.data);
        return response.data;
    } catch (error) {
        console.error(`[BOT API] Error al eliminar multa ${id}:`, error.message);
        if (error.response) {
            console.error(`[BOT API] Status:`, error.response.status);
            console.error(`[BOT API] Data:`, error.response.data);
        }
        throw error;
    }
}

// Dashboard
export async function getDashboardStats() {
    const response = await botRequest('get', '/api/dashboard/stats');
    return response.data;
}

// Código Penal
export async function getCodigoPenal() {
    const response = await botRequest('get', '/api/codigo-penal');
    return response.data;
}

export async function getArticulo(codigo) {
    const response = await botRequest('get', `/api/codigo-penal/${codigo}`);
    return response.data;
}

export async function procesarArticulos(articulosString) {
    const response = await botRequest('post', '/api/codigo-penal/procesar', { articulos: articulosString });
    return response.data;
}

// Health check
export async function checkBotAPIHealth() {
    try {
        const { BOT_API_URL } = getBotConfig();
        const response = await axios.get(`${BOT_API_URL}/health`, { timeout: 5000 });
        return response.data;
    } catch (error) {
        throw new Error('No se puede conectar con la API del bot');
    }
}

export default { request: botRequest };
