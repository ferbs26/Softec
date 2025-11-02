import axios from 'axios';
import apiConfig from '../config/api';
const { ENDPOINTS, API_URL } = apiConfig;

// Crear una instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-access-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si el token es inválido o ha expirado, redirigir al login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: (email, password) => api.post(ENDPOINTS.AUTH.LOGIN, { email, password }),
  getProfile: () => api.get(ENDPOINTS.AUTH.PROFILE),
  register: (userData) => api.post(ENDPOINTS.AUTH.REGISTER, userData),
};

// Servicios de usuarios
export const userService = {
  getAll: () => api.get(ENDPOINTS.USUARIOS.BASE),
  getById: (id) => api.get(`${ENDPOINTS.USUARIOS.BASE}/${id}`),
  create: (userData) => api.post(ENDPOINTS.USUARIOS.BASE, userData),
  update: (id, userData) => api.put(`${ENDPOINTS.USUARIOS.BASE}/${id}`, userData),
  delete: (id) => api.delete(`${ENDPOINTS.USUARIOS.BASE}/${id}`),
  getRoles: () => api.get(ENDPOINTS.USUARIOS.ROLES),
};

// Servicios de aulas
export const aulaService = {
  getAll: async () => {
    try {
      const response = await api.get(ENDPOINTS.AULAS);
      return { data: Array.isArray(response.data) ? response.data : [], status: response.status };
    } catch (error) {
      console.error('Error en aulaService.getAll:', error);
      return { data: [], status: error.response?.status || 500 };
    }
  },
  getById: (id) => api.get(`${ENDPOINTS.AULAS}/${id}`),
  create: (aulaData) => api.post(ENDPOINTS.AULAS, aulaData),
  update: (id, aulaData) => api.put(`${ENDPOINTS.AULAS}/${id}`, aulaData),
  delete: (id) => api.delete(`${ENDPOINTS.AULAS}/${id}`),
};

// Servicios de computadoras
export const computadoraService = {
  getAll: async () => {
    try {
      const response = await api.get(ENDPOINTS.COMPUTADORAS);
      return { data: Array.isArray(response.data) ? response.data : [], status: response.status };
    } catch (error) {
      console.error('Error en computadoraService.getAll:', error);
      return { data: [], status: error.response?.status || 500 };
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`${ENDPOINTS.COMPUTADORAS}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en computadoraService.getById:', error);
      throw error;
    }
  },
  create: async (computadoraData) => {
    try {
      const response = await api.post(ENDPOINTS.COMPUTADORAS, computadoraData);
      return response.data;
    } catch (error) {
      console.error('Error en computadoraService.create:', error);
      throw error;
    }
  },
  update: async (id, computadoraData) => {
    try {
      const response = await api.put(`${ENDPOINTS.COMPUTADORAS}/${id}`, computadoraData);
      return response.data;
    } catch (error) {
      console.error('Error en computadoraService.update:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`${ENDPOINTS.COMPUTADORAS}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en computadoraService.delete:', error);
      throw error;
    }
  },
  getByAula: async (aulaId) => {
    try {
      const response = await api.get(`${ENDPOINTS.COMPUTADORAS}/aula/${aulaId}`);
      return response.data;
    } catch (error) {
      console.error('Error en computadoraService.getByAula:', error);
      throw error;
    }
  }
};

// Servicios de reportes
export const reporteService = {
  getAll: async () => {
    try {
      const response = await api.get(ENDPOINTS.REPORTES);
      return { data: Array.isArray(response.data) ? response.data : [], status: response.status };
    } catch (error) {
      console.error('Error en reporteService.getAll:', error);
      return { data: [], status: error.response?.status || 500 };
    }
  },
  getById: (id) => api.get(`${ENDPOINTS.REPORTES}/${id}`),
  create: (reporteData) => api.post(ENDPOINTS.REPORTES, reporteData),
  update: (id, reporteData) => api.put(`${ENDPOINTS.REPORTES}/${id}`, reporteData),
  delete: (id) => api.delete(`${ENDPOINTS.REPORTES}/${id}`),
  getByComputadora: (computadoraId) => api.get(`${ENDPOINTS.REPORTES}/computadora/${computadoraId}`),
  getByUsuario: (usuarioId) => api.get(`${ENDPOINTS.REPORTES}/usuario/${usuarioId}`),
  updateEstado: (reporteId, estadoData) => api.put(`${ENDPOINTS.REPORTES}/${reporteId}/estado`, estadoData),
};

export default api;
