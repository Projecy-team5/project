import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'https://localhost:7048/api', // change to your backend URL
});

api.interceptors.response.use(
  response => response,
  error => {
    const msg = error.response?.data || error.message || 'Something went wrong';
    toast.error(msg);
    if (error.response?.status === 401) {
      // Token expired or unauthorized
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const get = (url) => api.get(url).then(res => res.data);
export const post = (url, data) => api.post(url, data).then(res => res.data);
export const put = (url, data) => api.put(url, data).then(res => res.data);
export const del = (url) => api.delete(url).then(res => res.data);

export default api;