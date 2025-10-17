import axios from 'axios';



export const api = axios.create({
    baseURL: 'http://localhost:4000', // Altere para a URL correta da sua API
    timeout: 1000,
});