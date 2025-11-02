import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Button,
  useTheme,
  alpha,
  Fade,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  LinearProgress,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Computer as ComputerIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  BarChart as BarChartIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Dashboard as DashboardIcon,
  Report as ReportIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Dns as DnsIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  computadoraService, 
  reporteService,
  aulaService
} from '../services/api';

const StatCard = ({ title, value, icon, color, description, trend }) => {
  const theme = useTheme();
  
  return (
    <Card 
      component={motion.div}
      whileHover={{ y: -5, boxShadow: theme.shadows[8] }}
      transition={{ duration: 0.3 }}
      sx={{ 
        height: '100%',
        borderRadius: 3,
        background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette[color].light, 0.1)} 100%)`,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        overflow: 'visible',
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography 
              variant="subtitle2" 
              color="textSecondary"
              sx={{ 
                fontWeight: 500,
                letterSpacing: 0.5,
                mb: 0.5
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              {value}
            </Typography>
            {description && (
              <Typography 
                variant="caption" 
                color="textSecondary"
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.75rem',
                }}
              >
                <TrendingUpIcon 
                  color={trend > 0 ? 'success' : trend < 0 ? 'error' : 'disabled'}
                  sx={{ fontSize: '1rem', mr: 0.5 }}
                />
                {description}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: alpha(theme.palette[color].main, 0.1),
              color: theme.palette[color].main,
              borderRadius: '12px',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ml: 2,
              flexShrink: 0,
            }}
          >
            {React.cloneElement(icon, { fontSize: 'medium' })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const DashboardPage = () => {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [recentReports, setRecentReports] = useState([]);
  const [classroomStatus, setClassroomStatus] = useState([]);
  const [stats, setStats] = useState({
    totalComputers: 0,
    availableComputers: 0,
    inUseComputers: 0,
    maintenanceComputers: 0,
    totalClassrooms: 0,
    activeClassrooms: 0,
    inactiveClassrooms: 0,
    activeReports: 0,
    highPriorityReports: 0,
    mediumPriorityReports: 0,
    lowPriorityReports: 0,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const computerData = [
    { name: 'Disponibles', value: stats.availableComputers, color: 'success' },
    { name: 'En uso', value: stats.inUseComputers, color: 'info' },
    { name: 'Mantenimiento', value: stats.maintenanceComputers, color: 'warning' },
  ];

  const reportData = [
    { name: 'Alta', value: stats.highPriorityReports, color: 'error' },
    { name: 'Media', value: stats.mediumPriorityReports, color: 'warning' },
    { name: 'Baja', value: stats.lowPriorityReports, color: 'info' },
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
    
    // Actualizar datos cada 5 minutos
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    return () => {
      setMounted(false);
      clearInterval(interval);
    };
  }, []);

  const fetchDashboardData = async () => {
    if (!mounted) return;
    
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      // Inicializar valores por defecto
      const defaultStats = {
        totalComputers: 0,
        availableComputers: 0,
        inUseComputers: 0,
        maintenanceComputers: 0,
        totalClassrooms: 0,
        activeReports: 0,
      };

      try {
        // Obtener computadoras
        const computersResponse = await computadoraService.getAll();
        if (computersResponse.status === 200 && Array.isArray(computersResponse.data)) {
          const computers = computersResponse.data;
          defaultStats.totalComputers = computers.length;
          defaultStats.availableComputers = computers.filter(c => c.estado === 'disponible').length;
          defaultStats.inUseComputers = computers.filter(c => c.estado === 'en_uso').length;
          defaultStats.maintenanceComputers = computers.filter(c => c.estado === 'mantenimiento').length;
        }
      } catch (error) {
        console.error('Error al cargar computadoras:', error);
      }

      try {
        // Obtener aulas
        const classroomsResponse = await aulaService.getAll();
        if (classroomsResponse.status === 200 && Array.isArray(classroomsResponse.data)) {
          defaultStats.totalClassrooms = classroomsResponse.data.length;
        }
      } catch (error) {
        console.error('Error al cargar aulas:', error);
      }

      try {
        // Obtener reportes activos
        const reportsResponse = await reporteService.getAll();
        if (reportsResponse.status === 200 && Array.isArray(reportsResponse.data)) {
          defaultStats.activeReports = reportsResponse.data.filter(r => r.estado === 'abierto').length;
        }
      } catch (error) {
        console.error('Error al cargar reportes:', error);
      }

      setStats({
        ...defaultStats,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error en fetchDashboardData:', error);
      if (mounted) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Error al cargar los datos del dashboard. Por favor, intente de nuevo más tarde.'
        }));
      }
    }
  };

  if (stats.loading && !mounted) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        flexDirection="column"
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
          Cargando datos del dashboard...
        </Typography>
      </Box>
    );
  }

  // Función para obtener el color según el estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'abierto': return 'error';
      case 'en_progreso': return 'warning';
      case 'resuelto': return 'success';
      default: return 'default';
    }
  };

  // Función para obtener el icono según el estado
  const getStatusIcon = (status) => {
    switch (status) {
      case 'abierto': return <ErrorIcon color="error" />;
      case 'en_progreso': return <AccessTimeIcon color="warning" />;
      case 'resuelto': return <CheckCircleIcon color="success" />;
      default: return <InfoIcon color="info" />;
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true,
      locale: es 
    });
  };

  // Datos para el gráfico de computadoras
  const computerChartData = [
    { name: 'Disponibles', value: stats.availableComputers, color: theme.palette.success.main },
    { name: 'En uso', value: stats.inUseComputers, color: theme.palette.info.main },
    { name: 'Mantenimiento', value: stats.maintenanceComputers, color: theme.palette.warning.main },
  ];

  // Datos para el gráfico de reportes
  const reportChartData = [
    { name: 'Alta prioridad', value: stats.highPriorityReports, color: theme.palette.error.main },
    { name: 'Media prioridad', value: stats.mediumPriorityReports, color: theme.palette.warning.main },
    { name: 'Baja prioridad', value: stats.lowPriorityReports, color: theme.palette.info.main },
  ];

  return (
    <AnimatePresence>
      <Fade in={mounted} timeout={500}>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {/* Encabezado */}
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' },
              mb: 3,
              gap: 2
            }}
          >
            <Box>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5,
                  fontSize: { xs: '1.8rem', sm: '2.125rem' }
                }}
              >
                Panel de Control
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {stats.lastUpdated ? 
                  `Actualizado ${formatDate(stats.lastUpdated)}` : 
                  'Bienvenido al panel de administración'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={fetchDashboardData}
                disabled={stats.loading}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                  },
                  flex: { xs: 1, sm: '0 0 auto' }
                }}
              >
                {stats.loading ? 'Actualizando...' : 'Actualizar'}
              </Button>
              
              <Tooltip title="Información del sistema">
                <IconButton
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    },
                    borderRadius: 3,
                  }}
                >
                  <InfoIcon color="primary" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Tarjetas de resumen */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Computadoras"
                value={stats.totalComputers}
                icon={<ComputerIcon />}
                color="primary"
                description={`${stats.availableComputers} disponibles`}
                trend={stats.availableComputers - (stats.totalComputers / 2)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Aulas"
                value={stats.totalClassrooms}
                icon={<SchoolIcon />}
                color="secondary"
                description={`${stats.activeClassrooms} activas`}
                trend={stats.activeClassrooms - (stats.totalClassrooms / 2)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Reportes"
                value={stats.activeReports}
                icon={<ReportIcon />}
                color="warning"
                description={`${stats.highPriorityReports} de alta prioridad`}
                trend={-stats.highPriorityReports}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Disponibilidad"
                value={`${stats.totalComputers > 0 ? Math.round((stats.availableComputers / stats.totalComputers) * 100) : 0}%`}
                icon={<CheckCircleIcon />}
                color="success"
                description="Computadoras disponibles"
                trend={stats.availableComputers - (stats.totalComputers / 2)}
              />
            </Grid>
          </Grid>

          {/* Gráficos y datos detallados */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Gráfico de estado de computadoras */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" component="h2">
                    Estado de Computadoras
                  </Typography>
                  <Tooltip title="Número de computadoras por estado">
                    <InfoIcon color="action" fontSize="small" />
                  </Tooltip>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ height: 250, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={computerChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {computerChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value, name) => [value, name]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box mt={2} display="flex" justifyContent="space-around">
                  {computerChartData.map((item, index) => (
                    <Box key={index} textAlign="center">
                      <Box 
                        sx={{
                          width: 12,
                          height: 12,
                          bgcolor: item.color,
                          display: 'inline-block',
                          borderRadius: '50%',
                          mr: 1
                        }}
                      />
                      <Typography variant="body2" color="textSecondary" component="span">
                        {item.name}: {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            {/* Gráfico de reportes */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" component="h2">
                    Reportes por Prioridad
                  </Typography>
                  <Tooltip title="Número de reportes abiertos por prioridad">
                    <InfoIcon color="action" fontSize="small" />
                  </Tooltip>
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ height: 250, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportChartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" name="Reportes">
                        {reportChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <Box mt={2} display="flex" justifyContent="space-around" flexWrap="wrap" gap={1}>
                  {reportChartData.map((item, index) => (
                    <Chip 
                      key={index}
                      label={`${item.name}: ${item.value}`}
                      size="small"
                      sx={{ 
                        bgcolor: alpha(item.color, 0.1),
                        color: item.color,
                        fontWeight: 500
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Últimos reportes y estado de aulas */}
          <Grid container spacing={3}>
            {/* Últimos reportes */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" component="h2">
                    Últimos Reportes
                  </Typography>
                  <Button 
                    size="small" 
                    color="primary"
                    endIcon={<TrendingUpIcon />}
                    onClick={() => setActiveTab(1)}
                  >
                    Ver todos
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {recentReports.length > 0 ? (
                  <List dense>
                    {recentReports.map((report, index) => (
                      <React.Fragment key={report.id}>
                        <ListItem 
                          button
                          sx={{
                            borderRadius: 2,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            },
                            mb: 1
                          }}
                        >
                          <ListItemIcon>
                            {getStatusIcon(report.estado)}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle2" noWrap sx={{ maxWidth: '60%' }}>
                                  {report.titulo}
                                </Typography>
                                <Chip 
                                  label={report.prioridad || 'sin prioridad'}
                                  size="small"
                                  color={report.prioridad === 'alta' ? 'error' : 
                                         report.prioridad === 'media' ? 'warning' : 'default'}
                                  sx={{ ml: 1, fontWeight: 500 }}
                                />
                              </Box>
                            }
                            secondary={
                              <Box display="flex" justifyContent="space-between" flexWrap="wrap">
                                <Typography variant="caption" color="textSecondary">
                                  {report.aula?.nombre || 'Sin aula asignada'}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {formatDate(report.fecha_creacion)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < recentReports.length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box textAlign="center" py={4}>
                    <EventAvailableIcon color="action" sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
                    <Typography color="textSecondary">
                      No hay reportes recientes
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Estado de aulas */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" component="h2">
                    Estado de Aulas
                  </Typography>
                  <Chip 
                    label={`${stats.activeClassrooms} / ${stats.totalClassrooms} activas`} 
                    size="small"
                    color={stats.activeClassrooms === stats.totalClassrooms ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Box>
                <Divider sx={{ mb: 2 }} />
                {classroomStatus.length > 0 ? (
                  <Box>
                    {classroomStatus.map((aula, index) => (
                      <Box key={aula.id} mb={index < classroomStatus.length - 1 ? 2 : 0}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                          <Typography variant="subtitle2">
                            {aula.nombre}
                          </Typography>
                          <Chip 
                            label={aula.estado}
                            size="small"
                            color={aula.estado === 'Activa' ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box display="flex" alignItems="center">
                            <ComputerIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                            <Typography variant="caption" color="textSecondary">
                              {aula.computadoras} / {aula.capacidad || '?'} computadoras
                            </Typography>
                          </Box>
                          <Box width="60%" ml={1}>
                            <LinearProgress 
                              variant="determinate" 
                              value={aula.capacidad ? Math.min(100, (aula.computadoras / aula.capacidad) * 100) : 0}
                              color={aula.estado === 'Activa' ? 'primary' : 'secondary'}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                        </Box>
                        {index < classroomStatus.length - 1 && <Divider sx={{ mt: 1.5 }} />}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box textAlign="center" py={4}>
                    <SchoolIcon color="action" sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
                    <Typography color="textSecondary">
                      No hay información de aulas disponible
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </AnimatePresence>
  );
};

export default DashboardPage;
