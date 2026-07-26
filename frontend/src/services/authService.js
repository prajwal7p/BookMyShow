import apiClient from './apiClient';

export const register = (data) => {
  return apiClient.post('/auth/register', data);
};

export const login = (data) => {
  return apiClient.post('/auth/login', data);
};

export const saveToken = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
