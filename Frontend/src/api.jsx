
import axios from "axios";
const axiosInstance = axios.create({
<<<<<<< HEAD
    baseURL: " http://127.0.0.1:44277/api/",
=======
    baseURL: " http://192.168.49.2:30099/api/",
>>>>>>> 4b8b6fd (pushdc)
});

export const UseAxios = () => {
  const token = localStorage.getItem("token"); 
  console.log(token);
  axiosInstance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return{ axiosInstance}
};
