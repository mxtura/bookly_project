import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar, Box, Toolbar, Typography, Button, IconButton, Container,
  Menu, MenuItem, Avatar, Divider, ListItemIcon
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookIcon from '@mui/icons-material/Book';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import SupportIcon from '@mui/icons-material/Support';

const Header = ({ isAuthenticated, setIsAuthenticated }) => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [userRole, setUserRole] = useState('guest');
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkUserRole = () => {
      if (isAuthenticated) {
        try {
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          console.log('User data from localStorage:', userData);
          
          if (userData && userData.is_staff === true) {
            console.log('User is admin');
            setUserRole('admin');
          } else {
            console.log('User is regular user');
            setUserRole('user');
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
          setUserRole('user');
        }
      } else {
        console.log('User is not authenticated');
        setUserRole('guest');
      }
    };
    
    checkUserRole();
    
    const handleUserLogin = () => {
      console.log('User login event detected');
      checkUserRole();
    };
    
    window.addEventListener('userLogin', handleUserLogin);
    
    return () => {
      window.removeEventListener('userLogin', handleUserLogin);
    };
  }, [isAuthenticated]);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUserRole('guest');
    navigate('/login');
  };

  console.log('Current user role:', userRole, 'Is admin?', userRole === 'admin');

  return (
    <AppBar position="static">
      <Container>
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={RouterLink}
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
            <Button component={RouterLink} to="/books" color="inherit">Книги</Button>
            <Button component={RouterLink} to="/discussions" color="inherit">Обсуждения</Button>
            
            {isAuthenticated && (
              <>
                <Button component={RouterLink} to="/bookshelves" color="inherit">Мои полки</Button>
                <Button component={RouterLink} to="/exchange/offers" color="inherit">Обмен</Button>
              </>
            )}
          </Box>

          <Box sx={{ display: { xs: 'flex' } }}>
            {isAuthenticated ? (
              <>
                <Button component={RouterLink} to="/profile" color="inherit">Профиль</Button>
                
                {userRole === 'admin' && (
                  <Button
                    component={RouterLink}
                    to="/admin"
                    color="inherit"
                    sx={{ 
                      color: 'white',
                      bgcolor: 'error.main',
                      '&:hover': {
                        bgcolor: 'error.dark',
                      }
                    }}
                    startIcon={<DashboardIcon />}
                    onClick={() => {
                      // Debug navigation
                      console.log("Admin button clicked, navigating to /admin");
                      // Force navigation if RouterLink doesn't work
                      navigate('/admin');
                    }}
                  >
                    Админ
                  </Button>
                )}
                
                <Button component={RouterLink} to="/support" color="inherit">Поддержка</Button>
                <Button color="inherit" onClick={handleLogout}>Выйти</Button>
              </>
            ) : (
              <>
                <Button component={RouterLink} to="/login" color="inherit">Войти</Button>
                <Button component={RouterLink} to="/register" color="inherit">Регистрация</Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
