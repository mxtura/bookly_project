import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    // Don't add authentication token for login, register, and refresh endpoints
    if (config.url === 'token/' || config.url === 'token/refresh/' || 
        (config.url === 'users/' && config.method === 'post')) {
      return config;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication
export const login = (username, password) => api.post('token/', { username, password });
export const refreshToken = (refresh) => api.post('token/refresh/', { refresh });
export const register = (userData) => {
  // Create a separate instance for registration that doesn't include auth headers
  const publicApi = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return publicApi.post('users/', userData);
};

// User profile - updated to fetch from the correct endpoint
export const getUserProfile = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return Promise.reject(new Error('Authentication required'));
  }
  
  return api.get('users/me/');
};

export const updateUserProfile = (profileData) => {
  // First check if profile exists
  if (profileData.id) {
    return api.patch(`profiles/${profileData.id}/`, profileData);
  } else {
    // Create a new profile if it doesn't exist
    return api.post('profiles/', profileData);
  }
};

// Books
export const getBooks = (params) => api.get('books/', { params });
export const getBook = (id) => api.get(`books/${id}/`);
export const searchBooks = (query) => api.get('books/', { params: { search: query } });
export const getGenres = () => api.get('genres/');

// Bookshelves
export const getUserBookshelves = () => api.get('bookshelves/');
export const createBookshelf = (data) => api.post('bookshelves/', data);
export const updateBookshelf = (id, data) => api.patch(`bookshelves/${id}/`, data);
export const deleteBookshelf = (id) => api.delete(`bookshelves/${id}/`);

// Reviews
export const getBookReviews = (bookId) => api.get('reviews/', { params: { book: bookId } });
export const createReview = (data) => api.post('reviews/', data);
export const updateReview = (id, data) => api.patch(`reviews/${id}/`, data);
export const deleteReview = (id) => api.delete(`reviews/${id}/`);

// Exchange
export const getExchangeOffers = (params) => api.get('exchange-offers/', { params });
export const createExchangeOffer = (data) => api.post('exchange-offers/', data);
export const updateExchangeOffer = (id, data) => api.patch(`exchange-offers/${id}/`, data);
export const deleteExchangeOffer = (id) => api.delete(`exchange-offers/${id}/`);

export const getExchangeRequests = () => api.get('exchange-requests/');
export const createExchangeRequest = (data) => api.post('exchange-requests/', data);
export const updateExchangeRequest = (id, data) => api.patch(`exchange-requests/${id}/`, data);

// Discussions
export const getDiscussions = (params) => api.get('discussions/', { params });
export const createDiscussion = (data) => api.post('discussions/', data);
export const getComments = (discussionId) => api.get('comments/', { params: { discussion: discussionId } });
export const createComment = (data) => api.post('comments/', data);
export const likeComment = (id) => api.post(`comments/${id}/like/`);
export const unlikeComment = (id) => api.post(`comments/${id}/unlike/`);

// Support
export const getSupportTickets = () => api.get('support-tickets/');
export const createSupportTicket = (data) => api.post('support-tickets/', data);
export const getTicketReplies = (ticketId) => api.get('ticket-replies/', { params: { ticket: ticketId } });
export const createTicketReply = (data) => api.post('ticket-replies/', data);

export default api;
