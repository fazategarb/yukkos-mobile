import axios, { isAxiosError } from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface DetailListingDto {
  id: string;
  name: string;
  city: string;
  fullAddress: string;
  monthlyPrice: number;
  status: 'AVAILABLE' | 'FULL' | 'FEW_LEFT' | string;
  description?: string;
  facilities?: string[];
  mainImage?: string;
}

const getFacilityIcon = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('wifi')) return '📶';
  if (lowerName.includes('ac')) return '❄️';
  if (lowerName.includes('mandi') || lowerName.includes('kamar mandi')) return '🚿';
  if (lowerName.includes('mobil') || lowerName.includes('parkir')) return '🚗';
  return '📌';
};

export default function DetailKostScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [listing, setListing] = useState<DetailListingDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk Modal Booking
  const [bookingModalVisible, setBookingModalVisible] = useState<boolean>(false);
  const [checkInDate, setCheckInDate] = useState<string>('2026-08-01');
  const [durationMonths, setDurationMonths] = useState<string>('1');
  const [isBookingLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetailListing = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/v1/mobile/listings/${id}`);
        if (response.data && response.data.success) {
          setListing(response.data.data);
        } else {
          setError('Data kos tidak ditemukan.');
        }
      } catch (err) {
        console.error('Error fetching detail:', err);
        setError('Gagal memuat detail kos dari database.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetailListing();
    }
  }, [id]);

  // Fungsi untuk mengirim Request Booking ke API Backend
  const handleConfirmBooking = async () => {
  try {
    // 1. Ambil token murni secara real-time dari storage
    let token = await SecureStore.getItemAsync('user_token');
    
    // Sanitasi tanda kutip ganda jika terlanjur masuk format string JSON
    if (token && token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }

    // 2. Susun payload sesuai CreateBookingDto
    const payload = {
      listingId: id, // ID Kos dari parameter route expo-router
      checkInDate: new Date().toISOString(), // Contoh tanggal hari ini format ISO 8601
      durationMonths: 1 // Pastikan bertipe number murni murni
    };

    // 3. Tembak API menggunakan Axios polosan dengan Header manual
    const response = await axios.post(`${API_URL}/v1/tenant/bookings`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Masukkan token manual di sini
      }
    });

    if (response.status === 201) {
      Alert.alert('Sukses', 'Pengajuan sewa berhasil dibuat!');
    }
  } catch (error) {
    console.log("Detail Error:", error);
    if (isAxiosError(error) && error.response) {
      console.log("Response data dari server:", error.response.data);
    }
    Alert.alert('Booking Gagal', 'Periksa log terminal untuk detail error.');
  }
};

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Memuat detail properti...</Text>
      </View>
    );
  }

  if (error || !listing) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Terjadi kesalahan sistem.'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBack}>
          <Text style={styles.navBackIcon}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{listing.name}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image 
          source={{ uri: listing.mainImage || 'https://picsum.photos/id/43/600/400' }} 
          style={styles.coverImage} 
        />

        <View style={styles.infoContainer}>
          <View style={styles.badgeRow}>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: listing.status === 'AVAILABLE' ? '#2ECC71' : listing.status === 'FEW_LEFT' ? '#F39C12' : '#E74C3C' }
            ]}>
              <Text style={styles.statusText}>
                {listing.status === 'AVAILABLE' ? 'Tersedia' : listing.status === 'FEW_LEFT' ? 'Sisa Sedikit' : 'Penuh'}
              </Text>
            </View>
            <Text style={styles.ratingText}>⭐ 5.0 (Review Toko)</Text>
          </View>

          <Text style={styles.kostName}>{listing.name}</Text>
          <Text style={styles.kostLocation}>📍 {listing.fullAddress || `${listing.city}`}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Fasilitas Kamar & Bersama</Text>
          {listing.facilities && listing.facilities.length > 0 ? (
            <View style={styles.facilityGrid}>
              {listing.facilities.map((facilityName, idx) => (
                <View key={idx} style={styles.facilityItem}>
                  <Text style={styles.facilityIcon}>{getFacilityIcon(facilityName)}</Text>
                  <Text style={styles.facilityName}>{facilityName}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyFacilities}>Tidak ada fasilitas spesifik yang terdaftar.</Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Deskripsi Properti</Text>
          <Text style={styles.descriptionText}>
            {listing.description || 'Kos strategis, aman, nyaman, dan dekat dengan fasilitas umum kota.'}
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceLabel}>Harga Sewa</Text>
          <Text style={styles.priceValue}>
            Rp {listing.monthlyPrice.toLocaleString('id-ID')}
            <Text style={styles.pricePeriod}>/bln</Text>
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.bookButton, listing.status === 'FULL' && styles.disabledButton]} 
          disabled={listing.status === 'FULL'}
          onPress={() => setBookingModalVisible(true)}
        >
          <Text style={styles.bookButtonText}>Ajukan Sewa Kos</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Form Input Booking */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={bookingModalVisible}
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Form Pengajuan Sewa</Text>
            
            <Text style={styles.inputLabel}>Tanggal Mulai Masuk (Check-In)</Text>
            <TextInput
              style={styles.textInput}
              value={checkInDate}
              onChangeText={setCheckInDate}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.inputLabel}>Durasi Sewa (Bulan)</Text>
            <TextInput
              style={styles.textInput}
              value={durationMonths}
              onChangeText={setDurationMonths}
              keyboardType="number-pad"
              placeholder="Contoh: 3"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setBookingModalVisible(false)}
                disabled={isBookingLoading}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmBtn} 
                onPress={handleConfirmBooking}
                disabled={isBookingLoading}
              >
                {isBookingLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>Konfirmasi</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 20 },
  loadingText: { marginTop: 10, color: '#666666', fontWeight: '500' },
  errorText: { color: '#E74C3C', fontSize: 15, textAlign: 'center', marginBottom: 15 },
  
  navbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderColor: '#EAEAEA', backgroundColor: '#FFF' },
  navBack: { padding: 8, marginRight: 8 },
  navBackIcon: { fontSize: 18 },
  navTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 },

  coverImage: { width: '100%', height: 250, backgroundColor: '#E0E0E0' },
  infoContainer: { padding: 20 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, color: '#FFFFFF', fontWeight: 'bold' },
  ratingText: { fontSize: 13, color: '#666', fontWeight: '500' },
  kostName: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', marginBottom: 6 },
  kostLocation: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333333', marginBottom: 12 },
  descriptionText: { fontSize: 14, color: '#4B5563', lineHeight: 22 },

  facilityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  facilityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, gap: 6 },
  facilityIcon: { fontSize: 16 },
  facilityName: { fontSize: 13, color: '#374151', fontWeight: '500' },
  emptyFacilities: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' },

  bottomBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderColor: '#EAEAEA', backgroundColor: '#FFF' },
  priceLabel: { fontSize: 12, color: '#888' },
  priceValue: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  pricePeriod: { fontSize: 12, fontWeight: '400', color: '#666' },
  bookButton: { backgroundColor: '#1E3A8A', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  disabledButton: { backgroundColor: '#9CA3AF' },
  bookButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  backButton: { backgroundColor: '#333', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  backButtonText: { color: '#FFF', fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#4B5563', marginBottom: 6, marginTop: 10 },
  textInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, height: 44, fontSize: 14, color: '#1F2937' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 24 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB' },
  cancelBtnText: { color: '#4B5563', fontWeight: '600' },
  confirmBtn: { backgroundColor: '#1E3A8A', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, minWidth: 100, alignItems: 'center', justifyContent: 'center' },
  confirmBtnText: { color: '#FFF', fontWeight: '600' }
});