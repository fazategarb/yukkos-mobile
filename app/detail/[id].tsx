import axios from 'axios';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface MobileListingResponseDto {
  id: string;
  name: string;
  city: string;
  monthlyPrice: number;
  status: 'AVAILABLE' | 'FULL' | string;
}

export default function DetailKostScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [listing, setListing] = useState<MobileListingResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDetailFromGlobalList = async () => {
      try {
        setLoading(true);
        // Memanggil endpoint mobile yang tersedia sesuai docs Swagger
        const response = await axios.get(`${API_URL}/v1/mobile/listings`);
        if (response.data && response.data.success) {
          const allData: MobileListingResponseDto[] = response.data.data || [];
          // Saring secara lokal di client-side menggunakan parameter ID
          const matched = allData.find(item => item.id === id);
          setListing(matched || null);
        }
      } catch (err) {
        console.error('Gagal menyaring detail kos:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetailFromGlobalList();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#333333" />
        <Text style={styles.loadingText}>Memuat detail hunian...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Menghilangkan header hitam bawaan expo router agar tidak bertumpuk */}
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* 2. Gambar Utama & Tombol Kembali */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: 'https://picsum.photos/id/43/600/400' }} 
            style={styles.mainImage} 
          />
          <TouchableOpacity style={styles.backFloatingButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>⬅️</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Konten Informasi */}
        <View style={styles.infoContainer}>
          <View style={styles.badgeRow}>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: listing?.status === 'AVAILABLE' ? '#2ECC71' : '#E74C3C' }
            ]}>
              <Text style={styles.statusText}>
                {listing?.status === 'AVAILABLE' ? 'Tersedia' : 'Penuh'}
              </Text>
            </View>
            <Text style={styles.ratingText}>⭐ 5.0 (24 Ulasan)</Text>
          </View>

          <Text style={styles.kostName}>{listing?.name || 'Nama Kost Tidak Ditemukan'}</Text>
          <Text style={styles.kostLocation}>📍 {listing?.city || 'Semarang'}, Jawa Tengah</Text>
          
          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Deskripsi Kost</Text>
          <Text style={styles.descriptionText}>
            Hunian kos modern dan strategis yang dikembangkan untuk kenyamanan mahasiswa maupun karyawan. Berlokasi prima, dekat dengan akses transportasi, area kuliner, serta lingkungan kampus.
          </Text>

          <Text style={styles.sectionTitle}>Fasilitas Kamar</Text>
          <View style={styles.facilitiesGrid}>
            <View style={styles.facilityItem}><Text style={styles.facilityIcon}>🛏️</Text><Text style={styles.facilityLabel}>Kasur</Text></View>
            <View style={styles.facilityItem}><Text style={styles.facilityIcon}>💨</Text><Text style={styles.facilityLabel}>AC</Text></View>
            <View style={styles.facilityItem}><Text style={styles.facilityIcon}>⚡</Text><Text style={styles.facilityLabel}>Free Listrik</Text></View>
            <View style={styles.facilityItem}><Text style={styles.facilityIcon}>🌐</Text><Text style={styles.facilityLabel}>Wi-Fi</Text></View>
          </View>

          <Text style={styles.metadataId}>ID Properti: {id}</Text>
        </View>
      </ScrollView>

      {/* 4. Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.barPriceLabel}>Harga Sewa</Text>
          <Text style={styles.barPrice}>
            Rp {listing ? listing.monthlyPrice.toLocaleString('id-ID') : '0'}
            <Text style={styles.barPeriod}> / bln</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.primaryActionButton}>
          <Text style={styles.actionButtonText}>Hubungi Pemilik</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  loadingText: { marginTop: 12, color: '#666666', fontWeight: '500' },
  imageContainer: { width: '100%', height: 260, position: 'relative' },
  mainImage: { width: '100%', height: '100%' },
  backFloatingButton: { 
    position: 'absolute', 
    top: 16, 
    left: 20, 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255,255,255,0.9)', 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 3
  },
  backIcon: { fontSize: 16 },
  infoContainer: { padding: 24, paddingBottom: 100 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, color: '#FFFFFF', fontWeight: 'bold' },
  ratingText: { fontSize: 13, color: '#666666', fontWeight: '500' },
  kostName: { fontSize: 22, fontWeight: 'bold', color: '#222222', marginBottom: 6 },
  kostLocation: { fontSize: 14, color: '#666666', marginBottom: 16 },
  divider: { height: 1, backgroundColor: '#EAEAEA', marginVertical: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#222222', marginTop: 14, marginBottom: 10 },
  descriptionText: { fontSize: 14, color: '#666666', lineHeight: 22 },
  facilitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  facilityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#EAEAEA', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, gap: 8, minWidth: (width - 64) / 2 },
  facilityIcon: { fontSize: 16 },
  facilityLabel: { fontSize: 13, color: '#555555', fontWeight: '500' },
  metadataId: { fontSize: 10, color: '#CCCCCC', marginTop: 30, fontStyle: 'italic' },
  bottomBar: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 76, 
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderColor: '#EAEAEA', 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 24, elevation: 8
  },
  priceContainer: { justifyContent: 'center' },
  barPriceLabel: { fontSize: 12, color: '#888888' },
  barPrice: { fontSize: 18, fontWeight: 'bold', color: '#222222' },
  barPeriod: { fontSize: 12, color: '#888888' },
  primaryActionButton: { backgroundColor: '#333333', paddingHorizontal: 24, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' }
});