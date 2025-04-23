import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import Header from './components/layout/Header';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import BookList from './components/books/BookList';
import BookDetail from './components/books/BookDetail';
import Profile from './components/user/Profile';
import Bookshelves from './components/bookshelves/Bookshelves';
import ExchangeOffers from './components/exchange/ExchangeOffers';
import ExchangeRequests from './components/exchange/ExchangeRequests';
import DiscussionList from './components/discussions/DiscussionList';
import DiscussionDetail from './components/discussions/DiscussionDetail';
import SupportTickets from './components/support/SupportTickets';
import Admin from './components/admin/Admin';

// Fix the import path to use the correct service file
import { getUserProfile } from './services/api';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#e57373',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      
      // Check if the token is valid by making a request to the me endpoint
      getUserProfile()
        .then(response => {
          if (response.data && response.data.is_staff) {
            setIsAdmin(true);
          }
        })
        .catch(error => {
          console.error('Auth validation error:', error);
          // If token is invalid, clear it and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setIsAuthenticated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (loading) {
      return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    if (adminOnly && !isAdmin) {
      return <Navigate to="/" />;
    }
    
    return children;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} isAdmin={isAdmin} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/books" element={<BookList />} />
          <Route path="/books/:id" element={<BookDetail />} />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/bookshelves" element={
            <ProtectedRoute>
              <Bookshelves />
            </ProtectedRoute>
          } />
          
          <Route path="/exchange/offers" element={
            <ProtectedRoute>
              <ExchangeOffers />
            </ProtectedRoute>
          } />
          
          <Route path="/exchange/requests" element={
            <ProtectedRoute>
              <ExchangeRequests />
            </ProtectedRoute>
          } />
          
          <Route path="/discussions" element={<DiscussionList />} />
          <Route path="/discussions/:id" element={<DiscussionDetail />} />
          
          <Route path="/support" element={
            <ProtectedRoute>
              <SupportTickets />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <Admin />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
