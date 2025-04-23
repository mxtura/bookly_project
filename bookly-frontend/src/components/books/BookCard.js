import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card, CardContent, CardMedia, CardActionArea, Typography, Box, IconButton
} from '@mui/material';

/**
 * Reusable BookCard component for displaying book information
 * 
 * @param {Object} book - The book object to display
 * @param {Function} onRemove - Optional callback for removal action
 * @param {String} actionIcon - Optional icon component for action button
 * @param {Object} cardProps - Additional props for the Card component
 * @param {Object} mediaProps - Additional props for the CardMedia component
 */
const BookCard = ({ 
  book, 
  onRemove = null, 
  actionIcon = null,
  cardProps = {},
  mediaProps = {} 
}) => {
  // Handle different author data formats
  const getAuthorName = () => {
    return book.author_name || 
          (book.author && typeof book.author === 'object' ? book.author.name : 
          (typeof book.author === 'string' ? book.author : 
          "Неизвестный автор"));
  };

  const coverWidth = 180; // Standard width for book covers

  return (
    <Box sx={{ 
      position: 'relative', // Add a positioning context wrapper
      width: coverWidth,
      maxWidth: '100%',
      ...cardProps.wrapperSx
    }}>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          transition: 'transform 0.2s',
          width: '100%', // Use 100% of parent width
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: 3
          },
          ...cardProps.sx
        }}
        {...cardProps}
      >
        <CardActionArea 
          component={Link} 
          to={`/books/${book.id}`}
          sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch'
          }}
        >
          <Box sx={{ 
            height: 250, 
            width: coverWidth, // Ensure box width matches cover width
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...mediaProps.boxSx
          }}>
            <CardMedia
              component="img"
              sx={{
                height: '100%',
                width: '100%',
                objectFit: 'contain',
                ...mediaProps.sx
              }}
              image={book.cover_image || 'https://via.placeholder.com/150x200?text=Нет+обложки'}
              alt={book.title}
              {...mediaProps}
            />
          </Box>
          <CardContent sx={{ 
            flexGrow: 1, 
            width: '100%', 
            padding: 1.5,
            '&:last-child': { paddingBottom: 1.5 } 
          }}>
            <Typography 
              gutterBottom 
              variant="h6" 
              component="div"
              sx={{ 
                fontSize: '1rem',
                lineHeight: 1.3,
                height: 'auto',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2, // Allow up to 2 lines
                WebkitBoxOrient: 'vertical',
              }}
            >
              {book.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              автор: {getAuthorName()}
            </Typography>
            
            {book.average_rating > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                  Рейтинг:
                </Typography>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                  {book.average_rating.toFixed(1)} / 5
                </Typography>
              </Box>
            )}
          </CardContent>
        </CardActionArea>
      </Card>
      
      {onRemove && actionIcon && (
        <IconButton
          size="small"
          color="error"
          sx={{ 
            position: 'absolute', 
            top: 5, 
            right: 5, 
            zIndex: 100, // Ensure high z-index
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.95)',
            }
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(book.id);
          }}
        >
          {actionIcon}
        </IconButton>
      )}
    </Box>
  );
};

export default BookCard;
