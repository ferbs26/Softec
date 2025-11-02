import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  Link,
  CssBaseline,
  Avatar,
  CircularProgress,
  Grid,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ComputerIcon from '@mui/icons-material/Computer';
import SchoolIcon from '@mui/icons-material/School';
import { motion } from 'framer-motion';

// Estilos personalizados
const styles = (theme) => ({
  root: {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
  },
  card: {
    width: '100%',
    maxWidth: 1000,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: theme.shadows[10],
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
  },
  leftPanel: {
    flex: 1,
    padding: theme.spacing(6),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.background.paper,
  },
  rightPanel: {
    flex: 1,
    padding: theme.spacing(6),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.primary.contrastText,
    textAlign: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
    width: 60,
    height: 60,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    padding: theme.spacing(1.5),
    borderRadius: 8,
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none',
    boxShadow: 'none',
    '&:hover': {
      boxShadow: theme.shadows[3],
    },
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    '& svg': {
      marginRight: theme.spacing(2),
      fontSize: '2rem',
      color: theme.palette.primary.light,
    },
  },
  divider: {
    margin: theme.spacing(3, 0),
    width: '100%',
    border: 'none',
    height: 1,
    backgroundColor: alpha(theme.palette.common.white, 0.2),
  },
});

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const classes = styles(theme);

  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mounted) return;
    
    setLoading(true);
    setLoginError('');
    
    try {
      const success = await login(email, password);
      if (!success) {
        setLoginError('Error al iniciar sesión. Verifique sus credenciales.');
      }
    } catch (err) {
      console.error('Error en el inicio de sesión:', err);
      setLoginError(err.response?.data?.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={classes.root}>
      <CssBaseline />
      <Fade in={mounted} timeout={800}>
        <Paper component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          sx={classes.card}
        >
          {/* Panel izquierdo - Formulario */}
          <Box sx={classes.leftPanel}>
            <Avatar sx={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            
            <Typography component="h1" variant="h4" sx={{ mt: 2, fontWeight: 600, color: 'text.primary' }}>
              Bienvenido a Softec
            </Typography>
            
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 3 }}>
              Inicia sesión para acceder al panel de control
            </Typography>

            {loginError && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {loginError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={classes.form}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Correo electrónico"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                  mb: 2
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                  mb: 2
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading}
                sx={classes.submit}
                size="large"
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Iniciar sesión'
                )}
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Link 
                  href="/forgot-password" 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                      color: 'primary.main'
                    }
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </Box>
            </Box>
          </Box>

          {/* Panel derecho - Información */}
          <Box sx={classes.rightPanel}>
            <Box sx={{ maxWidth: 400, px: 4 }}>
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 600, fontSize: '1.8rem' }}>
                Gestión de Aulas Informáticas
              </Typography>
              
              <Box sx={{ textAlign: 'left', mb: 4 }}>
                <Box sx={classes.featureItem}>
                  <ComputerIcon />
                  <div>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Control de Inventario</Typography>
                    <Typography variant="body2">Gestiona todas las computadoras de tus aulas</Typography>
                  </div>
                </Box>
                
                <Box sx={classes.featureItem}>
                  <SchoolIcon />
                  <div>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Seguimiento de Aulas</Typography>
                    <Typography variant="body2">Monitorea el estado de cada aula en tiempo real</Typography>
                  </div>
                </Box>
              </Box>

              <Box sx={classes.divider} />
              
              <Typography variant="body2" sx={{ mt: 3, opacity: 0.9 }}>
                ¿No tienes una cuenta?{' '}
                <Link 
                  href="/register" 
                  color="inherit" 
                  sx={{ 
                    fontWeight: 600, 
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Regístrate aquí
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default LoginPage;
