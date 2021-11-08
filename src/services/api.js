import axios from 'axios';
import Config from './config';

const api = axios.create({
    baseURL: Config().apiURL
});

export default api;