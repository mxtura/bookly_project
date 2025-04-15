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
          Book not found
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
              src={book.cover_image || 'https://via.placeholder.com/300x450?text=No+Cover'}
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
                  Offer for Exchange/Sale
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
            by {book.author}
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
            <strong>ISBN:</strong> {book.isbn || 'Not available'}
          </Typography>
          
          {book.publication_date && (
            <Typography variant="body1" paragraph>
              <strong>Publication Date:</strong> {new Date(book.publication_date).toLocaleDateString()}
            </Typography>
          )}
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Description
          </Typography>
          
          <Typography variant="body1" paragraph>
            {book.description || 'No description available.'}
          </Typography>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h5" gutterBottom>
            Exchange Offers
          </Typography>
          
          {offers.length === 0 ? (
            <Typography variant="body1">
              No exchange offers available for this book.
            </Typography>
          ) : (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {offers.map((offer) => (
                <Grid item xs={12} key={offer.id}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1">
                      <strong>{offer.owner_username}</strong> is offering this book for {offer.exchange_type === 'SELL' ? 'sale' : 'exchange'}
                    </Typography>
                    
                    <Typography variant="body2">
                      <strong>Condition:</strong> {offer.condition}
                    </Typography>
                    
                    {offer.exchange_type === 'SELL' && offer.price && (
                      <Typography variant="body2">
                        <strong>Price:</strong> ${offer.price}
                      </Typography>
                    )}
                    
                    {offer.exchange_preferences && (
                      <Typography variant="body2">
                        <strong>Exchange Preferences:</strong> {offer.exchange_preferences}
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
                        Request Exchange
                      </Button>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h5" gutterBottom>
            Reviews
          </Typography>
          
          {isAuthenticated && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Write a Review
              </Typography>
              
              <form onSubmit={handleReviewSubmit}>
                <TextField
                  name="title"
                  label="Review Title"
                  value={reviewForm.title}
                  onChange={handleReviewChange}
                  fullWidth
                  margin="normal"
                  required
                />
                
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Typography component="legend">Rating</Typography>
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
                  label="Review"
                  value={reviewForm.content}
                  onChange={handleReviewChange}
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                  required
                />
                
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                  Submit Review
                </Button>
              </form>
            </Paper>
          )}
          
          {reviews.length === 0 ? (
            <Typography variant="body1">
              No reviews yet. Be the first to review this book!
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
              View Discussions
            </Button>
          </Box>
        </Grid>
      </Grid>
      
      {/* Offer Dialog */}
      <Dialog open={offerDialog} onClose={() => setOfferDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Offer Book for Exchange/Sale</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Condition</InputLabel>
            <Select
              name="condition"
              value={offerForm.condition}
              onChange={handleOfferChange}
              label="Condition"
            >
              <MenuItem value="Like New">Like New</MenuItem>
              <MenuItem value="Very Good">Very Good</MenuItem>
              <MenuItem value="Good">Good</MenuItem>
              <MenuItem value="Acceptable">Acceptable</MenuItem>
              <MenuItem value="Poor">Poor</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Exchange Type</InputLabel>
            <Select
              name="exchange_type"
              value={offerForm.exchange_type}
              onChange={handleOfferChange}
              label="Exchange Type"
            >
              <MenuItem value="EXCHANGE">Exchange</MenuItem>
              <MenuItem value="SELL">Sell</MenuItem>
            </Select>
          </FormControl>
          
          {offerForm.exchange_type === 'SELL' && (
            <TextField
              name="price"
              label="Price"
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
            label="Exchange Preferences or Additional Notes"
            value={offerForm.exchange_preferences}
            onChange={handleOfferChange}
            fullWidth
            multiline
            rows={3}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOfferDialog(false)}>Cancel</Button>
          <Button onClick={handleOfferSubmit} color="primary" variant="contained">
            Create Offer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Request Dialog */}
      <Dialog open={requestDialog} onClose={() => setRequestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Exchange/Purchase</DialogTitle>
        <DialogContent>
          {selectedOffer && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                You are requesting to {selectedOffer.exchange_type === 'SELL' ? 'purchase' : 'exchange'} "{book.title}" from {selectedOffer.owner_username}
              </Typography>
              
              <TextField
                label="Message to Owner"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                fullWidth
                multiline
                rows={4}
                margin="normal"
                placeholder="Introduce yourself and explain why you're interested in this book..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialog(false)}>Cancel</Button>
          <Button onClick={handleRequestSubmit} color="primary" variant="contained">
            Send Request
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookDetail;
