import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { authService } from '../services/api';

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const { token } = location.state || {};
  const email = location.state?.email || '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }
    
    if (formData.password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres');
    }
    
    try {
      setLoading(true);
      setError('');
      
      await authService.resetPassword({
        email,
        token,
        newPassword: formData.password
      });
      
      setMessage('¡Contraseña actualizada correctamente! Redirigiendo al inicio de sesión...');
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Tu contraseña ha sido actualizada. Por favor inicia sesión.' 
          } 
        });
      }, 3000);
      
    } catch (err) {
      console.error('Error al restablecer la contraseña:', err);
      setError(err.response?.data?.message || 'Error al restablecer la contraseña. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            textAlign: 'center',
          }}
        >
          <Alert severity="error" sx={{ mt: 3 }}>
            Enlace inválido o expirado. Por favor, solicita un nuevo enlace de recuperación.
          </Alert>
          <Button 
            component={Link} 
            to="/forgot-password" 
            variant="contained" 
            sx={{ mt: 3 }}
          >
            Solicitar Nuevo Enlace
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Restablecer Contraseña
          </Typography>
          
          <Typography variant="body1" align="center" sx={{ mb: 3 }}>
            Ingresa tu nueva contraseña para la cuenta: <strong>{email}</strong>
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          )}
          
          {message && (
            <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Nueva Contraseña"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading || !!message}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmar Nueva Contraseña"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading || !!message}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || !!message}
            >
              {loading ? <CircularProgress size={24} /> : 'Restablecer Contraseña'}
            </Button>
            
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link to="/login" variant="body2">
                  Volver al inicio de sesión
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;
