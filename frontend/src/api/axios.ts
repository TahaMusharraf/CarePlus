import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — har request mein token add karo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — 401 logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Common API call function
export const apiCall = async <T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  url: string,
  data?: any
): Promise<T> => {
  try {
    const response = await api({ method, url, data });
    return response.data;
  } catch (error: any) {
    const errData = error.response?.data;
    const message = Array.isArray(errData?.message)
      ? errData.message[0]
      : errData?.message || error.message || 'Something went wrong';
    throw new Error(message);
  }
};

export default api;