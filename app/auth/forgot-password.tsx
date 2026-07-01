import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleReset = () => {
    Alert.alert('Sukses', 'Instruksi reset password telah dikirim ke email Anda.');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.authBlock}>
        <Text style={styles.title}>Lupa Password?</Text>
        <Text style={styles.subtitle}>Masukkan email terdaftar Anda untuk menerima link pemulihan</Text>

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

        <TouchableOpacity style={[styles.primaryButton, { marginTop: 30 }]} onPress={handleReset}>
          <Text style={styles.buttonText}>Kirim Instruksi</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ alignItems: 'center', marginTop: 24 }} onPress={() => router.back()}>
          <Text style={styles.linkText}>Kembali ke Halaman Masuk</Text>
        </TouchableOpacity>
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