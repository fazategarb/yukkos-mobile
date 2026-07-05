import { Stack, useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  
  const segments = useSegments();
  const router = useRouter();

  // 1. Fungsi untuk mengecek token (tetap sama)
  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('user_token');
      setUserToken(token);
    } catch (error) {
      console.log('Error membaca token:', error);
      setUserToken(null);
    } finally {
      setIsInitializing(false);
    }
  };

  // Supaya setiap kali rute berpindah (dari /auth/login ke /(tabs)), layout akan membaca ulang SecureStore
  useEffect(() => {
    checkAuthStatus();
  }, [segments]); 

  // 2. Logic Guard (tetap sama, pastikan dependency lengkap)
  useEffect(() => {
    if (isInitializing) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!userToken && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (userToken && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [userToken, segments, isInitializing, router]);

  // Tampilkan Loading Spinner saat aplikasi sedang membaca token di awal buka
  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Cukup deklarasikan rute (tabs) agar navigasi bawahnya tetap terstruktur dengan baik */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}