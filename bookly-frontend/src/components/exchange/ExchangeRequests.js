import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Paper, Box, Button, Chip,
  Tabs, Tab, Card, CardContent, CircularProgress, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Snackbar, Alert
} from '@mui/material';
import { getExchangeRequests, updateExchangeRequest } from '../../services/api';

const ExchangeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseDialog, setResponseDialog] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseAction, setResponseAction] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await getExchangeRequests();
      setRequests(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setNotification({
        open: true,
        message: 'Failed to load exchange requests',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRequestResponse = async () => {
    try {
      await updateExchangeRequest(selectedRequest.id, {
        status: responseAction,
        message: responseMessage
      });
      
      fetchRequests();
      setResponseDialog(false);
      setResponseMessage('');
      
      setNotification({
        open: true,
        message: `Request ${responseAction.toLowerCase()} successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating request:', error);
      setNotification({
        open: true,
        message: 'Failed to update request',
        severity: 'error'
      });
    }
  };

  // Filter requests based on tab
  const filteredRequests = (() => {
    // Incoming requests (for my offers)
    if (tabValue === 0) {
      return requests.filter(req => req.offer && req.requester !== req.offer.owner);
    }
    // Outgoing requests (my requests for others' offers)
    return requests.filter(req => req.requester === req.offer?.owner);
  })();

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
        Exchange Requests
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab label="Incoming Requests" />
          <Tab label="My Requests" />
        </Tabs>
      </Paper>
      
      {filteredRequests.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No {tabValue === 0 ? 'incoming' : 'outgoing'} requests found
          </Typography>
          <Typography variant="body1">
            {tabValue === 0 
              ? "When someone requests one of your books, it will appear here."
              : "When you request books from others, your requests will appear here."}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredRequests.map((request) => (
            <Grid item key={request.id} xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {request.book_title}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={request.status} 
                      color={
                        request.status === 'PENDING' ? 'default' :
                        request.status === 'ACCEPTED' ? 'success' :
                        request.status === 'COMPLETED' ? 'info' : 'error'
                      }
                      size="small"
                      sx={{ mr: 1 }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>{tabValue === 0 ? 'From:' : 'To:'}</strong> {
                      tabValue === 0 ? request.requester_username : request.offer?.owner_username
                    }
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Created:</strong> {new Date(request.created_at).toLocaleDateString()}
                  </Typography>
                  
                  {request.message && (
                    <Paper variant="outlined" sx={{ p: 2, mt: 2, mb: 2, bgcolor: 'background.default' }}>
                      <Typography variant="body2">{request.message}</Typography>
                    </Paper>
                  )}
                  
                  {tabValue === 0 && request.status === 'PENDING' && (
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        variant="contained" 
                        color="success" 
                        sx={{ mr: 1 }}
                        onClick={() => {
                          setSelectedRequest(request);
                          setResponseAction('ACCEPTED');
                          setResponseDialog(true);
                        }}
                      >
                        Accept
                      </Button>
                      <Button 
                        variant="contained" 
                        color="error"
                        onClick={() => {
                          setSelectedRequest(request);
                          setResponseAction('REJECTED');
                          setResponseDialog(true);
                        }}
                      >
                        Reject
                      </Button>
                    </Box>
                  )}
                  
                  {request.status === 'ACCEPTED' && (
                    <Button 
                      variant="contained" 
                      color="primary"
                      sx={{ mt: 2 }}
                      onClick={() => {
                        setSelectedRequest(request);
                        setResponseAction('COMPLETED');
                        setResponseDialog(true);
                      }}
                    >
                      Mark as Completed
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Response Dialog */}
      <Dialog open={responseDialog} onClose={() => setResponseDialog(false)}>
        <DialogTitle>
          {responseAction === 'ACCEPTED' ? 'Accept Request' : 
           responseAction === 'REJECTED' ? 'Reject Request' : 'Complete Exchange'}
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            {responseAction === 'ACCEPTED' 
              ? 'You are accepting the exchange request. You can leave a message to the requester:'
              : responseAction === 'REJECTED'
              ? 'You are rejecting the exchange request. You can provide a reason:'
              : 'You are marking this exchange as completed. Add any final notes:'}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            fullWidth
            multiline
            rows={4}
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleRequestResponse} 
            color={
              responseAction === 'ACCEPTED' ? 'success' : 
              responseAction === 'REJECTED' ? 'error' : 'primary'
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

export default ExchangeRequests;
