import apiClient from './apiClient';

export const getAllTheatres = (city = '') =>
    apiClient.get('/theatres', { params: city ? { city } : {} });

export const getTheatreById = (id) =>
    apiClient.get(`/theatres/${id}`);

export const createTheatre = (data) =>
    apiClient.post('/theatres', data);

export const updateTheatre = (id, data) =>
    apiClient.put(`/theatres/${id}`, data);

export const deleteTheatre = (id) =>
    apiClient.delete(`/theatres/${id}`);

// Screens
export const getScreensByTheatre = (theatreId) =>
    apiClient.get(`/theatres/${theatreId}/screens`);

export const addScreenToTheatre = (theatreId, data) =>
    apiClient.post(`/theatres/${theatreId}/screens`, data);

export const deleteScreen = (screenId) =>
    apiClient.delete(`/theatres/screens/${screenId}`);

// Seats
export const getSeatsByScreen = (screenId) =>
    apiClient.get(`/theatres/screens/${screenId}/seats`);

export const addSeats = (screenId, seats) =>
    apiClient.post(`/theatres/screens/${screenId}/seats`, { seats });

export const deleteAllSeats = (screenId) =>
    apiClient.delete(`/theatres/screens/${screenId}/seats`);
