import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_URL}/auth/signin`,
    REGISTER: `${API_URL}/auth/signup`,
    PROFILE: `${API_URL}/auth/me`,
  },
  USUARIOS: {
    BASE: `${API_URL}/usuarios`,
    ROLES: `${API_URL}/usuarios/roles`,
  },
  AULAS: `${API_URL}/aulas`,
  COMPUTADORAS: `${API_URL}/computadoras`,
  REPORTES: `${API_URL}/reportes`,
  ESTADOS_REPORTE: `${API_URL}/estados-reporte`,
};

// Configurar axios para incluir el token en todas las peticiones
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['x-access-token'] = token;
}

// Interceptor para manejar errores de autenticación
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si el token no es válido, redirigir al login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default { API_URL, ENDPOINTS, axios };
