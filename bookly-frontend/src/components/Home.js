import React from 'react';
import { Typography, Container, Box, Button, Grid, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Добро пожаловать в Bookly
        </Typography>
        
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          Ваша платформа для обмена книгами, открытия новых произведений и общения с любителями книг
        </Typography>
        
        <Box sx={{ mt: 4, mb: 6, display: 'flex', justifyContent: 'center' }}>
          <Button component={Link} to="/books" variant="contained" color="primary" sx={{ mx: 1 }}>
            Посмотреть книги
          </Button>
          <Button component={Link} to="/register" variant="outlined" color="primary" sx={{ mx: 1 }}>
            Присоединиться
          </Button>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Делитесь и обменивайтесь
              </Typography>
              <Typography>
                Размещайте книги, которыми вы готовы обменяться или продать. Свяжитесь с теми, у кого есть книги, которые вы хотите.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Создайте свою библиотеку
              </Typography>
              <Typography>
                Организуйте ваши книги на виртуальных полках. Отслеживайте, что вы прочитали, что хотите прочитать и многое другое.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Участвуйте в обсуждениях
              </Typography>
              <Typography>
                Участвуйте в обсуждениях книг, пишите рецензии и получайте персонализированные рекомендации.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;
