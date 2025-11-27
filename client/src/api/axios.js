// client/src/api/axios.js
import axios from 'axios';

// Automatically chooses the right URL based on where it's running
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const instance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default instance;