import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/api';
import { Container, Typography, TextField, Button, Paper, Box, Alert } from '@mui/material';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name
      };
      
      await register(userData);
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.data) {
        // Format error messages from the API
        const errorMessages = Object.entries(error.response.data)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        setError(errorMessages);
      } else {
        setError('Registration failed. Please try again.');
      }
      console.error('Registration error:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Регистрация в Bookly
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            name="username"
            label="Имя пользователя"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.username}
            onChange={handleChange}
            required
          />
          
          <TextField
            name="email"
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <TextField
            name="first_name"
            label="Имя"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.first_name}
            onChange={handleChange}
          />
          
          <TextField
            name="last_name"
            label="Фамилия"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.last_name}
            onChange={handleChange}
          />
          
          <TextField
            name="password"
            label="Пароль"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          <TextField
            name="confirmPassword"
            label="Подтвердите пароль"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            size="large"
            sx={{ mt: 3 }}
          >
            Зарегистрироваться
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Уже есть аккаунт?{' '}
              <Button 
                color="primary" 
                onClick={() => navigate('/login')}
              >
                Войти
              </Button>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
