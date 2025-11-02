import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ComputadorasPage from './pages/ComputadorasPage';
import AulasPage from './pages/AulasPage';
import ReportesPage from './pages/ReportesPage';
import InventarioRepuestosPage from './pages/InventarioRepuestosPage';
import HistorialCambiosPage from './pages/HistorialCambiosPage';

// Crear un tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
  },
});

// Componente para rutas protegidas
const PrivateRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, loading, hasAnyRole } = useAuth();
  
  if (loading) {
    return <div>Cargando...</div>; // O un componente de carga
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se especificaron roles y el usuario no tiene ninguno de ellos
  if (roles.length > 0 && !hasAnyRole(roles)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
};

// Componente para rutas públicas que no deben ser accesibles cuando el usuario está autenticado
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Cargando...</div>; // O un componente de carga
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Componente de la aplicación principal
const AppContent = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/registro" element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      } />
      <Route path="/verificar-email" element={
        <PublicRoute>
          <VerifyEmailPage />
        </PublicRoute>
      } />
      <Route path="/olvide-contrasena" element={
        <PublicRoute>
          <ForgotPasswordPage />
        </PublicRoute>
      } />
      <Route path="/restablecer-contrasena" element={
        <PublicRoute>
          <ResetPasswordPage />
        </PublicRoute>
      } />
      
      {/* Rutas protegidas */}
      <Route path="/" element={
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="computadoras" element={<ComputadorasPage />} />
        <Route path="aulas" element={<AulasPage />} />
        <Route path="reportes" element={<ReportesPage />} />
        <Route path="perfil" element={<div>Perfil</div>} />
        <Route path="configuracion" element={<div>Configuración</div>} />
        <Route path="inventario-repuestos" element={
          <PrivateRoute roles={['admin', 'tecnico']}>
            <InventarioRepuestosPage />
          </PrivateRoute>
        } />
        <Route path="historial-cambios" element={
          <PrivateRoute roles={['admin', 'tecnico']}>
            <HistorialCambiosPage />
          </PrivateRoute>
        } />
      </Route>
      
      {/* Ruta 404 */}
      <Route path="*" element={<div>404 - Página no encontrada</div>} />
    </Routes>
  );
};

// Componente raíz de la aplicación
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
