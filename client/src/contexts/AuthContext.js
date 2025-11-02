import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiConfig from '../config/api';

const { axios, ENDPOINTS } = apiConfig;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Verificar si el usuario está autenticado al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(ENDPOINTS.AUTH.PROFILE);
          setUser(response.data);
        } catch (err) {
          console.error('Error al verificar autenticación:', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Iniciar sesión
  const login = async (email, password) => {
    try {
      setError(null);
      console.log('Iniciando sesión con:', { email });
      const response = await axios.post(ENDPOINTS.AUTH.LOGIN, { email, password });
      console.log('Respuesta del servidor:', response.data);
      
      if (response.data.accessToken) {
        const { accessToken, ...userData } = response.data;
        
        // Guardar el token en localStorage
        localStorage.setItem('token', accessToken);
        
        // Configurar el token en las cabeceras de axios
        axios.defaults.headers.common['x-access-token'] = accessToken;
        
        // Asegurarse de que los roles sean un array
        const userWithRoles = {
          ...userData,
          roles: Array.isArray(userData.roles) ? userData.roles : [userData.roles].filter(Boolean)
        };
        
        console.log('Usuario autenticado:', userWithRoles);
        setUser(userWithRoles);
        
        // Redirigir según el rol del usuario
        const roles = userData.roles || [];
        if (roles.some(role => role === 'ADMIN' || role === 'TECNICO')) {
          navigate('/dashboard');
        } else {
          navigate('/reportes/nuevo');
        }
        
        return true;
      } else {
        setError('Error: No se recibió un token de acceso válido');
        return false;
      }
    } catch (err) {
      console.error('Error en login:', err);
      const errorMessage = err.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMessage);
      return false;
    }
  };

  // Cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    return user?.roles?.includes(role);
  };

  // Verificar si el usuario tiene alguno de los roles proporcionados
  const hasAnyRole = (roles) => {
    return roles.some(role => hasRole(role));
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        login, 
        logout, 
        hasRole, 
        hasAnyRole,
        isAuthenticated: !!user
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
