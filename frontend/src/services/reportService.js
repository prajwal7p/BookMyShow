import apiClient from './apiClient';

/* ---------- Notification Endpoints ---------- */
export const getNotifications = (userId) =>
    apiClient.get(`/reports/notifications/${userId}`);

export const markAsRead = (notifId) =>
    apiClient.put(`/reports/notifications/${notifId}/read`);

export const deleteNotification = (notifId) =>
    apiClient.delete(`/reports/notifications/${notifId}`);

/* ---------- Report Endpoints (Admin Only) ---------- */
export const getRevenueReport = (params = {}) =>
    apiClient.get('/reports/revenue', { params });

export const getOccupancyReport = () =>
    apiClient.get('/reports/occupancy');

export const getBookingReport = (params = {}) =>
    apiClient.get('/reports/bookings', { params });
