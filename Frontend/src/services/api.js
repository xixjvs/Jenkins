import axios from 'axios';

const api = axios.create({
<<<<<<< HEAD
  baseURL: 'http://127.0.0.1:44277/api/', 
=======
  baseURL: 'http://192.168.49.2:30099/api/', 
>>>>>>> 4b8b6fd (pushdc)
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // if (error.response && error.response.status === 401) {
    //   localStorage.removeItem('token');
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);

export default api;
