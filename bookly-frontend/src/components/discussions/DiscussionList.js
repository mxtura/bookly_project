import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Typography, Grid, Card, CardContent, Button, Box,
  TextField, CircularProgress, Chip, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
  Snackbar, Alert
} from '@mui/material';
import { getDiscussions, getBooks, createDiscussion } from '../../services/api';

const DiscussionList = () => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createDialog, setCreateDialog] = useState(false);
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [bookSearch, setBookSearch] = useState('');
  const [bookSearchTimeout, setBookSearchTimeout] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    book: null
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    fetchDiscussions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const response = await getDiscussions({ search: search });
      setDiscussions(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setNotification({
        open: true,
        message: 'Не удалось загрузить обсуждения',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDiscussions();
  };

  const handleOpenCreateDialog = () => {
    setCreateDialog(true);
    fetchBooks();
  };

  const fetchBooks = async (searchQuery = '') => {
    setLoadingBooks(true);
    try {
      const params = searchQuery ? { search: searchQuery } : {};
      const response = await getBooks(params);
      setBooks(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
      setNotification({
        open: true,
        message: 'Не удалось загрузить книги. Пожалуйста, попробуйте снова.',
        severity: 'error'
      });
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleBookSearchChange = (e) => {
    const value = e.target.value;
    setBookSearch(value);

    if (bookSearchTimeout) {
      clearTimeout(bookSearchTimeout);
    }

    const timeoutId = setTimeout(() => {
      if (value.trim()) {
        fetchBooks(value);
      } else {
        fetchBooks();
      }
    }, 500);

    setBookSearchTimeout(timeoutId);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateDiscussion = async () => {
    try {
      await createDiscussion(formData);
      
      setFormData({
        title: '',
        content: '',
        book: null
      });
      setCreateDialog(false);
      
      fetchDiscussions();
      
      setNotification({
        open: true,
        message: 'Обсуждение успешно создано',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating discussion:', error);
      setNotification({
        open: true,
        message: 'Не удалось создать обсуждение',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Обсуждения книг
        </Typography>
        
        {isAuthenticated && (
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleOpenCreateDialog}
          >
            Начать новое обсуждение
          </Button>
        )}
      </Box>
      
      <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 4 }}>
        <TextField
          label="Поиск обсуждений"
          variant="outlined"
          fullWidth
          value={search}
          onChange={handleSearchChange}
          placeholder="Поиск по заголовку или содержанию"
        />
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : discussions.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6" gutterBottom>
            Обсуждения не найдены
          </Typography>
          {isAuthenticated && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleOpenCreateDialog}
              sx={{ mt: 2 }}
            >
              Начать первое обсуждение
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {discussions.map((discussion) => (
            <Grid item key={discussion.id} xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h5" component={Link} to={`/discussions/${discussion.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                      {discussion.title}
                    </Typography>
                    
                    {discussion.book && (
                      <Chip 
                        label={discussion.book_title} 
                        component={Link}
                        to={`/books/${discussion.book}`}
                        clickable
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Автор: {discussion.creator_username} от {new Date(discussion.created_at).toLocaleDateString()}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {discussion.content.length > 200 
                      ? `${discussion.content.substring(0, 200)}...` 
                      : discussion.content}
                  </Typography>
                  
                  <Button 
                    component={Link} 
                    to={`/discussions/${discussion.id}`}
                    variant="outlined"
                  >
                    Просмотреть обсуждение
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Create Discussion Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Начать новое обсуждение</DialogTitle>
        <DialogContent>
          <TextField
            name="title"
            label="Заголовок обсуждения"
            value={formData.title}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
            required
          />
          
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Связать с книгой (опционально)
            </Typography>
            
            <TextField
              label="Поиск книг"
              value={bookSearch}
              onChange={handleBookSearchChange}
              fullWidth
              margin="normal"
              placeholder="Поиск по названию или автору"
              helperText="Введите текст для поиска книг (подождите немного для получения результатов)"
            />
            
            {loadingBooks ? (
              <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', my: 2 }} />
            ) : (
              <FormControl fullWidth margin="normal">
                <InputLabel>Выберите книгу</InputLabel>
                <Select
                  name="book"
                  value={formData.book || ''}
                  onChange={handleFormChange}
                  label="Выберите книгу"
                >
                  <MenuItem value="">Нет</MenuItem>
                  {books.map((book) => (
                    <MenuItem key={book.id} value={book.id}>
                      {book.title} {book.author?.name ? `автор: ${book.author.name}` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
          
          <TextField
            name="content"
            label="Содержание обсуждения"
            value={formData.content}
            onChange={handleFormChange}
            fullWidth
            multiline
            rows={6}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Отмена</Button>
          <Button 
            onClick={handleCreateDiscussion}
            color="primary"
            disabled={!formData.title || !formData.content}
          >
            Создать обсуждение
          </Button>
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

export default DiscussionList;
