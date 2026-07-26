import apiClient from './apiClient';

// ===============================
// GET MOVIES (Search + Pagination)
// ===============================
export const getMovies = async (params = {}) => {
  const response = await apiClient.get('/movies', { params });
  return response.data;
};

// ===============================
// GET SINGLE MOVIE
// ===============================
export const getMovieById = async (id) => {
  const response = await apiClient.get(`/movies/${id}`);
  return response.data;
};

// ===============================
// CREATE MOVIE (Admin)
// ===============================
export const createMovie = async (movieData) => {
  const response = await apiClient.post('/movies', movieData);
  return response.data;
};

// ===============================
// UPDATE MOVIE (Admin)
// ===============================
export const updateMovie = async (id, movieData) => {
  const response = await apiClient.put(`/movies/${id}`, movieData);
  return response.data;
};

// ===============================
// DELETE MOVIE (Soft Delete - Admin)
// ===============================
export const deleteMovie = async (id) => {
  const response = await apiClient.delete(`/movies/${id}`);
  return response.data;
};

// ===============================
// CHECK SHOWS FOR MOVIE
// ===============================
export const getShowsByMovie = async (movieId) => {
  const response = await apiClient.get('/shows', {
    params: { movieId }
  });
  return response.data;
};
