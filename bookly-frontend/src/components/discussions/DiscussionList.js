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
        message: 'Failed to load discussions',
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

  const fetchBooks = async () => {
    setLoadingBooks(true);
    try {
      const response = await getBooks({ search: bookSearch });
      setBooks(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleBookSearchChange = (e) => {
    setBookSearch(e.target.value);
    fetchBooks();
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
      
      // Reset form and close dialog
      setFormData({
        title: '',
        content: '',
        book: null
      });
      setCreateDialog(false);
      
      // Refresh discussions
      fetchDiscussions();
      
      setNotification({
        open: true,
        message: 'Discussion created successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating discussion:', error);
      setNotification({
        open: true,
        message: 'Failed to create discussion',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Book Discussions
        </Typography>
        
        {isAuthenticated && (
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleOpenCreateDialog}
          >
            Start New Discussion
          </Button>
        )}
      </Box>
      
      <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 4 }}>
        <TextField
          label="Search Discussions"
          variant="outlined"
          fullWidth
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by title or content"
        />
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : discussions.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6" gutterBottom>
            No discussions found
          </Typography>
          {isAuthenticated && (
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleOpenCreateDialog}
              sx={{ mt: 2 }}
            >
              Start the First Discussion
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
                    Started by {discussion.creator_username} on {new Date(discussion.created_at).toLocaleDateString()}
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
                    View Discussion
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Create Discussion Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Start New Discussion</DialogTitle>
        <DialogContent>
          <TextField
            name="title"
            label="Discussion Title"
            value={formData.title}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
            required
          />
          
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Link to a Book (Optional)
            </Typography>
            
            <TextField
              label="Search Books"
              value={bookSearch}
              onChange={handleBookSearchChange}
              fullWidth
              margin="normal"
              placeholder="Search by title or author"
            />
            
            {loadingBooks ? (
              <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', my: 2 }} />
            ) : (
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Book</InputLabel>
                <Select
                  name="book"
                  value={formData.book || ''}
                  onChange={handleFormChange}
                  label="Select Book"
                >
                  <MenuItem value="">None</MenuItem>
                  {books.map((book) => (
                    <MenuItem key={book.id} value={book.id}>
                      {book.title} by {book.author}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
          
          <TextField
            name="content"
            label="Discussion Content"
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
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateDiscussion}
            color="primary"
            disabled={!formData.title || !formData.content}
          >
            Create Discussion
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
