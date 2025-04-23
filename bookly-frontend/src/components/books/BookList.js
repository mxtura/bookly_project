import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Box, FormControl, InputLabel,
  Select, MenuItem, Pagination, CircularProgress, TextField
} from '@mui/material';
import { getBooks, getGenres } from '../../services/api';
import BookCard from './BookCard'; // Import the new BookCard component

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
        // Create properly formatted params for the API
        const params = {};
        
        // Only add search parameter if it's not empty
        if (search.trim()) {
          params.search = search.trim();
        }
        
        // Add pagination
        params.page = pagination.page;
        
        // Add sorting
        if (filters.sort) {
          params.ordering = filters.sort;
        }
        
        // Only use a single genre parameter (simpler and less error-prone)
        if (filters.genre) {
          params.genre = filters.genre;
        }
        
        console.log('Fetching books with params:', params);
        
        try {
          const response = await getBooks(params);
          console.log('BookList received response:', response);
          
          // Extract books safely with fallbacks
          const responseData = response?.data || {};
          let filteredBooks = responseData.results || responseData || [];
          
          // Client-side genre filtering if needed
          if (filters.genre && Array.isArray(filteredBooks) && filteredBooks.length > 0) {
            // Only filter if API didn't filter already
            filteredBooks = filteredBooks.filter(book => {
              // Handle different formats of genre data
              const bookGenres = book.genres || [];
              return bookGenres.some(g => {
                // Handle genre as object or string
                return (g.name === filters.genre) || (g === filters.genre);
              });
            });
          }
          
          console.log('Books after filtering:', filteredBooks);
          setBooks(filteredBooks);
          
          // Handle pagination data
          if (responseData.count !== undefined) {
            setPagination(prevPagination => ({
              ...prevPagination,
              totalPages: Math.max(1, Math.ceil(responseData.count / 10))
            }));
          }
        } catch (error) {
          console.error('Error fetching books:', error);
          setBooks([]);
        }
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    // Add a delay to prevent too many API calls during typing
    const timeoutId = setTimeout(() => {
      fetchBooks();
    }, 300);
    
    return () => clearTimeout(timeoutId);
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
        Каталог книг
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <TextField
          label="Поиск книг"
          variant="outlined"
          fullWidth
          value={search}
          onChange={handleSearchChange}
          placeholder="Поиск по названию, автору или ISBN"
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Жанр</InputLabel>
          <Select
            name="genre"
            value={filters.genre}
            onChange={handleFilterChange}
            label="Жанр"
          >
            <MenuItem value="">Все жанры</MenuItem>
            {genres.map((genre) => (
              <MenuItem key={genre.id} value={genre.name}>
                {genre.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Сортировать по</InputLabel>
          <Select
            name="sort"
            value={filters.sort}
            onChange={handleFilterChange}
            label="Сортировать по"
          >
            <MenuItem value="title">Название (А-Я)</MenuItem>
            <MenuItem value="-title">Название (Я-А)</MenuItem>
            <MenuItem value="author">Автор (А-Я)</MenuItem>
            <MenuItem value="-author">Автор (Я-А)</MenuItem>
            <MenuItem value="publication_date">Дата публикации (старые-новые)</MenuItem>
            <MenuItem value="-publication_date">Дата публикации (новые-старые)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : books.length === 0 ? (
        <Typography variant="h6" align="center" sx={{ my: 4 }}>
          Книги, соответствующие вашим критериям, не найдены
        </Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {books.map((book) => (
              <Grid 
                item 
                key={book.id} 
                xs={12} 
                sm={6} 
                md={4} 
                lg={3}
              >
                <BookCard 
                  book={book}
                />
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