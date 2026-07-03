import { isAxiosError } from 'axios';
import { Stack, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../constants/api'; // Pastikan path mengarah ke file api.ts Anda

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password tidak boleh kosong!');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/v1/auth/login', {
        email: email,
        password: password,
      });

      if (response.data && response.data.success) {
        const token = response.data.data.access_token; // Mengambil dari response.data.data
        const role = response.data.data.role;

        if (token) {
          await SecureStore.setItemAsync('user_token', token);
          
          Alert.alert('Sukses', `Selamat Datang! Anda masuk sebagai ${role}`);
          router.replace('/(tabs)'); // Alihkan ke halaman utama
        } else {
          Alert.alert('Error', 'Format token tidak ditemukan di dalam response data.');
        }
      } else {
        Alert.alert('Error', 'Login gagal berdasarkan respon server.');
      }

    } catch (error) {
      console.log(error);
      if (isAxiosError(error) && error.response) {
        // Ambil pesan error bawaan dari NestJS HttpException
        const errorMessage = error.response.data.message || 'Email atau password salah.';
        Alert.alert('Login Gagal', Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
      } else {
        Alert.alert('Error', 'Tidak dapat terhubung ke server backend.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.authBlock}>
        <Text style={styles.title}>Selamat Datang</Text>
        <Text style={styles.subtitle}>Masuk untuk menjelajahi hunian kos terbaik di Yukkos</Text>

        {/* Input Email */}
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputContainer}>
          <TextInput 
            placeholder="Masukkan email Anda" 
            placeholderTextColor="#888888"
            style={styles.inputField}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Input Password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputContainer}>
          <TextInput 
            placeholder="Masukkan password Anda" 
            placeholderTextColor="#888888"
            style={styles.inputField}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureText}
          />
          <TouchableOpacity onPress={() => setSecureText(!secureText)}>
            <Text style={styles.eyeIcon}>{secureText ? '👁️' : '🔒'}</Text>
          </TouchableOpacity>
        </View>

        {/* Lupa Password */}
        <TouchableOpacity style={styles.forgotAlign} onPress={() => router.push('/auth/forgot-password')}>
          <Text style={styles.forgotText}>Lupa Password?</Text>
        </TouchableOpacity>

        {/* Tombol Masuk */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Masuk</Text>}
        </TouchableOpacity>

        {/* Pindah ke Register */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Belum punya akun? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.linkText}>Daftar Sekarang</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Catatan: Style dishare di bawah agar hemat baris kode
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA', 
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  authBlock: { paddingHorizontal: 28 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#222222', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666666', marginBottom: 32, lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333333', marginBottom: 8, marginTop: 16 },
  inputContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#EAEAEA', 
    height: 48, 
    alignItems: 'center', 
    paddingHorizontal: 16 
  },
  inputField: { flex: 1, fontSize: 14, color: '#333333' },
  eyeIcon: { fontSize: 16, padding: 4 },
  forgotAlign: { alignItems: 'flex-end', marginTop: 12 },
  forgotText: { fontSize: 13, color: '#666666', fontWeight: '500' },
  primaryButton: { 
    backgroundColor: '#333333', 
    borderRadius: 12, 
    height: 48, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 24,
    elevation: 2
  },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontSize: 13, color: '#666666' },
  linkText: { fontSize: 13, color: '#333333', fontWeight: '700', textDecorationLine: 'underline' }
});