import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Avatar,
  Tooltip,
  IconButton,
  Divider,
  Tabs,
  Tab,
  Grid,
  Button
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  School as SchoolIcon,
  Assignment as ReportIcon,
  Build as RepuestoIcon,
  History as HistoryIcon
} from '@mui/icons-material';

// Datos de ejemplo para el historial
const generarHistorialEjemplo = () => {
  const entidades = ['Computadora', 'Aula', 'Reporte', 'Usuario', 'Repuesto'];
  const acciones = ['creó', 'actualizó', 'eliminó', 'cambió estado de'];
  const usuarios = ['Admin', 'Técnico 1', 'Técnico 2', 'Profesor 1', 'Estudiante 1'];
  const fechas = [
    new Date(2023, 10, 15, 10, 30),
    new Date(2023, 10, 14, 15, 45),
    new Date(2023, 10, 14, 9, 15),
    new Date(2023, 10, 13, 16, 20),
    new Date(2023, 10, 12, 11, 10),
  ];
  
  return Array.from({ length: 25 }, (_, i) => {
    const entidad = entidades[Math.floor(Math.random() * entidades.length)];
    const accion = acciones[Math.floor(Math.random() * acciones.length)];
    const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
    const fecha = fechas[Math.floor(Math.random() * fechas.length)];
    const id = Math.floor(Math.random() * 1000) + 1;
    
    let detalle = '';
    if (entidad === 'Computadora') {
      detalle = `Computadora #${id} (Aula ${Math.floor(Math.random() * 20) + 1})`;
    } else if (entidad === 'Aula') {
      detalle = `Aula #${id} (Piso ${Math.floor(Math.random() * 3) + 1})`;
    } else if (entidad === 'Reporte') {
      detalle = `Reporte #${id} (${['Pendiente', 'En Progreso', 'Resuelto'][Math.floor(Math.random() * 3)]})`;
    } else if (entidad === 'Usuario') {
      detalle = `Usuario: ${['admin', 'tecnico', 'profesor', 'estudiante'][Math.floor(Math.random() * 4)]}${id}`;
    } else {
      detalle = `Repuesto #${id} (${['Disco Duro', 'Memoria RAM', 'Teclado', 'Mouse', 'Pantalla'][Math.floor(Math.random() * 5)]})`;
    }
    
    return {
      id: i + 1,
      entidad,
      accion,
      detalle,
      usuario,
      fecha,
      cambios: Math.random() > 0.7 ? 'Se modificaron varios campos' : null
    };
  });
}

const getEntidadIcon = (entidad) => {
  switch (entidad) {
    case 'Computadora':
      return <ComputerIcon color="primary" />;
    case 'Aula':
      return <SchoolIcon color="secondary" />;
    case 'Reporte':
      return <ReportIcon color="action" />;
    case 'Usuario':
      return <PersonIcon color="primary" />;
    case 'Repuesto':
      return <RepuestoIcon color="success" />;
    default:
      return <InfoIcon />;
  }
};

const formatFecha = (fecha) => {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(fecha);
};

