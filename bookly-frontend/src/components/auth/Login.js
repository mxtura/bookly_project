import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getUserProfile } from '../../services/api';
import { Container, Typography, TextField, Button, Paper, Box, Alert, CircularProgress } from '@mui/material';

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Step 1: Login to get the token
      const response = await login(username, password);
      const { access, refresh } = response.data;
      
      // Step 2: Save tokens
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Step 3: Get user profile to determine role
      try {
        const userProfileResponse = await getUserProfile();
        const userData = userProfileResponse.data;
        
        // Step 4: Store user role/permissions in localStorage for header to use
        localStorage.setItem('userRole', userData.is_staff ? 'admin' : 'user');
        localStorage.setItem('userData', JSON.stringify({
          username: userData.username,
          id: userData.id,
          email: userData.email,
          is_staff: userData.is_staff
        }));
        
        console.log('User login successful, role:', userData.is_staff ? 'admin' : 'user');
        
      } catch (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Continue with login even if profile fetch fails
      }
      
      // Step 5: Update authentication state and redirect
      setIsAuthenticated(true);
      
      // Step 6: Dispatch a custom event to notify other components (like Header) about login
      window.dispatchEvent(new CustomEvent('userLogin', {
        detail: { isAuthenticated: true }
      }));
      
      // Navigate to homepage
      navigate('/');
      
    } catch (error) {
      setError('Неверное имя пользователя или пароль');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Вход в Bookly
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Имя пользователя"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          
          <TextField
            label="Пароль"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            size="large"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Войти'}
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Нет аккаунта?{' '}
              <Button 
                color="primary" 
                onClick={() => navigate('/register')}
              >
                Зарегистрироваться
              </Button>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
