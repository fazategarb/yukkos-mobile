import { create } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const API_URL = process.env.EXPO_PUBLIC_API_URL; 

const api = create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Otomatis selipkan Token JWT ke Header jika User sudah Login
api.interceptors.request.use(async (config) => {
  let token = await SecureStore.getItemAsync('user_token');
  
  if (token && config.headers) {
    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }
    
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;