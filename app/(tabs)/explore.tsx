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
  mainImage?: string;
}

export default function ExploreScreen() {
  const router = useRouter();
  const [listings, setListings] = useState<MobileListingResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'AVAILABLE' | 'FULL'>('AVAILABLE');
  const [searchQuery, setSearchQuery] = useState<string>(''); // 👈 State untuk query pencarian

  useEffect(() => {
    const fetchAllListings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/v1/mobile/listings`);
        if (response.data && response.data.success) {
          setListings(response.data.data || []);
        } else {
          setListings([]);
        }
      } catch (err) {
        console.error(err);
        setError('Gagal mengambil data dari database NeonDB.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllListings();
  }, []);

  // 👈 Fungsi filtering ganda: Berdasarkan Status Tab DAN Keyword Pencarian
  const filteredListings = listings.filter((item) => {
    // 1. Filter berdasarkan status tab
    const matchesStatus = 
      activeFilter === 'AVAILABLE' ? item.status === 'AVAILABLE' :
      activeFilter === 'FULL' ? item.status === 'FULL' : true;

    // 2. Filter berdasarkan input search (mencari di nama kos atau kota tanpa sensitif huruf besar/kecil)
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Memuat seluruh properti...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Navigasi */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBack}>
          <Text style={styles.navBackIcon}>⬅️</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Semua Properti Kos</Text>
      </View>

      {/* 👈 Komponen Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama kos atau kota (misal: Semarang)..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
            clearButtonMode="while-editing" // Fitur bawaan iOS untuk tombol hapus cepat
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✖️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Komponen Filter Tab Bar */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterTab, activeFilter === 'AVAILABLE' && styles.filterTabActive]}
          onPress={() => setActiveFilter('AVAILABLE')}
        >
          <Text style={[styles.filterTabText, activeFilter === 'AVAILABLE' && styles.filterTabTextActive]}>
            🟢 Tersedia
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterTab, activeFilter === 'ALL' && styles.filterTabActive]}
          onPress={() => setActiveFilter('ALL')}
        >
          <Text style={[styles.filterTabText, activeFilter === 'ALL' && styles.filterTabTextActive]}>
            📂 Semua Kos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterTab, activeFilter === 'FULL' && styles.filterTabActive]}
          onPress={() => setActiveFilter('FULL')}
        >
          <Text style={[styles.filterTabText, activeFilter === 'FULL' && styles.filterTabTextActive]}>
            🔴 Penuh
          </Text>
        </TouchableOpacity>
      </View>

      {/* List Hasil Kos */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : filteredListings.length === 0 ? (
          <Text style={styles.emptyText}>Tidak ada kosan yang cocok dengan pencarian Anda.</Text>
        ) : (
          filteredListings.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.cardWide}
              onPress={() => router.push(`/detail/${item.id}`)}
            >
              <View style={styles.imagePlaceholder}>
                <Image 
                  source={{ uri: item.mainImage || 'https://picsum.photos/id/43/150/150' }} 
                  style={styles.kostImageWide} 
                />
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
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  loadingText: { marginTop: 10, color: '#666666', fontWeight: '500' },
  
  navbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderColor: '#EAEAEA', backgroundColor: '#FFF' },
  navBack: { padding: 8, marginRight: 8 },
  navBackIcon: { fontSize: 18 },
  navTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },

  // Styling Search Section
  searchSection: { backgroundColor: '#FFF', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#E5E7EB' },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1F2937', height: '100%' },
  clearIcon: { fontSize: 12, marginLeft: 8, padding: 4 },

  // Styling Tab Filter
  filterContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#EAEAEA', gap: 8 },
  filterTab: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', backgroundColor: '#F9FAFB' },
  filterTabActive: { backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' },
  filterTabText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  filterTabTextActive: { color: '#FFFFFF' },

  scrollList: { padding: 16 },
  errorText: { color: '#E74C3C', textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
  emptyText: { color: '#9CA3AF', textAlign: 'center', marginTop: 40, fontStyle: 'italic', paddingHorizontal: 20 },

  // Wide Card Styles
  cardWide: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#EAEAEA', elevation: 2 },
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
});