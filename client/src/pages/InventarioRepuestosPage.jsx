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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// Servicio simulado (deberías reemplazarlo con tu servicio real)
const repuestoService = {
  getAll: async () => {
    // Simular llamada a la API
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          data: [
            { id: 1, codigo: 'REP001', nombre: 'Disco Duro SSD 500GB', categoria: 'Almacenamiento', cantidad: 15, minimo: 5, precio: 89.99, estado: 'disponible' },
            { id: 2, codigo: 'REP002', nombre: 'Memoria RAM 8GB DDR4', categoria: 'Memoria', cantidad: 25, minimo: 10, precio: 49.99, estado: 'disponible' },
            { id: 3, codigo: 'REP003', nombre: 'Teclado USB', categoria: 'Periféricos', cantidad: 30, minimo: 15, precio: 24.99, estado: 'disponible' },
            { id: 4, codigo: 'REP004', nombre: 'Mouse Inalámbrico', categoria: 'Periféricos', cantidad: 2, minimo: 10, precio: 19.99, estado: 'bajo' },
            { id: 5, codigo: 'REP005', nombre: 'Pantalla LED 24"', categoria: 'Pantallas', cantidad: 8, minimo: 5, precio: 129.99, estado: 'disponible' },
          ]
        });
      }, 500);
    });
  },
  // ...otros métodos del servicio
};

const categorias = [
  'Almacenamiento',
  'Memoria',
  'Procesadores',
  'Tarjetas Madre',
  'Tarjetas de Video',
  'Fuentes de Poder',
  'Gabinetes',
  'Enfriamiento',
  'Periféricos',
  'Redes',
  'Pantallas',
  'Otros'
];

const getEstadoRepuesto = (cantidad, minimo) => {
  if (cantidad === 0) return 'agotado';
  if (cantidad <= minimo) return 'bajo';
  return 'disponible';
};

const getEstadoColor = (estado) => {
  switch (estado) {
    case 'disponible':
      return 'success';
    case 'bajo':
      return 'warning';
    case 'agotado':
      return 'error';
    default:
      return 'default';
  }
};

const InventarioRepuestosPage = () => {
  const [repuestos, setRepuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRepuesto, setCurrentRepuesto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const loadRepuestos = async () => {
    try {
      setLoading(true);
      const response = await repuestoService.getAll();
      setRepuestos(response.data);
    } catch (error) {
      console.error('Error al cargar repuestos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepuestos();
  }, []);

  const handleOpenDialog = (repuesto = null) => {
    setCurrentRepuesto(repuesto);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentRepuesto(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Aquí iría la lógica para guardar en la API
    console.log('Guardando repuesto:', data);
    
    // Simular guardado exitoso
    handleCloseDialog();
    loadRepuestos();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este repuesto?')) {
      try {
        // Aquí iría la lógica para eliminar en la API
        console.log('Eliminando repuesto con ID:', id);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simular espera
        loadRepuestos();
      } catch (error) {
        console.error('Error al eliminar el repuesto:', error);
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredRepuestos = repuestos.filter(repuesto => {
    const matchesSearch = 
      repuesto.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repuesto.codigo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      filtroCategoria === 'todas' || 
      repuesto.categoria === filtroCategoria;
    
    return matchesSearch && matchesCategory;
  });

  const paginatedRepuestos = filteredRepuestos.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
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
        <Typography variant="h4">
          <InventoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Inventario de Repuestos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Agregar Repuesto
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
                placeholder="Buscar repuestos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="standard">
              <InputLabel>Categoría</InputLabel>
              <Select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                label="Categoría"
              >
                <MenuItem value="todas">Todas las categorías</MenuItem>
                {categorias.map((categoria) => (
                  <MenuItem key={categoria} value={categoria}>
                    {categoria}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell align="right">Mínimo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Precio</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRepuestos.length > 0 ? (
              paginatedRepuestos.map((repuesto) => (
                <TableRow 
                  key={repuesto.id}
                  hover
                  sx={{ 
                    '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell component="th" scope="row">
                    <strong>{repuesto.codigo}</strong>
                  </TableCell>
                  <TableCell>{repuesto.nombre}</TableCell>
                  <TableCell>{repuesto.categoria}</TableCell>
                  <TableCell align="right">{repuesto.cantidad}</TableCell>
                  <TableCell align="right">{repuesto.minimo}</TableCell>
                  <TableCell>
                    <Chip 
                      label={repuesto.estado === 'disponible' ? 'Disponible' : 
                             repuesto.estado === 'bajo' ? 'Stock Bajo' : 'Agotado'}
                      color={getEstadoColor(repuesto.estado)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">${repuesto.precio.toFixed(2)}</TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleOpenDialog(repuesto)} 
                      color="primary"
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(repuesto.id)} 
                      color="error"
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Box>
                    <InventoryIcon color="disabled" sx={{ fontSize: 60, mb: 1 }} />
                    <Typography variant="subtitle1">No se encontraron repuestos</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {searchTerm ? 'Prueba con otros términos de búsqueda' : 'Agrega un nuevo repuesto para comenzar'}
                    </Typography>
                    {searchTerm && (
                      <Button 
                        variant="outlined" 
                        sx={{ mt: 2 }}
                        onClick={() => setSearchTerm('')}
                      >
                        Limpiar búsqueda
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {filteredRepuestos.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredRepuestos.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
          />
        )}
      </TableContainer>

      {/* Diálogo para agregar/editar repuesto */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmit
        }}
      >
        <DialogTitle>
          {currentRepuesto ? 'Editar Repuesto' : 'Agregar Nuevo Repuesto'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="codigo"
                label="Código"
                fullWidth
                required
                margin="normal"
                defaultValue={currentRepuesto?.codigo || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Categoría</InputLabel>
                <Select
                  name="categoria"
                  label="Categoría"
                  defaultValue={currentRepuesto?.categoria || ''}
                  required
                >
                  {categorias.map((categoria) => (
                    <MenuItem key={categoria} value={categoria}>
                      {categoria}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="nombre"
                label="Nombre del repuesto"
                fullWidth
                required
                margin="normal"
                defaultValue={currentRepuesto?.nombre || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="cantidad"
                label="Cantidad en stock"
                type="number"
                fullWidth
                required
                margin="normal"
                defaultValue={currentRepuesto?.cantidad || 0}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="minimo"
                label="Stock mínimo"
                type="number"
                fullWidth
                required
                margin="normal"
                defaultValue={currentRepuesto?.minimo || 5}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="precio"
                label="Precio unitario"
                type="number"
                fullWidth
                required
                margin="normal"
                defaultValue={currentRepuesto?.precio || 0}
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="descripcion"
                label="Descripción"
                fullWidth
                multiline
                rows={3}
                margin="normal"
                defaultValue={currentRepuesto?.descripcion || ''}
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
      </Dialog>
    </Container>
  );
};

export default InventarioRepuestosPage;
