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

export default function ExploreScreen() {
  const router = useRouter();
  const [listings, setListings] = useState<MobileListingResponseDto[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/v1/mobile/listings`);
        if (response.data && response.data.success) {
          setListings(response.data.data || []);
        }
      } catch (err: any) {
        console.error(err);
        setError('Gagal memuat data pencarian.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Memfilter kos secara langsung (client-side) berdasarkan apa yang diketik pengguna
  const filteredListings = listings.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Bagian Peta Statis (Simulasi ArcGIS Platform) */}
      <View style={styles.mapContainer}>
        <Image 
          source={{ uri: 'https://picsum.photos/id/173/600/400' }} 
          style={styles.mapPlaceholder} 
        />
        
        {/* Search Bar Melayang di Atas Peta */}
        <View style={styles.floatingSearchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput 
              placeholder="Cari wilayah atau nama kost..." 
              placeholderTextColor="#888888"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Bagian Hasil Pencarian / Daftar Kos */}
      <View style={styles.listContainer}>
        <Text style={styles.resultTitle}>
          {searchQuery ? `Hasil untuk "${searchQuery}"` : 'Rekomendasi Terdekat'}
        </Text>

        {loading ? (
          <ActivityIndicator size="small" color="#333333" style={{ marginTop: 20 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : filteredListings.length === 0 ? (
          <Text style={styles.emptyText}>Kost tidak ditemukan. Coba kata kunci lain.</Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {filteredListings.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.cardWide}
                onPress={() => router.push(`/detail/${item.id}`)} // Alur ke langkah kedua nanti
              >
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
                    <Text style={styles.kostLocation}>📍 {item.city}</Text>
                  </View>
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.kostPrice}>
                      Rp {item.monthlyPrice.toLocaleString('id-ID')}
                      <Text style={styles.pricePeriod}> / bln</Text>
                    </Text>
                    <Text style={styles.kostRating}>⭐ 5.0</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  mapContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
    backgroundColor: '#E0E0E0'
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%'
  },
  floatingSearchContainer: {
    position: 'absolute',
    top: 16,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  searchBar: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    height: 46, 
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  searchIcon: { marginRight: 8, fontSize: 16 },
  clearIcon: { marginLeft: 8, fontSize: 16, color: '#999999', padding: 4 },
  searchInput: { flex: 1, fontSize: 14, color: '#333333' },
  
  listContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
    marginBottom: 16
  },
  cardWide: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#EAEAEA' },
  imagePlaceholder: { width: 80, height: 80, backgroundColor: '#E0E0E0', borderRadius: 12, position: 'relative', overflow: 'hidden' },
  kostImageWide: { width: '100%', height: '100%' },
  statusBadge: { position: 'absolute', top: 4, left: 4, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  statusText: { fontSize: 8, color: '#FFFFFF', fontWeight: 'bold' },
  cardBody: { flex: 1, marginLeft: 16, justifyContent: 'space-between', paddingVertical: 2 },
  kostName: { fontSize: 15, fontWeight: '700', color: '#333333' },
  kostLocation: { fontSize: 12, color: '#666666' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kostPrice: { fontSize: 13, color: '#333333', fontWeight: '700' },
  pricePeriod: { fontSize: 10, color: '#888888' },
  kostRating: { fontSize: 12, color: '#FFB400', fontWeight: '600' },
  emptyText: { color: '#999999', textAlign: 'center', marginTop: 30, fontStyle: 'italic' },
  errorText: { color: '#E74C3C', textAlign: 'center', marginTop: 20 }
});