const HistorialCambiosPage = () => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEntidad, setFiltroEntidad] = useState('todas');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [detalleAbierto, setDetalleAbierto] = useState(null);

  const entidades = [
    'todas',
    'Computadora',
    'Aula',
    'Reporte',
    'Usuario',
    'Repuesto'
  ];

  const tabs = [
    { label: 'Todo', value: 0 },
    { label: 'Hoy', value: 1 },
    { label: 'Esta semana', value: 2 },
    { label: 'Este mes', value: 3 },
  ];

  const loadHistorial = async () => {
    try {
      setLoading(true);
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = generarHistorialEjemplo();
      setHistorial(data);
    } catch (error) {
      console.error('Error al cargar el historial:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistorial();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const toggleDetalle = (id) => {
    setDetalleAbierto(detalleAbierto === id ? null : id);
  };

  const filtrarPorFecha = (fecha) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    switch (tabValue) {
      case 1: // Hoy
        return fecha >= hoy;
      case 2: // Esta semana
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        return fecha >= inicioSemana;
      case 3: // Este mes
        return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
      default:
        return true;
    }
  };

  const filteredHistorial = historial.filter(item => {
    const matchesSearch = 
      item.detalle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.usuario.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEntity = 
      filtroEntidad === 'todas' || 
      item.entidad === filtroEntidad;
    
    const matchesDate = filtrarPorFecha(item.fecha);
    
    return matchesSearch && matchesEntity && matchesDate;
  });

  const paginatedHistorial = filteredHistorial.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getChipColor = (entidad) => {
    switch (entidad) {
      case 'Computadora':
        return 'primary';
      case 'Aula':
        return 'secondary';
      case 'Reporte':
        return 'info';
      case 'Usuario':
        return 'warning';
      case 'Repuesto':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          <HistoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Historial de Cambios
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadHistorial}
        >
          Actualizar
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} />
          ))}
        </Tabs>
        
        <Box p={2}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <Box display="flex" alignItems="center">
                <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Buscar en el historial..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="standard">
                <InputLabel>Filtrar por entidad</InputLabel>
                <Select
                  value={filtroEntidad}
                  onChange={(e) => setFiltroEntidad(e.target.value)}
                  label="Filtrar por entidad"
                  startAdornment={<FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  {entidades.map((entidad) => (
                    <MenuItem key={entidad} value={entidad}>
                      {entidad === 'todas' ? 'Todas las entidades' : entidad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Acción</TableCell>
                <TableCell>Detalles</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Fecha y Hora</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedHistorial.length > 0 ? (
                paginatedHistorial.map((item) => (
                  <React.Fragment key={item.id}>
                    <TableRow hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Box mr={1}>
                            {getEntidadIcon(item.entidad)}
                          </Box>
                          <Chip 
                            label={item.entidad}
                            size="small"
                            color={getChipColor(item.entidad)}
                            variant="outlined"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          <strong>{item.usuario}</strong> {item.accion} {item.detalle}
                        </Typography>
                        {item.cambios && (
                          <Typography variant="caption" color="text.secondary">
                            {item.cambios}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                            {item.usuario.charAt(0)}
                          </Avatar>
                          {item.usuario}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatFecha(item.fecha)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Hace {Math.floor(Math.random() * 24) + 1}h
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Ver detalles">
                          <IconButton 
                            size="small"
                            onClick={() => toggleDetalle(item.id)}
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    {detalleAbierto === item.id && (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ bgcolor: 'background.default', p: 3 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Detalles del cambio
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                              <Typography variant="body2">
                                <strong>ID del registro:</strong> {item.id}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                              <Typography variant="body2">
                                <strong>Entidad:</strong> {item.entidad}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                              <Typography variant="body2">
                                <strong>Acción:</strong> {item.accion}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="body2">
                                <strong>Detalles:</strong> {item.detalle}
                              </Typography>
                            </Grid>
                            {item.cambios && (
                              <Grid item xs={12}>
                                <Typography variant="body2">
                                  <strong>Cambios realizados:</strong> {item.cambios}
                                </Typography>
                              </Grid>
                            )}
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Usuario:</strong> {item.usuario}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Fecha y hora:</strong> {formatFecha(item.fecha)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Box>
                      <HistoryIcon color="disabled" sx={{ fontSize: 60, mb: 1 }} />
                      <Typography variant="subtitle1">No se encontraron registros</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {searchTerm ? 'Prueba con otros términos de búsqueda' : 'No hay cambios registrados'}
                      </Typography>
                      {searchTerm && (
                        <Button 
                          variant="outlined" 
                          sx={{ mt: 2 }}
                          onClick={() => {
                            setSearchTerm('');
                            setFiltroEntidad('todas');
                            setTabValue(0);
                          }}
                        >
                          Limpiar filtros
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {filteredHistorial.length > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredHistorial.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Registros por página:"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`} registros`
              }
            />
          )}
        </TableContainer>
      </Card>
    </Container>
  );
};

export default HistorialCambiosPage;
