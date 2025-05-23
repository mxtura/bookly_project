import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Paper, Box, TextField, Button,
  Avatar, CircularProgress, Divider, Snackbar, Alert
} from '@mui/material';
import { getUserProfile, updateUserProfile } from '../../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    birth_date: null
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile();
        setProfile(response.data);
        
        // If the user has a profile, populate the form
        if (response.data.profile) {
          setFormData({
            full_name: response.data.profile.full_name || '',
            birth_date: response.data.profile.birth_date ? response.data.profile.birth_date : null
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setNotification({
          open: true,
          message: 'Не удалось загрузить данные профиля',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Helper function to format date for input field
  const formatDateForInput = (date) => {
    if (!date) return '';
    return date.split('T')[0]; // Format YYYY-MM-DD from ISO string
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Format the data for the API
      const profileData = {
        ...formData,
        id: profile?.profile ? profile.profile.id : null,
        birth_date: formData.birth_date
      };
      
      await updateUserProfile(profileData);
      
      setNotification({
        open: true,
        message: 'Профиль успешно обновлен',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({
        open: true,
        message: 'Не удалось обновить профиль',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Add this check to handle the case where profile is null
  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Не удалось загрузить профиль пользователя. Пожалуйста, попробуйте войти снова.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Мой профиль
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              alt={profile.username || 'User'}
              src={profile.profile?.profile_picture || ''}
            >
              {profile.username ? profile.username[0].toUpperCase() : 'U'}
            </Avatar>
            
            <Typography variant="h6" gutterBottom>
              {profile.username || 'Имя пользователя недоступно'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {profile.email || 'Email недоступен'}
            </Typography>
            
            <Button variant="outlined" size="small" sx={{ mt: 1 }}>
              Изменить аватар
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Личная информация
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                name="full_name"
                label="Полное имя"
                value={formData.full_name}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              
              <TextField
                name="birth_date"
                label="Дата рождения"
                type="date"
                value={formatDateForInput(formData.birth_date)}
                onChange={handleChange}
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                disabled={saving}
              >
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Настройки аккаунта
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Button variant="outlined" color="primary" fullWidth sx={{ mb: 1 }}>
                Изменить пароль
              </Button>
              
              <Button variant="outlined" color="secondary" fullWidth>
                Настройки конфиденциальности
              </Button>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Опасная зона
            </Typography>
            
            <Button variant="outlined" color="error">
              Удалить аккаунт
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;
