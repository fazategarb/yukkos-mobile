import { isAxiosError } from 'axios'; // Gunakan named export sesuai standar ESLint kita sebelumnya
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../constants/api'; // Pastikan path ke api.ts sudah benar

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validasi Kolom Kosong
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Validasi Gagal', 'Semua kolom pendaftaran wajib diisi!');
      return;
    }

    // Validasi Format Email Sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Validasi Gagal', 'Format email tidak valid!');
      return;
    }

    // Validasi minLength: 6 Sesuai RegisterUserDto
    if (password.length < 6) {
      Alert.alert('Validasi Gagal', 'Password minimal harus terdiri dari 6 karakter!');
      return;
    }

    setLoading(true);
    try {
      // Mengirimkan payload sesuai RegisterUserDto, dengan default role TENANT
      const response = await api.post('/v1/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: 'TENANT', // Mengunci role untuk aplikasi mobile pencari kos
      });

      if (response.status === 201 || response.status === 200) {
        Alert.alert('Sukses', 'Akun Yukkos Anda berhasil dibuat! Silakan masuk.');
        router.replace('/auth/login');
      }
    } catch (error) {
      console.log(error);
      if (isAxiosError(error) && error.response) {
        // Menangkap error handling bawaan NestJS class-validator jika ada yang lolos
        const errorMessage = error.response.data.message || 'Gagal mendaftarkan akun.';
        Alert.alert('Pendaftaran Gagal', Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
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
        <Text style={styles.title}>Buat Akun Baru</Text>
        <Text style={styles.subtitle}>Bergabunglah bersama ribuan pencari kos lainnya</Text>

        <Text style={styles.label}>Nama Lengkap</Text>
        <View style={styles.inputContainer}>
          <TextInput 
            placeholder="Nama lengkap Anda" 
            placeholderTextColor="#888888"
            style={styles.inputField}
            value={name}
            onChangeText={setName}
          />
        </View>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputContainer}>
          <TextInput 
            placeholder="Alamat email aktif" 
            placeholderTextColor="#888888"
            style={styles.inputField}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputContainer}>
          <TextInput 
            placeholder="Buat password minimal 6 karakter" 
            placeholderTextColor="#888888"
            style={styles.inputField}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Daftar</Text>}
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Sudah memiliki akun? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>Masuk</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

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