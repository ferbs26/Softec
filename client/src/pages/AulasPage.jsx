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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { aulaService } from '../services/api';

const AulasPage = () => {
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAula, setCurrentAula] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadAulas = async () => {
    try {
      setLoading(true);
      const response = await aulaService.getAll();
      setAulas(response.data);
    } catch (error) {
      console.error('Error al cargar aulas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAulas();
  }, []);

  const handleOpenDialog = (aula = null) => {
    setCurrentAula(aula);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentAula(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      if (currentAula) {
        await aulaService.update(currentAula.id, data);
      } else {
        await aulaService.create(data);
      }
      loadAulas();
      handleCloseDialog();
    } catch (error) {
      console.error('Error al guardar el aula:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este aula?')) {
      try {
        await aulaService.delete(id);
        loadAulas();
      } catch (error) {
        console.error('Error al eliminar el aula:', error);
      }
    }
  };

  const filteredAulas = aulas.filter(aula => 
    aula.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aula.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Typography variant="h4">Gestión de Aulas</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Agregar Aula
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center">
          <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <TextField
            fullWidth
            variant="standard"
            placeholder="Buscar aulas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Capacidad</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAulas.map((aula) => (
              <TableRow key={aula.id}>
                <TableCell>{aula.nombre}</TableCell>
                <TableCell>{aula.ubicacion}</TableCell>
                <TableCell>{aula.capacidad || '-'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(aula)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(aula.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {currentAula ? 'Editar Aula' : 'Agregar Nueva Aula'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="nombre"
                  label="Nombre del Aula"
                  fullWidth
                  required
                  defaultValue={currentAula?.nombre || ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="ubicacion"
                  label="Ubicación"
                  fullWidth
                  required
                  defaultValue={currentAula?.ubicacion || ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="capacidad"
                  label="Capacidad"
                  type="number"
                  fullWidth
                  defaultValue={currentAula?.capacidad || ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="descripcion"
                  label="Descripción"
                  fullWidth
                  multiline
                  rows={3}
                  defaultValue={currentAula?.descripcion || ''}
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

export default AulasPage;
