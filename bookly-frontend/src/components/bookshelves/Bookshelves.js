import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Typography, Grid, Paper, Box, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Card, CardContent, CardMedia, CardActionArea, CircularProgress,
  Tabs, Tab, Snackbar, Alert, IconButton
} from '@mui/material';
// Removed unused imports: List, ListItem, ListItemText, ListItemSecondaryAction
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import {
  getUserBookshelves, createBookshelf, updateBookshelf, deleteBookshelf,
  getBooks
} from '../../services/api';

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
      } else if (response.data && response.data.length > 0) {
        setSelectedShelf(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching bookshelves:', error);
      setNotification({
        open: true,
        message: 'Failed to load bookshelves',
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
        message: 'Bookshelf created successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating bookshelf:', error);
      setNotification({
        open: true,
        message: 'Failed to create bookshelf',
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
        message: 'Bookshelf updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating bookshelf:', error);
      setNotification({
        open: true,
        message: 'Failed to update bookshelf',
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
        message: 'Bookshelf deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting bookshelf:', error);
      setNotification({
        open: true,
        message: 'Failed to delete bookshelf',
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
      // Get current books in the shelf
      const updatedBooks = [...selectedShelf.books.map(book => book.id), bookId];
      
      // Update the shelf with the new book
      await updateBookshelf(selectedShelf.id, { books: updatedBooks });
      
      // Refresh bookshelves
      fetchBookshelves();
      
      setAddBookDialog(false);
      setNotification({
        open: true,
        message: 'Book added to shelf successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding book to shelf:', error);
      setNotification({
        open: true,
        message: 'Failed to add book to shelf',
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
      fetchBookshelves();
      
      setNotification({
        open: true,
        message: 'Book removed from shelf successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error removing book from shelf:', error);
      setNotification({
        open: true,
        message: 'Failed to remove book from shelf',
        severity: 'error'
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedShelf(bookshelves[newValue]);
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
          My Bookshelves
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
          Create Shelf
        </Button>
      </Box>
      
      {bookshelves.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            You don't have any bookshelves yet
          </Typography>
          <Typography variant="body1" paragraph>
            Create your first bookshelf to start organizing your books.
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
            Create Your First Shelf
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
                Add Book
              </Button>
            </Box>
          </Box>
          
          {selectedShelf && selectedShelf.books.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                This shelf is empty
              </Typography>
              <Typography variant="body1" paragraph>
                Add books to this shelf to start building your collection.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleAddBookClick}
              >
                Add Books
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {selectedShelf?.books.map((book) => (
                <Grid item key={book.id} xs={12} sm={6} md={4} lg={3}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <CardActionArea component={Link} to={`/books/${book.id}`}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={book.cover_image || 'https://via.placeholder.com/150x200?text=No+Cover'}
                        alt={book.title}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h6" component="div" noWrap>
                          {book.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          by {book.author}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    <IconButton
                      size="small"
                      color="error"
                      sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255, 255, 255, 0.7)' }}
                      onClick={() => handleRemoveBookFromShelf(book.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
      
      {/* Create/Edit Shelf Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{editMode ? 'Edit Bookshelf' : 'Create New Bookshelf'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Shelf Name"
            type="text"
            fullWidth
            value={shelfForm.name}
            onChange={(e) => setShelfForm({ ...shelfForm, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={editMode ? handleUpdateShelf : handleCreateShelf} color="primary">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Book Dialog */}
      <Dialog open={addBookDialog} onClose={() => setAddBookDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Book to {selectedShelf?.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search Books"
            type="text"
            fullWidth
            value={searchQuery}
            onChange={handleBookSearch}
            sx={{ mb: 2 }}
          />
          
          <Grid container spacing={2}>
            {availableBooks.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="body1" align="center">
                  No books found. Try a different search term.
                </Typography>
              </Grid>
            ) : (
              availableBooks.map(book => (
                <Grid item xs={12} sm={6} md={4} key={book.id}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="140"
                      image={book.cover_image || 'https://via.placeholder.com/150x200?text=No+Cover'}
                      alt={book.title}
                    />
                    <CardContent>
                      <Typography variant="subtitle1" noWrap>{book.title}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        by {book.author}
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => handleAddBookToShelf(book.id)}
                        disabled={selectedShelf?.books.some(b => b.id === book.id)}
                      >
                        {selectedShelf?.books.some(b => b.id === book.id) ? 'Already Added' : 'Add to Shelf'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddBookDialog(false)}>Close</Button>
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
