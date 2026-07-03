import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface MobileListingResponseDto {
  id: string;
  name: string;
  city: string;
  monthlyPrice: number;
  status: 'AVAILABLE' | 'FULL' | 'FEW_LEFT' | string;
}

export default function HomeScreen() {
  const [listings, setListings] = useState<MobileListingResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/v1/mobile/listings`);
        if (response.data && response.data.success) {
          setListings(response.data.data || []);
        } else {
          setListings([]);
        }
      } catch (err: any) {
        console.error(err);
        setError('Gagal menyinkronkan data dengan server Yukkos.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#333333" />
        <Text style={styles.loadingText}>Menghubungkan ke database NeonDB...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* 1. Header Profil */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.avatarRow} 
            onPress={() => router.push('/auth/login')}
          >
            <Image 
              source={{ uri: 'https://picsum.photos/id/64/100/100' }} 
              style={styles.avatarImage} 
            />
            <View>
              <Text style={styles.greetingText}>Halo,</Text>
              <Text style={styles.profileName}>Faza</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 2. Search Bar & Filter Button */}
        <View style={styles.searchContainer}>
          <TouchableOpacity 
            style={styles.searchBar} 
            onPress={() => router.push('/explore')} // Mengarahkan ke tab explore
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput 
              placeholder="Cari Kost" 
              placeholderTextColor="#888888"
              style={styles.searchInput}
              editable={false} // Supaya tidak memunculkan keyboard di home, melainkan berpindah page
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterIcon}>🎛️</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Banner Promo (Horizontal Scroll) */}
        <View style={styles.promoSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={300} decelerationRate="fast">
            <View style={styles.promoCard}>
              <Image source={{ uri: 'https://picsum.photos/id/10/400/200' }} style={styles.promoImage} />
              <View style={styles.promoOverlay}>
                <Text style={styles.promoTitle}>Kost yang Lagi Promo</Text>
                <Text style={styles.promoSubtitle}>Lorem ipsum dolor sit amet</Text>
              </View>
            </View>
            <View style={styles.promoCard}>
              <Image source={{ uri: 'https://picsum.photos/id/12/400/200' }} style={styles.promoImage} />
              <View style={styles.promoOverlay}>
                <Text style={styles.promoTitle}>Diskon Awal Bulan 🎉</Text>
                <Text style={styles.promoSubtitle}>Dapatkan potongan harga menarik</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* 4. Section Kost Terdekat */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kost Terdekat</Text>
          <Text style={styles.locationSub}>📍 Cari Lokasi</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScrollGap}>
            {/* Dummy Card untuk Layouting */}
            {['Kost A', 'Kost B', 'Kost C'].map((dummy, idx) => (
              <View key={idx} style={styles.cardVertical}>
                <Image source={{ uri: `https://picsum.photos/id/${idx + 20}/150/150` }} style={styles.verticalCardImage} />
                <View style={styles.verticalCardBody}>
                  <Text style={styles.verticalKostName}>{dummy}</Text>
                  <Text style={styles.verticalKostLocation}>Semarang</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 5. Section Rekomendasi (Koneksi Database NeonDB) */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Rekomendasi</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : listings.length === 0 ? (
            <Text style={styles.emptyText}>Tidak ada data kos tersedia saat ini.</Text>
          ) : (
            listings.map((item) => (
              <View key={item.id} style={styles.cardWide}>
                <View style={styles.imagePlaceholder}>
                  <Image source={{ uri: 'https://picsum.photos/id/43/150/150' }} style={styles.kostImageWide} />
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: item.status === 'AVAILABLE' ? '#2ECC71' : '#E74C3C' }
                  ]}>
                    <Text style={styles.statusText}>
                      {item.status === 'AVAILABLE' ? 'Tersedia' : 'Penuh'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <View>
                    <Text style={styles.kostName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.kostLocation}>
                      📍 {item.city}
                    </Text>
                  </View>
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.kostPrice}>
                      Rp {item.monthlyPrice.toLocaleString('id-ID')}
                      <Text style={styles.pricePeriod}> / bln</Text>
                    </Text>
                    <Text style={styles.kostRating}>⭐ 5.0</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* 6. Banner Daftar Pemilik Kost */}
        <View style={styles.ownerBannerContainer}>
          <View style={styles.ownerBanner}>
            <Text style={styles.ownerTitle}>Daftar Pemilik Kost</Text>
            <Text style={styles.ownerSubtitle}>Lorem ipsum dolor sit amet, consectetur adipiscing elit</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  loadingText: { marginTop: 10, color: '#666666', fontWeight: '500' },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10, backgroundColor: '#F8F9FA' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarImage: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#CCCCCC' },
  greetingText: { fontSize: 14, color: '#888888' },
  profileName: { fontSize: 16, fontWeight: '700', color: '#333333' },
  
  // Search Styles
  searchContainer: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 20, gap: 12, alignItems: 'center' },
  searchBar: { flex: 1, flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 12, height: 46, alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEA' },
  searchIcon: { marginRight: 8, fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: '#333333' },
  filterButton: { width: 46, height: 46, backgroundColor: '#FFFFFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEA' },
  filterIcon: { fontSize: 18 },

  // Promo Styles
  promoSection: { paddingLeft: 24, marginBottom: 25 },
  promoCard: { width: 310, height: 140, borderRadius: 16, overflow: 'hidden', marginRight: 16, position: 'relative', backgroundColor: '#DDDDDD' },
  promoImage: { width: '100%', height: '100%' },
  promoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(0,0,0,0.35)' },
  promoTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  promoSubtitle: { color: '#E0E0E0', fontSize: 11, marginTop: 2 },

  // Section Global
  section: { paddingHorizontal: 24, marginBottom: 24 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#222222' },
  seeAllText: { fontSize: 13, color: '#666666', fontWeight: '600', textDecorationLine: 'underline' },
  locationSub: { fontSize: 12, color: '#888888', marginTop: 5, marginBottom: 16 },
  horizontalScrollGap: { gap: 14 },

  // Vertical Card Styles
  cardVertical: { width: 110, backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#EAEAEA' },
  verticalCardImage: { width: '100%', height: 95, backgroundColor: '#E0E0E0' },
  verticalCardBody: { padding: 8 },
  verticalKostName: { fontSize: 13, fontWeight: 'bold', color: '#333333' },
  verticalKostLocation: { fontSize: 11, color: '#888888', marginTop: 2 },

  // Wide Card Styles (Rekomendasi)
  cardWide: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#EAEAEA', elevation: 2, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  imagePlaceholder: { width: 90, height: 90, backgroundColor: '#E0E0E0', borderRadius: 12, position: 'relative', overflow: 'hidden' },
  kostImageWide: { width: '100%', height: '100%' },
  statusBadge: { position: 'absolute', top: 6, left: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 9, color: '#FFFFFF', fontWeight: 'bold' },
  cardBody: { flex: 1, marginLeft: 16, justifyContent: 'space-between', paddingVertical: 2 },
  kostName: { fontSize: 16, fontWeight: '700', color: '#333333', marginBottom: 4 },
  kostLocation: { fontSize: 13, color: '#666666' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kostPrice: { fontSize: 14, color: '#333333', fontWeight: '700' },
  pricePeriod: { fontSize: 11, color: '#888888', fontWeight: '400' },
  kostRating: { fontSize: 13, color: '#FFB400', fontWeight: '600' },
  
  // Owner Banner Styles
  ownerBannerContainer: { paddingHorizontal: 24, marginBottom: 30 },
  ownerBanner: { backgroundColor: '#E0E0E0', borderRadius: 16, padding: 20, alignItems: 'flex-start' },
  ownerTitle: { fontSize: 15, fontWeight: 'bold', color: '#333333', marginBottom: 4 },
  ownerSubtitle: { fontSize: 12, color: '#666666', lineHeight: 16 },

  // Perbaikan typo fontStyle di sini
  emptyText: { color: '#999999', fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
  errorText: { color: '#E74C3C', fontStyle: 'italic', textAlign: 'center', marginTop: 20 }
});