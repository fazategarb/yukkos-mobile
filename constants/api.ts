import { create } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Ganti dengan IP lokal Wi-Fi komputer Anda agar bisa diakses oleh HP fisik/emulator
// Contoh: 'http://192.168.1.50:3000' (Jangan pakai localhost jika test di HP fisik)
export const API_URL = 'http://192.168.1.7:3000'; 

const api = create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Otomatis selipkan Token JWT ke Header jika User sudah Login
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('user_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;