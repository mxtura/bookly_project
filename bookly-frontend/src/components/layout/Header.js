import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ isAuthenticated, setIsAuthenticated, isAdmin }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Container>
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
            }}
          >
            BOOKLY
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex' } }}>
            <Button component={Link} to="/books" color="inherit">Книги</Button>
            <Button component={Link} to="/discussions" color="inherit">Обсуждения</Button>
            
            {isAuthenticated && (
              <>
                <Button component={Link} to="/bookshelves" color="inherit">Мои полки</Button>
                <Button component={Link} to="/exchange/offers" color="inherit">Обмен</Button>
              </>
            )}
          </Box>

          <Box sx={{ display: { xs: 'flex' } }}>
            {isAuthenticated ? (
              <>
                <Button component={Link} to="/profile" color="inherit">Профиль</Button>
                {isAdmin && (
                  <Button component={Link} to="/admin" color="inherit">Админ</Button>
                )}
                <Button component={Link} to="/support" color="inherit">Поддержка</Button>
                <Button color="inherit" onClick={handleLogout}>Выйти</Button>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" color="inherit">Войти</Button>
                <Button component={Link} to="/register" color="inherit">Регистрация</Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
