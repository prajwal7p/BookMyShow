import apiClient from './apiClient';

export const createShow = (data) =>
  apiClient.post('/shows/create', data);

export const getShows = () =>
  apiClient.get('/shows');

export const cancelShow = (id) =>
  apiClient.put(`/shows/cancel/${id}`);

export const createBooking = (data) =>
  apiClient.post('/bookings/create', data);

export const checkSeatAvailability = (showId) =>
  apiClient.get(`/bookings/availability/${showId}`);

export const getMyBookings = (userId) =>
  apiClient.get(`/bookings/user/${userId}`);

export const cancelBooking = (id) =>
  apiClient.put(`/bookings/cancel/${id}`);

export const updateShow = (id, data) =>
  apiClient.put(`/shows/${id}`, data);
