import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[200],
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body1" align="center">
          © {new Date().getFullYear()} Bookly - Online Book Exchange Platform
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          <Link color="inherit" href="/">
            Home
          </Link>{' | '}
          <Link color="inherit" href="/books">
            Books
          </Link>{' | '}
          <Link color="inherit" href="/discussions">
            Discussions
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
