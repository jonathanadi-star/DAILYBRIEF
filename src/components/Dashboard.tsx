import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  ActivityIndicator, StyleSheet, Alert 
} from 'react-native';

import { getTopHeadlines, searchNews } from '../api/newsApi';
import SavedNews from './SavedNews'; // Import komponen baru

export default function Dashboard() {
  // --- STATE MANAGEMENT ---
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // State navigasi tab
  const [activeTab, setActiveTab] = useState<'home' | 'saved'>('home');

  // --- STATE INFINITE SCROLL ---
  const [page, setPage] = useState<number>(1);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);

  useEffect(() => {
    fetchHeadlines();
  }, []);

  const fetchHeadlines = async () => {
    setLoading(true);
    setErrorMsg('');
    setPage(1); // Reset halaman ke 1 setiap kali fungsi ini dipanggil
    setHasMoreData(true);
    try {
      const data = await getTopHeadlines(1); // Tarik halaman 1
      setNews(data);
    } catch (error) {
      setErrorMsg('Gagal memuat berita utama.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      fetchHeadlines(); 
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setPage(1); // Reset halaman ke 1 saat mencari keyword baru
    setHasMoreData(true);
    try {
      const data = await searchNews(searchQuery, 1); // Tarik halaman 1
      setNews(data);
    } catch (error) {
      setErrorMsg(`Gagal mencari berita.`);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI INFINITE SCROLL ---
  const loadMoreNews = async () => {
    // Cegah penarikan data jika sedang proses, data sudah habis, atau sedang di tab tersimpan
    if (isFetchingMore || !hasMoreData || activeTab === 'saved') return;

    setIsFetchingMore(true);
    const nextPage = page + 1;

    try {
      let newData = [];
      if (searchQuery.trim() === '') {
        newData = await getTopHeadlines(nextPage);
      } else {
        newData = await searchNews(searchQuery, nextPage);
      }

      if (newData && newData.length > 0) {
        // Gabungkan berita lama dengan berita baru yang ditarik
        setNews((prevNews) => [...prevNews, ...newData]);
        setPage(nextPage);
      } else {
        // Tandai bahwa tidak ada lagi berita yang bisa ditarik
        setHasMoreData(false);
      }
    } catch (error) {
      console.error("Gagal menarik halaman berikutnya", error);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert("Error", "Gagal melakukan logout.");
    }
  };

  const handleSaveNews = async (article: any) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, "saved_news"), {
        userId: auth.currentUser.uid,
        title: article.title,
        description: article.description,
        source: article.source?.name || 'Unknown',
        url: article.url,
        savedAt: new Date().toISOString()
      });
      Alert.alert("Sukses", "Berita berhasil disimpan ke favorit!");
    } catch (error) {
      Alert.alert("Error", "Gagal menyimpan berita.");
    }
  };

  const renderNewsItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.source}>Sumber: {item.source?.name || 'Unknown'}</Text>
        <TouchableOpacity style={styles.saveButton} onPress={() => handleSaveNews(item)}>
          <Text style={styles.saveButtonText}>Simpan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>DailyBrief</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </View>

      {/* --- MENU NAVIGASI TAB --- */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'home' && styles.activeTab]} 
          onPress={() => setActiveTab('home')}
        >
          <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>Berita Utama</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'saved' && styles.activeTab]} 
          onPress={() => setActiveTab('saved')}
        >
          <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>Tersimpan</Text>
        </TouchableOpacity>
      </View>

      {/* --- KONDISIONAL RENDERING BERDASARKAN TAB --- */}
      {activeTab === 'saved' ? (
        <SavedNews />
      ) : (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Cari berita..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Cari</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
          ) : errorMsg !== '' ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : (
            <FlatList
              data={news}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderNewsItem}
              contentContainerStyle={{ paddingBottom: 20 }}
              
              // --- KONFIGURASI INFINITE SCROLL ---
              onEndReached={loadMoreNews}
              onEndReachedThreshold={0.5} // Panggil loadMoreNews saat scroll tersisa setengah layar dari bawah
              ListFooterComponent={
                isFetchingMore ? (
                  <ActivityIndicator size="small" color="#007BFF" style={{ marginVertical: 20 }} />
                ) : null
              }
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F5F5F5' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  logoutText: { color: 'red', fontWeight: 'bold' },
  
  tabContainer: { flexDirection: 'row', marginBottom: 16, backgroundColor: '#E0E0E0', borderRadius: 8, padding: 4 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  activeTab: { backgroundColor: '#FFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1 },
  tabText: { color: '#666', fontWeight: 'bold' },
  activeTabText: { color: '#007BFF' },
  
  searchContainer: { flexDirection: 'row', marginBottom: 16 },
  searchInput: { flex: 1, height: 40, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CCC', borderRadius: 8, paddingHorizontal: 10, marginRight: 8 },
  searchButton: { backgroundColor: '#007BFF', justifyContent: 'center', paddingHorizontal: 16, borderRadius: 8 },
  searchButtonText: { color: '#FFF', fontWeight: 'bold' },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 8, marginBottom: 12, elevation: 2 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#222' },
  description: { fontSize: 14, color: '#555', marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  source: { fontSize: 12, color: '#888', fontStyle: 'italic' },
  saveButton: { backgroundColor: '#28A745', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  saveButtonText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  loader: { marginTop: 20 },
  errorText: { color: 'red', textAlign: 'center', marginTop: 20 }
});