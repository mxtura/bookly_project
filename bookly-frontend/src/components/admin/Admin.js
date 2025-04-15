import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Tabs, Tab, Paper, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel, CircularProgress, 
  Snackbar, Alert
} from '@mui/material';
import { getUserProfile } from '../../services/api';

const Admin = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
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
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await getUserProfile();
        if (!response.data.is_staff) {
          window.location.href = '/';
        }
        setLoading(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        window.location.href = '/';
      }
    };
    
    checkAdminStatus();
    loadData();
  }, []);
  
  const loadData = () => {
    setUsers([
      { id: 1, username: 'admin', email: 'admin@example.com', is_active: true, is_staff: true },
      { id: 2, username: 'user1', email: 'user1@example.com', is_active: true, is_staff: false },
      { id: 3, username: 'user2', email: 'user2@example.com', is_active: true, is_staff: false },
    ]);
    
    setBooks([
      { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565' },
      { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780060935467' },
      { id: 3, title: '1984', author: 'George Orwell', isbn: '9780451524935' },
    ]);
    
    setReviews([
      { id: 1, book_title: 'The Great Gatsby', user: 'user1', rating: 4, status: 'approved' },
      { id: 2, book_title: 'To Kill a Mockingbird', user: 'user2', rating: 5, status: 'approved' },
      { id: 3, book_title: '1984', user: 'user1', rating: 3, status: 'pending' },
    ]);
    
    setDiscussions([
      { id: 1, title: 'Thoughts on Gatsby', created_by: 'user1', reported: false },
      { id: 2, title: 'Symbolism in Mockingbird', created_by: 'user2', reported: true },
      { id: 3, title: 'Orwell\'s Predictions', created_by: 'user1', reported: false },
    ]);
    
    setTickets([
      { id: 1, subject: 'Login Issue', user: 'user1', status: 'OPEN', created_at: '2023-01-15' },
      { id: 2, subject: 'Book not showing', user: 'user2', status: 'IN_PROGRESS', created_at: '2023-01-20' },
      { id: 3, subject: 'Feature request', user: 'user1', status: 'CLOSED', created_at: '2023-01-25' },
    ]);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleAction = (item, type, action) => {
    setSelectedItem(item);
    setDialogType(`${type}-${action}`);
    setDialogOpen(true);
  };
  
  const handleConfirmAction = () => {
    const [type, action] = dialogType.split('-');
    let successMessage = '';
    
    switch (type) {
      case 'user':
        if (action === 'delete') {
          setUsers(users.filter(user => user.id !== selectedItem.id));
          successMessage = `User ${selectedItem.username} deleted successfully`;
        } else if (action === 'toggle-admin') {
          setUsers(users.map(user => 
            user.id === selectedItem.id 
              ? { ...user, is_staff: !user.is_staff } 
              : user
          ));
          successMessage = `User ${selectedItem.username} ${selectedItem.is_staff ? 'demoted' : 'promoted'} successfully`;
        } else if (action === 'toggle-status') {
          setUsers(users.map(user => 
            user.id === selectedItem.id 
              ? { ...user, is_active: !user.is_active } 
              : user
          ));
          successMessage = `User ${selectedItem.username} ${selectedItem.is_active ? 'blocked' : 'unblocked'} successfully`;
        }
        break;
        
      case 'book':
        if (action === 'delete') {
          setBooks(books.filter(book => book.id !== selectedItem.id));
          successMessage = `Book "${selectedItem.title}" deleted successfully`;
        }
        break;
        
      case 'review':
        if (action === 'delete') {
          setReviews(reviews.filter(review => review.id !== selectedItem.id));
          successMessage = `Review deleted successfully`;
        } else if (action === 'approve') {
          setReviews(reviews.map(review => 
            review.id === selectedItem.id 
              ? { ...review, status: 'approved' } 
              : review
          ));
          successMessage = `Review approved successfully`;
        }
        break;
        
      case 'discussion':
        if (action === 'delete') {
          setDiscussions(discussions.filter(disc => disc.id !== selectedItem.id));
          successMessage = `Discussion deleted successfully`;
        }
        break;
        
      case 'ticket':
        if (action === 'update-status') {
          successMessage = `Ticket status updated successfully`;
        }
        break;
        
      default:
        break;
    }
    
    setDialogOpen(false);
    
    if (successMessage) {
      setNotification({
        open: true,
        message: successMessage,
        severity: 'success'
      });
    }
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
        Admin Dashboard
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Users" />
          <Tab label="Books" />
          <Tab label="Reviews" />
          <Tab label="Discussions" />
          <Tab label="Support Tickets" />
        </Tabs>
      </Paper>
      
      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.is_active ? 'Active' : 'Blocked'}</TableCell>
                  <TableCell>{user.is_staff ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      onClick={() => handleAction(user, 'user', 'toggle-status')}
                      color={user.is_active ? 'error' : 'success'}
                      sx={{ mr: 1 }}
                    >
                      {user.is_active ? 'Block' : 'Unblock'}
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => handleAction(user, 'user', 'toggle-admin')}
                      color="warning"
                      sx={{ mr: 1 }}
                    >
                      {user.is_staff ? 'Demote' : 'Promote'}
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => handleAction(user, 'user', 'delete')}
                      color="error"
                    >
                      Delete
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
              Add New Book
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>ISBN</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>{book.id}</TableCell>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.isbn}</TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        onClick={() => handleAction(book, 'book', 'edit')}
                        color="primary"
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        onClick={() => handleAction(book, 'book', 'delete')}
                        color="error"
                      >
                        Delete
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
                <TableCell>Book</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>{review.id}</TableCell>
                  <TableCell>{review.book_title}</TableCell>
                  <TableCell>{review.user}</TableCell>
                  <TableCell>{review.rating}/5</TableCell>
                  <TableCell>{review.status}</TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      onClick={() => handleAction(review, 'review', 'view')}
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    {review.status === 'pending' && (
                      <Button 
                        size="small" 
                        onClick={() => handleAction(review, 'review', 'approve')}
                        color="success"
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                    )}
                    <Button 
                      size="small" 
                      onClick={() => handleAction(review, 'review', 'delete')}
                      color="error"
                    >
                      Delete
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
                <TableCell>Title</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Reported</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {discussions.map((discussion) => (
                <TableRow key={discussion.id}>
                  <TableCell>{discussion.id}</TableCell>
                  <TableCell>{discussion.title}</TableCell>
                  <TableCell>{discussion.created_by}</TableCell>
                  <TableCell>{discussion.reported ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      onClick={() => handleAction(discussion, 'discussion', 'view')}
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => handleAction(discussion, 'discussion', 'delete')}
                      color="error"
                    >
                      Delete
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
                <TableCell>Subject</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>{ticket.user}</TableCell>
                  <TableCell>{ticket.status}</TableCell>
                  <TableCell>{ticket.created_at}</TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      onClick={() => handleAction(ticket, 'ticket', 'view')}
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => handleAction(ticket, 'ticket', 'update-status')}
                      color="warning"
                    >
                      Update Status
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'user-delete' ? 'Delete User' :
           dialogType === 'user-toggle-admin' ? (selectedItem?.is_staff ? 'Demote User' : 'Promote User') :
           dialogType === 'user-toggle-status' ? (selectedItem?.is_active ? 'Block User' : 'Unblock User') :
           dialogType === 'book-delete' ? 'Delete Book' :
           dialogType === 'book-add' ? 'Add New Book' :
           dialogType === 'book-edit' ? 'Edit Book' :
           dialogType === 'review-delete' ? 'Delete Review' :
           dialogType === 'review-approve' ? 'Approve Review' :
           dialogType === 'discussion-delete' ? 'Delete Discussion' :
           dialogType === 'ticket-update-status' ? 'Update Ticket Status' :
           'Confirm Action'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'user-delete' && (
            <Typography>
              Are you sure you want to delete the user {selectedItem?.username}? This action cannot be undone.
            </Typography>
          )}
          
          {dialogType === 'user-toggle-admin' && (
            <Typography>
              Are you sure you want to {selectedItem?.is_staff ? 'remove admin privileges from' : 'grant admin privileges to'} {selectedItem?.username}?
            </Typography>
          )}
          
          {dialogType === 'user-toggle-status' && (
            <Typography>
              Are you sure you want to {selectedItem?.is_active ? 'block' : 'unblock'} {selectedItem?.username}?
            </Typography>
          )}
          
          {dialogType === 'book-delete' && (
            <Typography>
              Are you sure you want to delete the book "{selectedItem?.title}"? This action cannot be undone.
            </Typography>
          )}
          
          {dialogType === 'review-delete' && (
            <Typography>
              Are you sure you want to delete this review? This action cannot be undone.
            </Typography>
          )}
          
          {dialogType === 'review-approve' && (
            <Typography>
              Are you sure you want to approve this review?
            </Typography>
          )}
          
          {dialogType === 'discussion-delete' && (
            <Typography>
              Are you sure you want to delete the discussion "{selectedItem?.title}"? This action cannot be undone.
            </Typography>
          )}
          
          {dialogType === 'ticket-update-status' && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedItem?.status || ''}
                label="Status"
              >
                <MenuItem value="OPEN">Open</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="CLOSED">Closed</MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmAction}
            color={
              dialogType.includes('delete') ? 'error' :
              dialogType.includes('approve') || dialogType.includes('unblock') ? 'success' :
              'primary'
            }
          >
            Confirm
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
