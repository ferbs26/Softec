import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      return setError('Por favor ingresa tu correo electrónico');
    }
    
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      await authService.forgotPassword({ email });
      
      setMessage('Se ha enviado un enlace de recuperación a tu correo electrónico.');
      
      // Redirigir a la página de verificación después de 3 segundos
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 3000);
      
    } catch (err) {
      console.error('Error al solicitar recuperación de contraseña:', err);
      setError(err.response?.data?.message || 'Error al procesar la solicitud. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

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
            Recuperar Contraseña
          </Typography>
          
          <Typography variant="body1" align="center" sx={{ mb: 3 }}>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
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
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || !!message}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || !!message}
            >
              {loading ? <CircularProgress size={24} /> : 'Enviar Enlace de Recuperación'}
            </Button>
            
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link to="/login" variant="body2">
                  ¿Recordaste tu contraseña? Inicia sesión
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;
