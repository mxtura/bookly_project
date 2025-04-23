import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container, Typography, Paper, Box, Button, Avatar, Divider,
  TextField, CircularProgress, Card, CardContent, IconButton,
  Snackbar, Alert
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import {
  getDiscussions, getComments, createComment, likeComment, unlikeComment
} from '../../services/api';

// Вспомогательная функция для безопасного отображения книг
export const formatBookForDisplay = (book) => {
  if (!book) return "Выберите книгу";
  if (typeof book === 'string') return book;
  return book.title || "Книга без названия";
};

const DiscussionDetail = () => {
  const { id } = useParams();
  const [discussion, setDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchDiscussionData = async () => {
      setLoading(true);
      try {
        // Fetch discussion details
        const discussionResponse = await getDiscussions();
        const foundDiscussion = (discussionResponse.data.results || discussionResponse.data)
          .find(d => d.id === parseInt(id));
        
        if (foundDiscussion) {
          setDiscussion(foundDiscussion);
          
          // Fetch comments for this discussion
          const commentsResponse = await getComments(id);
          setComments(commentsResponse.data.results || commentsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching discussion data:', error);
        setNotification({
          open: true,
          message: 'Не удалось загрузить данные обсуждения',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussionData();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    try {
      const commentData = {
        discussion: id,
        content: commentText
      };
      
      await createComment(commentData);
      
      // Refresh comments
      const commentsResponse = await getComments(id);
      setComments(commentsResponse.data.results || commentsResponse.data);
      
      // Clear input
      setCommentText('');
      
      setNotification({
        open: true,
        message: 'Комментарий успешно добавлен',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      setNotification({
        open: true,
        message: 'Не удалось добавить комментарий',
        severity: 'error'
      });
    }
  };

  const handleLikeComment = async (commentId, isLiked) => {
    if (!isAuthenticated) return;
    
    try {
      if (isLiked) {
        await unlikeComment(commentId);
      } else {
        await likeComment(commentId);
      }
      
      // Refresh comments
      const commentsResponse = await getComments(id);
      setComments(commentsResponse.data.results || commentsResponse.data);
    } catch (error) {
      console.error('Error liking/unliking comment:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!discussion) {
    return (
      <Container>
        <Typography variant="h5" align="center" sx={{ my: 4 }}>
          Обсуждение не найдено
        </Typography>
        <Button 
          component={Link} 
          to="/discussions"
          startIcon={<ArrowBackIcon />}
          sx={{ display: 'block', mx: 'auto' }}
        >
          Назад к обсуждениям
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button 
        component={Link} 
        to="/discussions"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Назад к обсуждениям
      </Button>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {discussion.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ mr: 2 }}>{discussion.creator_username?.[0]}</Avatar>
          <Box>
            <Typography variant="subtitle1">
              {discussion.creator_username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Опубликовано {new Date(discussion.created_at).toLocaleDateString()}
            </Typography>
          </Box>
          
          {discussion.book && (
            <Button 
              component={Link}
              to={`/books/${discussion.book}`}
              variant="outlined"
              size="small"
              sx={{ ml: 'auto' }}
            >
              Смотреть книгу: {discussion.book_title}
            </Button>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
          {discussion.content}
        </Typography>
      </Paper>
      
      <Typography variant="h5" gutterBottom>
        Комментарии ({comments.length})
      </Typography>
      
      {isAuthenticated && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Добавить комментарий
          </Typography>
          
          <Box component="form" onSubmit={handleCommentSubmit}>
            <TextField
              label="Ваш комментарий"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              fullWidth
              multiline
              rows={3}
              margin="normal"
              required
            />
            
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              sx={{ mt: 1 }}
              disabled={!commentText.trim()}
            >
              Отправить комментарий
            </Button>
          </Box>
        </Paper>
      )}
      
      {comments.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            Комментариев пока нет. Будьте первым!
          </Typography>
        </Paper>
      ) : (
        comments.map((comment) => (
          <Card key={comment.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2 }}>{comment.username?.[0]}</Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {comment.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {comment.likes_count || 0}
                  </Typography>
                  <IconButton 
                    size="small"
                    color="primary"
                    onClick={() => handleLikeComment(comment.id, false)}
                    disabled={!isAuthenticated}
                  >
                    <ThumbUpIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              
              <Typography variant="body1">
                {comment.content}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DiscussionDetail;
