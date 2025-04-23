import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Tabs, Tab, Paper, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel, CircularProgress, 
  Snackbar, Alert, TextField
} from '@mui/material';
import { 
  getUserProfile, getUsers, getBooks, getBookReviews, getDiscussions,
  deleteUser, updateUser, getSupportTickets, updateSupportTicket,
  deleteBook, createBook, updateBook, deleteReview, approveReview,
  deleteDiscussion, getTicketReplies
} from '../../services/api';

const Admin = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    description: ''
  });
  const [statusValue, setStatusValue] = useState('');
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await getUserProfile();
        if (!response.data.is_staff) {
          window.location.href = '/';
        } else {
          loadInitialData();
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load initial data for the first tab (Users)
      await loadTabData(0);
    } catch (error) {
      console.error('Error loading initial data:', error);
      showNotification('Failed to load data', 'error');
    }
  };

  const loadTabData = async (tabIndex) => {
    setTabLoading(true);
    
    try {
      switch (tabIndex) {
        case 0: // Users
          const usersResponse = await getUsers();
          setUsers(usersResponse.data.results || usersResponse.data);
          break;
        case 1: // Books
          const booksResponse = await getBooks();
          setBooks(booksResponse.data.results || booksResponse.data);
          break;
        case 2: // Reviews
          const reviewsResponse = await getBookReviews();
          setReviews(reviewsResponse.data.results || reviewsResponse.data);
          break;
        case 3: // Discussions
          const discussionsResponse = await getDiscussions();
          setDiscussions(discussionsResponse.data.results || discussionsResponse.data);
          break;
        case 4: // Support Tickets
          const ticketsResponse = await getSupportTickets();
          setTickets(ticketsResponse.data.results || ticketsResponse.data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error loading data for tab ${tabIndex}:`, error);
      showNotification(`Failed to load ${getTabName(tabIndex)}`, 'error');
    } finally {
      setTabLoading(false);
    }
  };
  
  const getTabName = (tabIndex) => {
    const tabNames = ['Users', 'Books', 'Reviews', 'Discussions', 'Support Tickets'];
    return tabNames[tabIndex] || '';
  };
  
  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleTabChange = async (event, newValue) => {
    setTabValue(newValue);
    await loadTabData(newValue);
  };
  
  const handleAction = (item, type, action) => {
    setSelectedItem(item);
    setDialogType(`${type}-${action}`);
    
    // Pre-fill the form data when editing a book
    if (type === 'book' && action === 'edit' && item) {
      setBookForm({
        title: item.title || '',
        author: item.author?.id || item.author || '',
        isbn: item.isbn || '',
        description: item.description || ''
      });
    }
    
    // Pre-fill the status when updating a ticket
    if (type === 'ticket' && action === 'update-status' && item) {
      setStatusValue(item.status || '');
    }
    
    setDialogOpen(true);
  };
  
  const handleConfirmAction = async () => {
    const [type, action] = dialogType.split('-');
    let success = false;
    let successMessage = '';
    
    try {
      switch (type) {
        case 'user':
          if (action === 'delete') {
            await deleteUser(selectedItem.id);
            setUsers(users.filter(user => user.id !== selectedItem.id));
            successMessage = `User ${selectedItem.username} deleted successfully`;
            success = true;
          } else if (action === 'toggle-admin') {
            const newValue = !selectedItem.is_staff;
            await updateUser(selectedItem.id, { is_staff: newValue });
            setUsers(users.map(user => 
              user.id === selectedItem.id 
                ? { ...user, is_staff: newValue } 
                : user
            ));
            successMessage = `User ${selectedItem.username} ${selectedItem.is_staff ? 'demoted' : 'promoted'} successfully`;
            success = true;
          }
          break;
          
        case 'book':
          if (action === 'delete') {
            await deleteBook(selectedItem.id);
            setBooks(books.filter(book => book.id !== selectedItem.id));
            successMessage = `Book "${selectedItem.title}" deleted successfully`;
            success = true;
          } else if (action === 'add') {
            const response = await createBook(bookForm);
            setBooks([...books, response.data]);
            successMessage = `Book "${bookForm.title}" created successfully`;
            success = true;
          } else if (action === 'edit') {
            await updateBook(selectedItem.id, bookForm);
            setBooks(books.map(book => 
              book.id === selectedItem.id 
                ? { ...book, ...bookForm } 
                : book
            ));
            successMessage = `Book "${bookForm.title}" updated successfully`;
            success = true;
          }
          break;
          
        case 'review':
          if (action === 'delete') {
            await deleteReview(selectedItem.id);
            setReviews(reviews.filter(review => review.id !== selectedItem.id));
            successMessage = `Review deleted successfully`;
            success = true;
          } else if (action === 'approve') {
            await approveReview(selectedItem.id);
            setReviews(reviews.map(review => 
              review.id === selectedItem.id 
                ? { ...review, status: 'approved' } 
                : review
            ));
            successMessage = `Review approved successfully`;
            success = true;
          }
          break;
          
        case 'discussion':
          if (action === 'delete') {
            await deleteDiscussion(selectedItem.id);
            setDiscussions(discussions.filter(disc => disc.id !== selectedItem.id));
            successMessage = `Discussion deleted successfully`;
            success = true;
          }
          break;
          
        case 'ticket':
          if (action === 'update-status') {
            await updateSupportTicket(selectedItem.id, { status: statusValue });
            setTickets(tickets.map(ticket => 
              ticket.id === selectedItem.id 
                ? { ...ticket, status: statusValue } 
                : ticket
            ));
            successMessage = `Ticket status updated successfully`;
            success = true;
          }
          break;
          
        default:
          break;
      }
      
      setDialogOpen(false);
      
      if (success) {
        showNotification(successMessage, 'success');
      }
    } catch (error) {
      console.error(`Error performing action ${dialogType}:`, error);
      showNotification(`Failed to ${action}: ${error.message}`, 'error');
    }
  };

  const handleBookFormChange = (e) => {
    setBookForm({
      ...bookForm,
      [e.target.name]: e.target.value
    });
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
      <Typography variant="h4" component="h1" gutterBottom>
        Панель администратора
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Пользователи" />
          <Tab label="Книги" />
          <Tab label="Отзывы" />
          <Tab label="Обсуждения" />
          <Tab label="Заявки в поддержку" />
        </Tabs>
      </Paper>
      
      {tabLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {tabValue === 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Имя пользователя</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Админ</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.is_active ? 'Активен' : 'Неактивен'}</TableCell>
                      <TableCell>{user.is_staff ? 'Да' : 'Нет'}</TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          onClick={() => handleAction(user, 'user', 'toggle-admin')}
                          color="warning"
                          sx={{ mr: 1 }}
                        >
                          {user.is_staff ? 'Убрать права' : 'Дать права'}
                        </Button>
                        <Button 
                          size="small" 
                          onClick={() => handleAction(user, 'user', 'delete')}
                          color="error"
                        >
                          Удалить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {tabValue === 1 && (
            <>
              <Box sx={{ mb: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => handleAction(null, 'book', 'add')}
                >
                  Добавить книгу
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Название</TableCell>
                      <TableCell>Автор</TableCell>
                      <TableCell>ISBN</TableCell>
                      <TableCell>Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {books.map((book) => (
                      <TableRow key={book.id}>
                        <TableCell>{book.id}</TableCell>
                        <TableCell>{book.title}</TableCell>
                        <TableCell>{book.author_name || (book.author && typeof book.author === 'object' ? book.author.name : book.author)}</TableCell>
                        <TableCell>{book.isbn}</TableCell>
                        <TableCell>
                          <Button 
                            size="small" 
                            onClick={() => handleAction(book, 'book', 'edit')}
                            color="primary"
                            sx={{ mr: 1 }}
                          >
                            Редактировать
                          </Button>
                          <Button 
                            size="small" 
                            onClick={() => handleAction(book, 'book', 'delete')}
                            color="error"
                          >
                            Удалить
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
          
          {tabValue === 2 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Книга</TableCell>
                    <TableCell>Пользователь</TableCell>
                    <TableCell>Заголовок</TableCell>
                    <TableCell>Рейтинг</TableCell>
                    <TableCell>Дата создания</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>{review.id}</TableCell>
                      <TableCell>{review.book_title}</TableCell>
                      <TableCell>{review.username}</TableCell>
                      <TableCell>{review.title}</TableCell>
                      <TableCell>{review.rating}</TableCell>
                      <TableCell>{new Date(review.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          onClick={() => handleAction(review, 'review', 'delete')}
                          color="error"
                          sx={{ mr: 1 }}
                        >
                          Удалить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {tabValue === 3 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Заголовок</TableCell>
                    <TableCell>Автор</TableCell>
                    <TableCell>О книге</TableCell>
                    <TableCell>Дата создания</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {discussions.map((discussion) => (
                    <TableRow key={discussion.id}>
                      <TableCell>{discussion.id}</TableCell>
                      <TableCell>{discussion.title}</TableCell>
                      <TableCell>{discussion.created_by_username}</TableCell>
                      <TableCell>{discussion.book_title || "Н/Д"}</TableCell>
                      <TableCell>{new Date(discussion.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          onClick={() => handleAction(discussion, 'discussion', 'delete')}
                          color="error"
                        >
                          Удалить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {tabValue === 4 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Тема</TableCell>
                    <TableCell>Пользователь</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Дата создания</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>{ticket.id}</TableCell>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>{ticket.username}</TableCell>
                      <TableCell>
                        {ticket.status === 'OPEN' && 'Открыта'}
                        {ticket.status === 'IN_PROGRESS' && 'В работе'}
                        {ticket.status === 'CLOSED' && 'Закрыта'}
                      </TableCell>
                      <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          onClick={() => handleAction(ticket, 'ticket', 'update-status')}
                          color="primary"
                        >
                          Изменить статус
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
      
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'user-delete' ? 'Удалить пользователя' :
           dialogType === 'user-toggle-admin' ? (selectedItem?.is_staff ? 'Убрать права администратора' : 'Назначить администратором') :
           dialogType === 'book-delete' ? 'Удалить книгу' :
           dialogType === 'book-add' ? 'Добавить книгу' :
           dialogType === 'book-edit' ? 'Редактировать книгу' :
           dialogType === 'review-delete' ? 'Удалить отзыв' :
           dialogType === 'discussion-delete' ? 'Удалить обсуждение' :
           dialogType === 'ticket-update-status' ? 'Обновить статус заявки' :
           'Подтвердить действие'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'user-delete' && (
            <Typography>
              Вы уверены, что хотите удалить пользователя {selectedItem?.username}? Это действие нельзя отменить.
            </Typography>
          )}
          
          {dialogType === 'user-toggle-admin' && (
            <Typography>
              Вы уверены, что хотите {selectedItem?.is_staff ? 'убрать права администратора у' : 'назначить администратором'} {selectedItem?.username}?
            </Typography>
          )}
          
          {dialogType === 'book-delete' && (
            <Typography>
              Вы уверены, что хотите удалить книгу "{selectedItem?.title}"? Это действие нельзя отменить.
            </Typography>
          )}
          
          {(dialogType === 'book-add' || dialogType === 'book-edit') && (
            <>
              <TextField
                name="title"
                label="Название"
                fullWidth
                margin="normal"
                value={bookForm.title}
                onChange={handleBookFormChange}
                required
              />
              
              <TextField
                name="author"
                label="Автор"
                fullWidth
                margin="normal"
                value={bookForm.author}
                onChange={handleBookFormChange}
                required
              />
              
              <TextField
                name="isbn"
                label="ISBN"
                fullWidth
                margin="normal"
                value={bookForm.isbn}
                onChange={handleBookFormChange}
              />
              
              <TextField
                name="description"
                label="Описание"
                fullWidth
                multiline
                rows={4}
                margin="normal"
                value={bookForm.description}
                onChange={handleBookFormChange}
              />
            </>
          )}
          
          {dialogType === 'review-delete' && (
            <Typography>
              Вы уверены, что хотите удалить этот отзыв? Это действие нельзя отменить.
            </Typography>
          )}
          
          {dialogType === 'discussion-delete' && (
            <Typography>
              Вы уверены, что хотите удалить обсуждение "{selectedItem?.title}"? Это действие нельзя отменить.
            </Typography>
          )}
          
          {dialogType === 'ticket-update-status' && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Статус</InputLabel>
              <Select
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value)}
                label="Статус"
              >
                <MenuItem value="OPEN">Открыта</MenuItem>
                <MenuItem value="IN_PROGRESS">В работе</MenuItem>
                <MenuItem value="CLOSED">Закрыта</MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleConfirmAction}
            color={
              dialogType.includes('delete') ? 'error' :
              dialogType.includes('approve') || dialogType.includes('unblock') ? 'success' :
              'primary'
            }
          >
            Подтвердить
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

export default Admin;
