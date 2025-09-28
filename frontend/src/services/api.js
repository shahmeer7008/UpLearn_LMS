import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'An unknown error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;