import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Paper, Box, Button, TextField,
  List, ListItem, ListItemText, ListItemSecondaryAction, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
  Divider, Card, CardContent, Avatar, Snackbar, Alert
} from '@mui/material';
import { getSupportTickets, createSupportTicket, getTicketReplies, createTicketReply } from '../../services/api';

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    message: ''
  });
  const [replyText, setReplyText] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchReplies(selectedTicket.id);
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await getSupportTickets();
      setTickets(response.data.results || response.data);
      
      // Auto-select the first ticket if available
      if (response.data.results && response.data.results.length > 0) {
        setSelectedTicket(response.data.results[0]);
      } else if (response.data && response.data.length > 0) {
        setSelectedTicket(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setNotification({
        open: true,
        message: 'Не удалось загрузить заявки в поддержку',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (ticketId) => {
    setLoadingReplies(true);
    try {
      const response = await getTicketReplies(ticketId);
      setReplies(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching replies:', error);
      setNotification({
        open: true,
        message: 'Не удалось загрузить ответы на заявку',
        severity: 'error'
      });
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleTicketFormChange = (e) => {
    setTicketForm({
      ...ticketForm,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateTicket = async () => {
    try {
      await createSupportTicket(ticketForm);
      setCreateDialog(false);
      setTicketForm({ subject: '', message: '' });
      fetchTickets();
      setNotification({
        open: true,
        message: 'Заявка в поддержку успешно создана',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      setNotification({
        open: true,
        message: 'Не удалось создать заявку в поддержку',
        severity: 'error'
      });
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    // Check if replyText is empty before submitting
    if (!replyText.trim()) {
      setNotification({
        open: true,
        message: 'Reply text cannot be empty',
        severity: 'error'
      });
      return;
    }
    
    try {
      // Use "message" field instead of "content" as the API expects
      const replyData = {
        ticket: selectedTicket.id,
        message: replyText.trim() // Changed from "content" to "message"
      };
      
      // Log the data being sent for debugging
      console.log('Sending reply data:', replyData);
      
      await createTicketReply(replyData);
      
      // Clear reply text and refetch replies
      setReplyText('');
      fetchReplies(selectedTicket.id);
      
      setNotification({
        open: true,
        message: 'Reply sent successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error sending reply:', error);
      setNotification({
        open: true,
        message: `Failed to send reply: ${error.message}`,
        severity: 'error'
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Заявки в поддержку
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setCreateDialog(true)}
        >
          Новая заявка в поддержку
        </Button>
      </Box>
      
      {tickets.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            У вас еще нет заявок в поддержку
          </Typography>
          <Typography variant="body1" paragraph>
            Создайте новую заявку, если вам нужна помощь.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setCreateDialog(true)}
          >
            Создать первую заявку
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper>
              <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                {tickets.map((ticket) => (
                  <ListItem
                    key={ticket.id}
                    component="button" // Changed from button={true} to component="button"
                    selected={selectedTicket?.id === ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    divider
                  >
                    <ListItemText
                      primary={ticket.subject}
                      secondary={`Создано: ${new Date(ticket.created_at).toLocaleDateString()}`}
                      primaryTypographyProps={{
                        noWrap: true
                      }}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={ticket.status}
                        color={
                          ticket.status === 'OPEN' ? 'error' :
                          ticket.status === 'IN_PROGRESS' ? 'warning' : 'success'
                        }
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            {selectedTicket ? (
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" gutterBottom>
                  {selectedTicket.subject}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Chip
                    label={selectedTicket.status}
                    color={
                      selectedTicket.status === 'OPEN' ? 'error' :
                      selectedTicket.status === 'IN_PROGRESS' ? 'warning' : 'success'
                    }
                  />
                  <Typography variant="body2" color="text.secondary">
                    Создано: {new Date(selectedTicket.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2 }}>{selectedTicket.username?.[0]}</Avatar>
                      <Typography variant="subtitle1">
                        {selectedTicket.username}
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {selectedTicket.message}
                    </Typography>
                  </CardContent>
                </Card>
                
                {loadingReplies ? (
                  <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', my: 2 }} />
                ) : (
                  <>
                    {replies.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Ответы
                        </Typography>
                        
                        {replies.map((reply) => (
                          <Card key={reply.id} sx={{ mb: 2 }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar sx={{ mr: 2 }}>{reply.username?.[0]}</Avatar>
                                <Box>
                                  <Typography variant="subtitle1">
                                    {reply.username}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(reply.created_at).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              </Box>
                              <Typography variant="body1">
                                {reply.message}
                              </Typography>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    )}
                    
                    {selectedTicket.status !== 'CLOSED' && (
                      <Box component="form" onSubmit={handleReplySubmit}>
                        <Typography variant="h6" gutterBottom>
                          Добавить ответ
                        </Typography>
                        
                        <TextField
                          label="Ваш ответ"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          fullWidth
                          multiline
                          rows={3}
                          margin="normal"
                          required
                        />
                        
                        <Button 
                          type="submit" 
                          variant="contained" 
                          color="primary"
                          sx={{ mt: 1 }}
                          disabled={!replyText.trim()}
                        >
                          Отправить ответ
                        </Button>
                      </Box>
                    )}
                  </>
                )}
              </Paper>
            ) : (
              <Paper sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Выберите заявку для просмотра деталей
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}
      
      {/* Create Ticket Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Создать новую заявку в поддержку</DialogTitle>
        <DialogContent>
          <TextField
            name="subject"
            label="Тема"
            value={ticketForm.subject}
            onChange={handleTicketFormChange}
            fullWidth
            margin="normal"
            required
          />
          
          <TextField
            name="message"
            label="Сообщение"
            value={ticketForm.message}
            onChange={handleTicketFormChange}
            fullWidth
            multiline
            rows={6}
            margin="normal"
            required
            placeholder="Опишите вашу проблему подробно..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Отмена</Button>
          <Button 
            onClick={handleCreateTicket}
            color="primary"
            disabled={!ticketForm.subject || !ticketForm.message}
          >
            Отправить заявку
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

export default SupportTickets;
