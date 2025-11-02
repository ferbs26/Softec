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
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { computadoraService } from '../services/api';

const ComputadorasPage = () => {
  const [computadoras, setComputadoras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentComputadora, setCurrentComputadora] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadComputadoras = async () => {
    try {
      setLoading(true);
      const response = await computadoraService.getAll();
      setComputadoras(response.data);
    } catch (error) {
      console.error('Error al cargar computadoras:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComputadoras();
  }, []);

  const handleOpenDialog = (computadora = null) => {
    setCurrentComputadora(computadora);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentComputadora(null);
  };

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const formData = new FormData(e.target);
    const data = {
      numero_serie: formData.get('numeroSerie'),
      tipo: formData.get('tipo'),
      marca: formData.get('marca'),
      modelo: formData.get('modelo'),
      estado: formData.get('estado'),
      observaciones: formData.get('observaciones'),
      // Agregar más campos según sea necesario
    };

    try {
      if (currentComputadora) {
        await computadoraService.update(currentComputadora.id, data);
      } else {
        await computadoraService.create(data);
      }
      await loadComputadoras();
      handleCloseDialog();
    } catch (error) {
      console.error('Error al guardar la computadora:', error);
      setError(error.response?.data?.message || 'Error al guardar la computadora. Por favor, intente de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta computadora?')) {
      try {
        await computadoraService.delete(id);
        loadComputadoras();
      } catch (error) {
        console.error('Error al eliminar la computadora:', error);
      }
    }
  };

  const filteredComputadoras = computadoras.filter(comp => 
    comp.numeroSerie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Typography variant="h4">Gestión de Computadoras</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Agregar
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center">
          <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <TextField
            fullWidth
            variant="standard"
            placeholder="Buscar computadoras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>N° de Serie</TableCell>
              <TableCell>Marca</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredComputadoras.map((computadora) => (
              <TableRow key={computadora.id}>
                <TableCell>{computadora.numeroSerie}</TableCell>
                <TableCell>{computadora.marca}</TableCell>
                <TableCell>{computadora.modelo}</TableCell>
                <TableCell>
                  <Chip 
                    label={computadora.estado === 'funciona' ? 'Funcionando' : 'Con fallas'} 
                    color={computadora.estado === 'funciona' ? 'success' : 'error'} 
                    size="small"
                  />
                </TableCell>
                <TableCell>{computadora.aula?.nombre || 'Sin asignar'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(computadora)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(computadora.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={!isSubmitting ? handleCloseDialog : undefined} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {currentComputadora ? 'Editar Computadora' : 'Agregar Nueva Computadora'}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Box mb={2} p={1} bgcolor="error.light" color="error.contrastText" borderRadius={1}>
                <Typography variant="body2">{error}</Typography>
              </Box>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="numeroSerie"
                  label="Número de Serie"
                  fullWidth
                  required
                  disabled={isSubmitting}
                  defaultValue={currentComputadora?.numero_serie || ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="marca"
                  label="Marca"
                  fullWidth
                  required
                  disabled={isSubmitting}
                  defaultValue={currentComputadora?.marca || ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="tipo"
                  label="Tipo"
                  select
                  fullWidth
                  required
                  disabled={isSubmitting}
                  defaultValue={currentComputadora?.tipo || 'escritorio'}
                  SelectProps={{ native: true }}
                >
                  <option value="escritorio">Escritorio</option>
                  <option value="portatil">Portátil</option>
                  <option value="todo-en-uno">Todo en uno</option>
                  <option value="servidor">Servidor</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="modelo"
                  label="Modelo"
                  fullWidth
                  required
                  disabled={isSubmitting}
                  defaultValue={currentComputadora?.modelo || ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="estado"
                  label="Estado"
                  select
                  fullWidth
                  required
                  disabled={isSubmitting}
                  defaultValue={currentComputadora?.estado || 'funciona'}
                  SelectProps={{ native: true }}
                >
                  <option value="funciona">Funcionando</option>
                  <option value="con fallas">Con fallas</option>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="observaciones"
                  label="Observaciones"
                  fullWidth
                  multiline
                  rows={3}
                  disabled={isSubmitting}
                  defaultValue={currentComputadora?.observaciones || ''}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default ComputadorasPage;
