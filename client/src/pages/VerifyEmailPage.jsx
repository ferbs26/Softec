import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Alert,
  CircularProgress,
  TextField,
  Grid
} from '@mui/material';
import { authService } from '../services/api';

const VerifyEmailPage = () => {
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const location = useLocation();
  const navigate = useNavigate();
  
  const email = location.state?.email || '';

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleCodeChange = (index, value) => {
    if (value && !/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Mover al siguiente campo automáticamente
    if (value && index < 3) {
      document.getElementById(`code-${index + 1}`).focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 4) {
      return setError('Por favor ingresa el código de 4 dígitos');
    }
    
    try {
      setLoading(true);
      setError('');
      
      await authService.verifyEmail({
        email,
        code: verificationCode
      });
      
      setMessage('¡Correo verificado correctamente! Redirigiendo...');
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Tu correo ha sido verificado. Por favor inicia sesión.' 
          } 
        });
      }, 2000);
      
    } catch (err) {
      console.error('Error al verificar el correo:', err);
      setError(err.response?.data?.message || 'Error al verificar el código. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      
      await authService.resendVerificationCode({ email });
      
      setMessage('Se ha enviado un nuevo código de verificación a tu correo.');
      setResendDisabled(true);
      setCountdown(30);
      
    } catch (err) {
      console.error('Error al reenviar el código:', err);
      setError(err.response?.data?.message || 'Error al reenviar el código. Intenta de nuevo.');
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
            Verificación de Correo Electrónico
          </Typography>
          
          <Typography variant="body1" align="center" sx={{ mb: 3 }}>
            Hemos enviado un código de verificación de 4 dígitos a <strong>{email}</strong>.
            Por favor, ingrésalo a continuación para verificar tu cuenta.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          )}
          
          {message && (
            <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>
          )}
          
          <Box component="form" onSubmit={handleVerify} noValidate>
            <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
              {[0, 1, 2, 3].map((index) => (
                <Grid item key={index}>
                  <TextField
                    id={`code-${index}`}
                    value={code[index]}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onFocus={(e) => e.target.select()}
                    inputProps={{
                      maxLength: 1,
                      style: { 
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        padding: '8px',
                        width: '50px',
                        height: '60px'
                      }
                    }}
                    variant="outlined"
                    autoFocus={index === 0}
                  />
                </Grid>
              ))}
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Verificar'}
            </Button>
            
            <Box textAlign="center" mt={2}>
              <Button
                onClick={handleResendCode}
                disabled={resendDisabled || loading}
                color="primary"
              >
                {resendDisabled 
                  ? `Reenviar código (${countdown}s)` 
                  : 'No recibí el código'}
              </Button>
            </Box>
            
            <Box textAlign="center" mt={3}>
              <Button component={Link} to="/login" color="primary">
                Volver al inicio de sesión
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmailPage;
