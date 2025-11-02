import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import { reporteService, computadoraService } from '../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const getStatusChip = (estado) => {
  switch (estado) {
    case 'Pendiente':
      return <Chip icon={<PendingIcon />} label="Pendiente" color="warning" size="small" />;
    case 'En Progreso':
      return <Chip icon={<BuildIcon />} label="En Progreso" color="info" size="small" />;
    case 'Resuelto':
      return <Chip icon={<CheckCircleIcon />} label="Resuelto" color="success" size="small" />;
    default:
      return <Chip label={estado} size="small" />;
  }
};

const ReportesPage = () => {
  const [reportes, setReportes] = useState([]);
  const [computadoras, setComputadoras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentReporte, setCurrentReporte] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const loadReportes = async () => {
    try {
      setLoading(true);
      const response = await reporteService.getAll();
      setReportes(response.data);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComputadoras = async () => {
    try {
      const response = await computadoraService.getAll();
      setComputadoras(response.data);
    } catch (error) {
      console.error('Error al cargar computadoras:', error);
    }
  };

  useEffect(() => {
    loadReportes();
    loadComputadoras();
  }, []);

  const handleOpenDialog = (reporte = null) => {
    setCurrentReporte(reporte);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentReporte(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      if (currentReporte) {
        await reporteService.update(currentReporte.id, data);
      } else {
        await reporteService.create(data);
      }
      loadReportes();
      handleCloseDialog();
    } catch (error) {
      console.error('Error al guardar el reporte:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este reporte?')) {
      try {
        await reporteService.delete(id);
        loadReportes();
      } catch (error) {
        console.error('Error al eliminar el reporte:', error);
      }
    }
  };

  const handleStatusChange = async (id, nuevoEstado) => {
    try {
      await reporteService.updateEstado(id, { estado: nuevoEstado });
      loadReportes();
    } catch (error) {
      console.error('Error al actualizar el estado del reporte:', error);
    }
  };

  const filteredReportes = reportes.filter(reporte => {
    const matchesSearch = 
      reporte.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reporte.computadora?.numeroSerie?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filtroEstado === 'todos' || reporte.estado === filtroEstado;
    
    return matchesSearch && matchesFilter;
  });

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
        <Typography variant="h4">Gestión de Reportes</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Reporte
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <Box display="flex" alignItems="center">
              <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <TextField
                fullWidth
                variant="standard"
                placeholder="Buscar reportes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="standard">
              <InputLabel>Filtrar por estado</InputLabel>
              <Select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                label="Filtrar por estado"
              >
                <MenuItem value="todos">Todos los estados</MenuItem>
                <MenuItem value="Pendiente">Pendientes</MenuItem>
                <MenuItem value="En Progreso">En Progreso</MenuItem>
                <MenuItem value="Resuelto">Resueltos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Computadora</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReportes.map((reporte) => (
              <TableRow key={reporte.id}>
                <TableCell>#{reporte.id}</TableCell>
                <TableCell>{reporte.computadora?.numeroSerie || 'N/A'}</TableCell>
                <TableCell sx={{ maxWidth: 300 }}>
                  <Typography noWrap>{reporte.descripcion}</Typography>
                </TableCell>
                <TableCell>{getStatusChip(reporte.estado)}</TableCell>
                <TableCell>
                  {format(new Date(reporte.fechaCreacion), 'dd/MM/yyyy HH:mm', { locale: es })}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(reporte)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(reporte.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                  {reporte.estado !== 'Resuelto' && (
                    <IconButton 
                      onClick={() => handleStatusChange(reporte.id, 'Resuelto')} 
                      color="success"
                      title="Marcar como resuelto"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {currentReporte ? 'Editar Reporte' : 'Nuevo Reporte'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Computadora</InputLabel>
                  <Select
                    name="computadoraId"
                    defaultValue={currentReporte?.computadoraId || ''}
                    label="Computadora"
                    required
                  >
                    {computadoras.map((comp) => (
                      <MenuItem key={comp.id} value={comp.id}>
                        {comp.numeroSerie} - {comp.marca} {comp.modelo} 
                        {comp.aula ? ` (${comp.aula.nombre})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    name="estado"
                    defaultValue={currentReporte?.estado || 'Pendiente'}
                    label="Estado"
                    required
                  >
                    <MenuItem value="Pendiente">Pendiente</MenuItem>
                    <MenuItem value="En Progreso">En Progreso</MenuItem>
                    <MenuItem value="Resuelto">Resuelto</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="descripcion"
                  label="Descripción del problema"
                  fullWidth
                  multiline
                  rows={4}
                  required
                  defaultValue={currentReporte?.descripcion || ''}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="solucion"
                  label="Solución (si aplica)"
                  fullWidth
                  multiline
                  rows={3}
                  defaultValue={currentReporte?.solucion || ''}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              Guardar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default ReportesPage;
