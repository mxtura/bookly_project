import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Typography, Grid, Paper, Box, Button, Chip,
  Card, CardContent, CardMedia, CardActions, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert
} from '@mui/material';
import { getExchangeOffers, deleteExchangeOffer } from '../../services/api';

const ExchangeOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await getExchangeOffers();
      setOffers(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setNotification({
        open: true,
        message: 'Не удалось загрузить предложения обмена',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffer = async () => {
    try {
      await deleteExchangeOffer(selectedOffer.id);
      fetchOffers();
      setDeleteDialog(false);
      setNotification({
        open: true,
        message: 'Предложение успешно удалено',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting offer:', error);
      setNotification({
        open: true,
        message: 'Не удалось удалить предложение',
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
          Мои предложения обмена
        </Typography>
        
        <Button 
          component={Link}
          to="/exchange/requests"
          variant="contained" 
          color="primary"
        >
          Просмотр запросов на обмен
        </Button>
      </Box>
      
      {offers.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            У вас еще нет предложений обмена
          </Typography>
          <Typography variant="body1" paragraph>
            Посетите страницу книги, чтобы создать предложение обмена или продажи.
          </Typography>
          <Button 
            component={Link}
            to="/books"
            variant="contained"
          >
            Просмотр книг
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {offers.map((offer) => (
            <Grid item key={offer.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image="https://via.placeholder.com/300x150?text=Book+Exchange"
                  alt="Book Exchange"
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {offer.book_title}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={offer.exchange_type === 'SELL' ? 'Продается' : 'Для обмена'} 
                      color={offer.exchange_type === 'SELL' ? 'secondary' : 'primary'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={offer.status} 
                      color={
                        offer.status === 'PENDING' ? 'default' :
                        offer.status === 'ACCEPTED' ? 'success' :
                        offer.status === 'COMPLETED' ? 'info' : 'error'
                      }
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Состояние:</strong> {offer.condition}
                  </Typography>
                  
                  {offer.exchange_type === 'SELL' && offer.price && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      <strong>Цена:</strong> ${offer.price}
                    </Typography>
                  )}
                  
                  {offer.exchange_preferences && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      <strong>Предпочтения обмена:</strong> {offer.exchange_preferences}
                    </Typography>
                  )}
                  
                  <Typography variant="body2" color="text.secondary">
                    <strong>Создано:</strong> {new Date(offer.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    component={Link} 
                    to={`/books/${offer.book}`}
                  >
                    Посмотреть книгу
                  </Button>
                  <Button 
                    size="small" 
                    color="error"
                    onClick={() => {
                      setSelectedOffer(offer);
                      setDeleteDialog(true);
                    }}
                  >
                    Удалить предложение
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Удалить предложение обмена</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить свое предложение обмена для "{selectedOffer?.book_title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Отмена</Button>
          <Button onClick={handleDeleteOffer} color="error">Удалить</Button>
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

export default ExchangeOffers;
