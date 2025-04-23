import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Typography, Grid, Paper, Box, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CardMedia, CardContent, CircularProgress,
  Tabs, Tab, Snackbar, Alert, IconButton, Card
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import {
  getUserBookshelves, createBookshelf, updateBookshelf, deleteBookshelf,
  getBooks
} from '../../services/api';
import BookCard from '../books/BookCard'; // Import the new BookCard component

// Define a constant for the fixed card width that will be used throughout the component
const BOOK_CARD_WIDTH = 180; // This should match the width from BookCard component

const Bookshelves = () => {
  const [bookshelves, setBookshelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [shelfForm, setShelfForm] = useState({ name: '' });
  const [editMode, setEditMode] = useState(false);
  const [addBookDialog, setAddBookDialog] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchBookshelves();
  }, []);

  const fetchBookshelves = async () => {
    setLoading(true);
    try {
      const response = await getUserBookshelves();
      setBookshelves(response.data.results || response.data);
      
      if (response.data.results && response.data.results.length > 0) {
        setSelectedShelf(response.data.results[0]);
        console.log("Initial bookshelf name:", response.data.results[0].books);
      } else if (response.data && response.data.length > 0) {
        setSelectedShelf(response.data[0]);
        console.log("Initial bookshelf books:", response.data[0].books);
      }
    } catch (error) {
      console.error('Error fetching bookshelves:', error);
      setNotification({
        open: true,
        message: 'Не удал ось загрузить книжные полки',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShelf = async () => {
    try {
      await createBookshelf(shelfForm);
      setDialogOpen(false);
      setShelfForm({ name: '' });
      fetchBookshelves();
      setNotification({
        open: true,
        message: 'Книжная полка успешно создана',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating bookshelf:', error);
      setNotification({
        open: true,
        message: 'Не удалось создать книжную полку',
        severity: 'error'
      });
    }
  };

  const handleUpdateShelf = async () => {
    try {
      await updateBookshelf(selectedShelf.id, { name: shelfForm.name });
      setDialogOpen(false);
      setShelfForm({ name: '' });
      setEditMode(false);
      fetchBookshelves();
      setNotification({
        open: true,
        message: 'Книжная полка успешно обновлена',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating bookshelf:', error);
      setNotification({
        open: true,
        message: 'Не удалось обновить книжную полку',
        severity: 'error'
      });
    }
  };

  const handleDeleteShelf = async (id) => {
    try {
      await deleteBookshelf(id);
      fetchBookshelves();
      setNotification({
        open: true,
        message: 'Книжная полка успешно удалена',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting bookshelf:', error);
      setNotification({
        open: true,
        message: 'Не удалось удалить книжную полку',
        severity: 'error'
      });
    }
  };

  const handleEditClick = (shelf) => {
    setSelectedShelf(shelf);
    setShelfForm({ name: shelf.name });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleAddBookClick = async () => {
    try {
      const response = await getBooks({ search: searchQuery });
      setAvailableBooks(response.data.results || response.data);
      setAddBookDialog(true);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleBookSearch = async (e) => {
    setSearchQuery(e.target.value);
    try {
      const response = await getBooks({ search: e.target.value });
      setAvailableBooks(response.data.results || response.data);
    } catch (error) {
      console.error('Error searching books:', error);
    }
  };

  const handleAddBookToShelf = async (bookId) => {
    try {
      if (!selectedShelf) {
        throw new Error("No bookshelf selected");
      }
      
      console.log("Adding book", bookId, "to shelf", selectedShelf.id);
      
      // Get current books in the shelf
      const currentBooks = selectedShelf.books.map(book => book.id);
      const updatedBooks = [...currentBooks, bookId];
      console.log("Updated books array:", updatedBooks);
      
      // Update the shelf with the new book
      const updateData = { books: updatedBooks };
      console.log("Sending update data:", updateData);
      
      const response = await updateBookshelf(selectedShelf.id, updateData);
      console.log("Update response:", response);
      
      // Close the dialog immediately to show that action was taken
      setAddBookDialog(false);
      
      // Show a temporary notification
      setNotification({
        open: true,
        message: 'Добавление книги...',
        severity: 'info'
      });
      
      // Wait a bit for the backend to process the update
      setTimeout(async () => {
        // Refresh bookshelves
        await fetchBookshelves();
        
        // Re-select the current shelf to update its books
        const refreshedBookshelves = await getUserBookshelves();
        const refreshedShelf = refreshedBookshelves.data.results?.find(shelf => shelf.id === selectedShelf.id) || 
                              refreshedBookshelves.data?.find(shelf => shelf.id === selectedShelf.id);
        
        if (refreshedShelf) {
          setSelectedShelf(refreshedShelf);
          console.log(`Updated bookshelf "${refreshedShelf.name}" books:`, refreshedShelf.books);
        }
        
        // Show final notification
        setNotification({
          open: true,
          message: 'Книга успешно добавлена на полку',
          severity: 'success'
        });
        
        // If everything else fails, reload the page after 2 seconds
        if (!refreshedShelf?.books.some(book => book.id === bookId)) {
          setNotification({
            open: true,
            message: 'Перезагрузка страницы для отображения изменений...',
            severity: 'info'
          });
          setTimeout(() => window.location.reload(), 2000);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error adding book to shelf:', error);
      setAddBookDialog(false);
      setNotification({
        open: true,
        message: `Не удалось добавить книгу на полку: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleRemoveBookFromShelf = async (bookId) => {
    try {
      // Filter out the book to remove
      const updatedBooks = selectedShelf.books
        .filter(book => book.id !== bookId)
        .map(book => book.id);
      
      // Update the shelf without the removed book
      await updateBookshelf(selectedShelf.id, { books: updatedBooks });
      
      // Refresh bookshelves
      await fetchBookshelves();
      
      // Log the updated books after removal
      const updatedShelf = (await getUserBookshelves()).data.results?.find(shelf => shelf.id === selectedShelf.id) ||
                          (await getUserBookshelves()).data?.find(shelf => shelf.id === selectedShelf.id);
      console.log(`Books after removal from "${selectedShelf.name}":`, updatedShelf?.books || []);
      
      setNotification({
        open: true,
        message: 'Книга успешно удалена с полки',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error removing book from shelf:', error);
      setNotification({
        open: true,
        message: 'Не удалось удалить книгу с полки',
        severity: 'error'
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    const selectedShelf = bookshelves[newValue];
    setSelectedShelf(selectedShelf);
    console.log(`Selected bookshelf "${selectedShelf.name}" books:`, selectedShelf.books);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Мои книжные полки
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => {
            setEditMode(false);
            setShelfForm({ name: '' });
            setDialogOpen(true);
          }}
        >
          Создать полку
        </Button>
      </Box>
      
      {bookshelves.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            У вас еще нет книжных полок
          </Typography>
          <Typography variant="body1" paragraph>
            Создайте свою первую книжную полку, чтобы начать организовывать книги.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => {
              setEditMode(false);
              setShelfForm({ name: '' });
              setDialogOpen(true);
            }}
          >
            Создать первую полку
          </Button>
        </Paper>
      ) : (
        <>
          <Paper sx={{ mb: 4 }}>
            <Tabs
              value={bookshelves.findIndex(shelf => shelf.id === selectedShelf?.id)}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              {bookshelves.map((shelf) => (
                <Tab 
                  key={shelf.id} 
                  label={shelf.name} 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: 'auto',
                    minWidth: 120
                  }}
                />
              ))}
            </Tabs>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              {selectedShelf?.name}
            </Typography>
            
            <Box>
              <IconButton 
                color="primary" 
                onClick={() => handleEditClick(selectedShelf)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              
              <IconButton 
                color="error" 
                onClick={() => handleDeleteShelf(selectedShelf.id)}
              >
                <DeleteIcon />
              </IconButton>
              
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleAddBookClick}
                sx={{ ml: 2 }}
              >
                Добавить книгу
              </Button>
            </Box>
          </Box>
          
          {selectedShelf && selectedShelf.books.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Эта полка пуста
              </Typography>
              <Typography variant="body1" paragraph>
                Добавьте книги на эту полку, чтобы начать создавать коллекцию.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleAddBookClick}
              >
                Добавить книги
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3} sx={{ justifyContent: 'flex-start' }}>
              {selectedShelf?.books.map((book) => (
                <Grid 
                  item 
                  key={book.id} 
                  xs={12} sm={6} md={4} lg={3}
                  sx={{ 
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <BookCard 
                    book={book}
                    onRemove={handleRemoveBookFromShelf}
                    actionIcon={<DeleteIcon />}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
      
      {/* Create/Edit Shelf Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{editMode ? 'Редактировать книжную полку' : 'Создать новую книжную полку'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название полки"
            type="text"
            fullWidth
            value={shelfForm.name}
            onChange={(e) => setShelfForm({ ...shelfForm, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button onClick={editMode ? handleUpdateShelf : handleCreateShelf} color="primary">
            {editMode ? 'Обновить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Book Dialog */}
      <Dialog open={addBookDialog} onClose={() => setAddBookDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Добавить книгу на {selectedShelf?.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Поиск книг"
            type="text"
            fullWidth
            value={searchQuery}
            onChange={handleBookSearch}
            sx={{ mb: 2 }}
          />
          
          <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
            {availableBooks.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="body1" align="center">
                  Книги не найдены. Попробуйте другой поисковый запрос.
                </Typography>
              </Grid>
            ) : (
              availableBooks.map(book => (
                <Grid 
                  item 
                  key={book.id} 
                  xs={12} sm={6} md={4}
                  sx={{ 
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <Box sx={{ position: 'relative', width: BOOK_CARD_WIDTH, maxWidth: '100%' }}>
                    <BookCard 
                      book={book}
                      cardProps={{ 
                        sx: { 
                          mb: 0,
                          height: '100%',
                          width: '100%'
                        } 
                      }}
                      mediaProps={{
                        height: 140
                      }}
                    />
                    <IconButton
                      size="small"
                      color="primary"
                      sx={{ 
                        position: 'absolute', 
                        top: 5, 
                        right: 5, 
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.95)',
                        },
                        '&.Mui-disabled': {
                          bgcolor: 'rgba(240, 240, 240, 0.8)',
                        }
                      }}
                      onClick={() => handleAddBookToShelf(book.id)}
                      disabled={selectedShelf?.books.some(b => b.id === book.id)}
                    >
                      {selectedShelf?.books.some(b => b.id === book.id) 
                        ? <CheckIcon fontSize="small" /> 
                        : <AddIcon fontSize="small" />}
                    </IconButton>
                  </Box>
                </Grid>
              ))
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddBookDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Bookshelves;
