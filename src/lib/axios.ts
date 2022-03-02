import axios from 'axios';

export const ajax = axios.create({
  baseURL: '/~'
})

ajax.interceptors.response.use(res => res, error => {
  if (error.response) {
    return Promise.reject(new Error(error.response.data || error.response.statusText));
  }
  return Promise.reject(error);
})