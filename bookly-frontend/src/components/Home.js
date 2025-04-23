import React from 'react';
import { Typography, Container, Box, Button, Grid, Paper, Card, CardMedia, CardContent, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
// Import icons
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ForumIcon from '@mui/icons-material/Forum';
import SearchIcon from '@mui/icons-material/Search';

const Home = () => {
  const theme = useTheme();
  

  return (
    <>
      {/* Hero Section with gradient background */}
      <Box 
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.light} 100%)`,
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: { xs: 0, sm: '0 0 2rem 2rem' },
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ 
              fontWeight: 'bold',
              textShadow: '0px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Добро пожаловать в Bookly
          </Typography>
          
          <Typography 
            variant="h5" 
            align="center" 
            paragraph
            sx={{ 
              maxWidth: '800px', 
              mx: 'auto', 
              mb: 4,
              opacity: 0.9
            }}
          >
            Ваша платформа для обмена книгами, открытия новых произведений и общения с любителями книг
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              component={Link} 
              to="/books" 
              variant="contained" 
              size="large"
              color="secondary"
              startIcon={<SearchIcon />}
              sx={{ 
                px: 4, 
                py: 1.5, 
                fontWeight: 'bold',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
            >
              Найти книги
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            align="center" 
            gutterBottom
            sx={{ 
              mb: 4,
              fontWeight: 'bold',
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 80,
                height: 4,
                backgroundColor: theme.palette.primary.main,
                borderRadius: 2
              }
            }}
          >
            С нами вы можете
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 4, 
                  height: '100%', 
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AutoStoriesIcon 
                    color="primary" 
                    sx={{ fontSize: 40, mr: 2 }} 
                  />
                  <Typography variant="h5" component="h3" fontWeight="bold">
                    Делиться и обмениваться
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  Размещайте книги, которыми вы готовы обменяться или продать. Свяжитесь с теми, у кого есть книги, которые вы хотите в свою коллекцию.
                </Typography>
                <Button 
                  component={Link} 
                  to="/exchange/offers" 
                  variant="text" 
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  Начать обмен
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 4, 
                  height: '100%',
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocalLibraryIcon 
                    sx={{ fontSize: 40, mr: 2, color: 'white' }} 
                  />
                  <Typography variant="h5" component="h3" fontWeight="bold">
                    Создать свою библиотеку
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  Организуйте ваши книги на виртуальных полках. Отслеживайте, что вы прочитали, что хотите прочитать и создайте свою идеальную коллекцию.
                </Typography>
                <Button 
                  component={Link} 
                  to="/bookshelves" 
                  variant="text" 
                  sx={{ 
                    mt: 2,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Мои книжные полки
                </Button>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 4, 
                  height: '100%',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ForumIcon 
                    color="primary" 
                    sx={{ fontSize: 40, mr: 2 }} 
                  />
                  <Typography variant="h5" component="h3" fontWeight="bold">
                    Участвовать в обсуждениях
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  Участвуйте в обсуждениях книг, пишите рецензии и получайте персонализированные рекомендации от сообщества книголюбов.
                </Typography>
                <Button 
                  component={Link} 
                  to="/discussions" 
                  variant="text" 
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  Перейти к обсуждениям
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>


      </Container>
    </>
  );
};

export default Home;
