import apiClient from './apiClient';

// ✅ Create Show
export const createShow = async (showData) => {
  const response = await apiClient.post('/shows/create', showData);
  return response.data;
};

// ✅ Get All Shows
export const getShows = async () => {
  const response = await apiClient.get('/shows');
  return response.data;
};

// ✅ Cancel Show (Soft Delete)
export const cancelShow = async (id) => {
  const response = await apiClient.put(`/shows/cancel/${id}`);
  return response.data;
};

// ✅ Update Show  ⭐ ADD THIS
export const updateShow = async (id, showData) => {
  const response = await apiClient.put(`/shows/${id}`, showData);
  return response.data;
};
