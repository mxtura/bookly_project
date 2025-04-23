import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container, Typography, Grid, Paper, Box, Button, Chip, Divider,
  TextField, Rating, Card, CardContent, Avatar, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem
} from '@mui/material';
import {
  getBook, getBookReviews, createReview, getExchangeOffers,
  createExchangeOffer, createExchangeRequest
} from '../../services/api';

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({
    title: '',
    content: '',
    rating: 0
  });
  const [offerDialog, setOfferDialog] = useState(false);
  const [offerForm, setOfferForm] = useState({
    condition: 'Like New',
    exchange_type: 'EXCHANGE',
    price: '',
    exchange_preferences: ''
  });
  const [requestDialog, setRequestDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');

  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchBookData = async () => {
      setLoading(true);
      try {
        const bookResponse = await getBook(id);
        console.log("Book data:", bookResponse.data); // Debug to see what's coming from API
        setBook(bookResponse.data);
        
        const reviewsResponse = await getBookReviews(id);
        setReviews(reviewsResponse.data.results || reviewsResponse.data);
        
        const offersResponse = await getExchangeOffers({ book: id });
        setOffers(offersResponse.data.results || offersResponse.data);
      } catch (error) {
        console.error('Error fetching book data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();
  }, [id]);

  const handleReviewChange = (e) => {
    setReviewForm({
      ...reviewForm,
      [e.target.name]: e.target.value
    });
  };

  const handleRatingChange = (event, newValue) => {
    setReviewForm({
      ...reviewForm,
      rating: newValue
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const reviewData = {
        ...reviewForm,
        book: id
      };
      
      await createReview(reviewData);
      
      // Refresh reviews
      const reviewsResponse = await getBookReviews(id);
      setReviews(reviewsResponse.data.results || reviewsResponse.data);
      
      // Reset form
      setReviewForm({
        title: '',
        content: '',
        rating: 0
      });
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const handleOfferChange = (e) => {
    setOfferForm({
      ...offerForm,
      [e.target.name]: e.target.value
    });
  };

  const handleOfferSubmit = async () => {
    try {
      const offerData = {
        ...offerForm,
        book: id
      };
      
      await createExchangeOffer(offerData);
      
      // Refresh offers
      const offersResponse = await getExchangeOffers({ book: id });
      setOffers(offersResponse.data.results || offersResponse.data);
      
      // Close dialog
      setOfferDialog(false);
      
      // Reset form
      setOfferForm({
        condition: 'Like New',
        exchange_type: 'EXCHANGE',
        price: '',
        exchange_preferences: ''
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleRequestSubmit = async () => {
    try {
      const requestData = {
        offer: selectedOffer.id,
        message: requestMessage
      };
      
      await createExchangeRequest(requestData);
      
      // Close dialog
      setRequestDialog(false);
      setRequestMessage('');
      setSelectedOffer(null);
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!book) {
    return (
      <Container>
        <Typography variant="h5" align="center" sx={{ my: 4 }}>
          Книга не найдена
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            <img
              src={book.cover_image || 'https://via.placeholder.com/300x450?text=Нет+обложки'}
              alt={book.title}
              style={{ width: '100%', maxHeight: '450px', objectFit: 'contain' }}
            />
            
            {isAuthenticated && (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  onClick={() => setOfferDialog(true)}
                >
                  Предложить обмен/продажу
                </Button>
              </Box>
            )}
          </Box>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h1" gutterBottom>
            {book.title}
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            автор: {
              book.author_name || // Try author_name first (from serializer's read-only field)
              (book.author && typeof book.author === 'object' ? book.author.name : // Then try object format
              (typeof book.author === 'string' ? book.author : // Then try string format
              "Неизвестный автор")) // Fallback
            }
          </Typography>
          
          {book.average_rating > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={book.average_rating} precision={0.5} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                ({book.average_rating.toFixed(1)})
              </Typography>
            </Box>
          )}
          
          <Box sx={{ mb: 3 }}>
            {book.genres && book.genres.map((genre) => (
              <Chip key={genre.id} label={genre.name} sx={{ mr: 1, mb: 1 }} />
            ))}
          </Box>
          
          <Typography variant="body1" paragraph>
            <strong>ISBN:</strong> {book.isbn || 'Недоступно'}
          </Typography>
          
          {book.publication_date && (
            <Typography variant="body1" paragraph>
              <strong>Дата публикации:</strong> {new Date(book.publication_date).toLocaleDateString()}
            </Typography>
          )}
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Описание
          </Typography>
          
          <Typography variant="body1" paragraph>
            {book.description || 'Описание отсутствует.'}
          </Typography>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h5" gutterBottom>
            Предложения обмена
          </Typography>
          
          {offers.length === 0 ? (
            <Typography variant="body1">
              Нет доступных предложений обмена для этой книги.
            </Typography>
          ) : (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {offers.map((offer) => (
                <Grid item xs={12} key={offer.id}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1">
                      <strong>{offer.owner_username}</strong> предлагает эту книгу для {offer.exchange_type === 'SELL' ? 'продажи' : 'обмена'}
                    </Typography>
                    
                    <Typography variant="body2">
                      <strong>Состояние:</strong> {offer.condition}
                    </Typography>
                    
                    {offer.exchange_type === 'SELL' && offer.price && (
                      <Typography variant="body2">
                        <strong>Цена:</strong> ${offer.price}
                      </Typography>
                    )}
                    
                    {offer.exchange_preferences && (
                      <Typography variant="body2">
                        <strong>Предпочтения по обмену:</strong> {offer.exchange_preferences}
                      </Typography>
                    )}
                    
                    {isAuthenticated && (
                      <Button 
                        variant="contained" 
                        size="small" 
                        sx={{ mt: 1 }}
                        onClick={() => {
                          setSelectedOffer(offer);
                          setRequestDialog(true);
                        }}
                      >
                        Запросить обмен
                      </Button>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h5" gutterBottom>
            Отзывы
          </Typography>
          
          {isAuthenticated && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Написать отзыв
              </Typography>
              
              <form onSubmit={handleReviewSubmit}>
                <TextField
                  name="title"
                  label="Заголовок отзыва"
                  value={reviewForm.title}
                  onChange={handleReviewChange}
                  fullWidth
                  margin="normal"
                  required
                />
                
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Typography component="legend">Рейтинг</Typography>
                  <Rating
                    name="rating"
                    value={reviewForm.rating}
                    onChange={handleRatingChange}
                    precision={1}
                    required
                  />
                </Box>
                
                <TextField
                  name="content"
                  label="Отзыв"
                  value={reviewForm.content}
                  onChange={handleReviewChange}
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                  required
                />
                
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                  Отправить отзыв
                </Button>
              </form>
            </Paper>
          )}
          
          {reviews.length === 0 ? (
            <Typography variant="body1">
              Пока нет отзывов. Будьте первым, кто оставит отзыв об этой книге!
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {reviews.map((review) => (
                <Grid item xs={12} key={review.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ mr: 2 }}>{review.username[0]}</Avatar>
                        <Box>
                          <Typography variant="subtitle1">
                            {review.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(review.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box sx={{ ml: 'auto' }}>
                          <Rating value={review.rating} readOnly size="small" />
                        </Box>
                      </Box>
                      
                      <Typography variant="h6" gutterBottom>
                        {review.title}
                      </Typography>
                      
                      <Typography variant="body2">
                        {review.content}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          
          <Box sx={{ mt: 4 }}>
            <Button component={Link} to="/discussions" variant="outlined">
              Посмотреть обсуждения
            </Button>
          </Box>
        </Grid>
      </Grid>
      
      {/* Offer Dialog */}
      <Dialog open={offerDialog} onClose={() => setOfferDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Предложить книгу для обмена/продажи</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Состояние</InputLabel>
            <Select
              name="condition"
              value={offerForm.condition}
              onChange={handleOfferChange}
              label="Состояние"
            >
              <MenuItem value="Like New">Как новая</MenuItem>
              <MenuItem value="Very Good">Очень хорошее</MenuItem>
              <MenuItem value="Good">Хорошее</MenuItem>
              <MenuItem value="Acceptable">Приемлемое</MenuItem>
              <MenuItem value="Poor">Плохое</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Тип обмена</InputLabel>
            <Select
              name="exchange_type"
              value={offerForm.exchange_type}
              onChange={handleOfferChange}
              label="Тип обмена"
            >
              <MenuItem value="EXCHANGE">Обмен</MenuItem>
              <MenuItem value="SELL">Продажа</MenuItem>
            </Select>
          </FormControl>
          
          {offerForm.exchange_type === 'SELL' && (
            <TextField
              name="price"
              label="Цена"
              type="number"
              value={offerForm.price}
              onChange={handleOfferChange}
              fullWidth
              margin="normal"
              inputProps={{ min: 0, step: 0.01 }}
            />
          )}
          
          <TextField
            name="exchange_preferences"
            label="Предпочтения по обмену или дополнительные примечания"
            value={offerForm.exchange_preferences}
            onChange={handleOfferChange}
            fullWidth
            multiline
            rows={3}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOfferDialog(false)}>Отмена</Button>
          <Button onClick={handleOfferSubmit} color="primary" variant="contained">
            Создать предложение
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Request Dialog */}
      <Dialog open={requestDialog} onClose={() => setRequestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Запрос на обмен/покупку</DialogTitle>
        <DialogContent>
          {selectedOffer && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Вы запрашиваете {selectedOffer.exchange_type === 'SELL' ? 'покупку' : 'обмен'} книги "{book.title}" у пользователя {selectedOffer.owner_username}
              </Typography>
              
              <TextField
                label="Сообщение владельцу"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                fullWidth
                multiline
                rows={4}
                margin="normal"
                placeholder="Представьтесь и объясните, почему вы заинтересованы в этой книге..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialog(false)}>Отмена</Button>
          <Button onClick={handleRequestSubmit} color="primary" variant="contained">
            Отправить запрос
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookDetail;
