import axios from 'axios';



export const api = axios.create({
    baseURL: 'http://localhost:4000', // Altere para a URL correta da sua API
    timeout: 1000,
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token'); // Supondo que o token JWT esteja armazenado no localStorage
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});