import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, Typography, Grid, Card, CardContent, CardMedia, 
  CardActionArea, TextField, Box, FormControl, InputLabel,
  Select, MenuItem, Pagination, CircularProgress
} from '@mui/material';
import { getBooks, getGenres } from '../../services/api';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    genre: '',
    sort: 'title'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1
  });

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await getGenres();
        setGenres(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params = {
          search: search,
          page: pagination.page,
          ordering: filters.sort
        };
        
        if (filters.genre) {
          params.genres__name = filters.genre;
        }
        
        const response = await getBooks(params);
        setBooks(response.data.results || response.data);
        
        if (response.data.count) {
          setPagination(prevPagination => ({
            ...prevPagination,
            totalPages: Math.ceil(response.data.count / 10)
          }));
        }
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [search, filters, pagination.page]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (event, value) => {
    setPagination({ ...pagination, page: value });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Books Catalog
      </Typography>
      
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <TextField
          label="Search Books"
          variant="outlined"
          fullWidth
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by title, author, or ISBN"
        />
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Genre</InputLabel>
          <Select
            name="genre"
            value={filters.genre}
            onChange={handleFilterChange}
            label="Genre"
          >
            <MenuItem value="">All Genres</MenuItem>
            {genres.map((genre) => (
              <MenuItem key={genre.id} value={genre.name}>
                {genre.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            name="sort"
            value={filters.sort}
            onChange={handleFilterChange}
            label="Sort By"
          >
            <MenuItem value="title">Title (A-Z)</MenuItem>
            <MenuItem value="-title">Title (Z-A)</MenuItem>
            <MenuItem value="author">Author (A-Z)</MenuItem>
            <MenuItem value="-author">Author (Z-A)</MenuItem>
            <MenuItem value="publication_date">Publication Date (Old-New)</MenuItem>
            <MenuItem value="-publication_date">Publication Date (New-Old)</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : books.length === 0 ? (
        <Typography variant="h6" align="center" sx={{ my: 4 }}>
          No books found matching your criteria
        </Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {books.map((book) => (
              <Grid item key={book.id} xs={12} sm={6} md={4} lg={3}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea component={Link} to={`/books/${book.id}`}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={book.cover_image || 'https://via.placeholder.com/150x200?text=No+Cover'}
                      alt={book.title}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div" noWrap>
                        {book.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        by {book.author}
                      </Typography>
                      {book.average_rating > 0 && (
                        <Typography variant="body2" color="text.secondary">
                          Rating: {book.average_rating.toFixed(1)} / 5
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default BookList;
