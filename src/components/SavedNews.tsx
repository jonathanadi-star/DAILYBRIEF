import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

export default function SavedNews() {
  const [savedArticles, setSavedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSavedNews();
  }, []);

  // Fungsi untuk menarik data dari Firestore khusus milik user yang sedang login
  const fetchSavedNews = async () => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, "saved_news"), 
        where("userId", "==", auth.currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const articles: any[] = [];
      querySnapshot.forEach((doc) => {
        // Menyimpan ID dokumen Firestore agar nanti bisa dihapus
        articles.push({ id: doc.id, ...doc.data() }); 
      });
      
      setSavedArticles(articles);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Gagal memuat berita tersimpan.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menghapus berita dari bookmark
  const handleRemoveBookmark = async (docId: string) => {
    try {
      await deleteDoc(doc(db, "saved_news", docId));
      Alert.alert("Sukses", "Berita dihapus dari favorit.");
      // Refresh daftar setelah dihapus
      fetchSavedNews();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Gagal menghapus berita.");
    }
  };

  const renderSavedItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.source}>Disimpan pada: {new Date(item.savedAt).toLocaleDateString('id-ID')}</Text>
        
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => handleRemoveBookmark(item.id)}
        >
          <Text style={styles.deleteButtonText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#007BFF" style={{ marginTop: 20 }} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={savedArticles}
        keyExtractor={(item) => item.id}
        renderItem={renderSavedItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada berita yang disimpan.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#222' },
  description: { fontSize: 14, color: '#555', marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  source: { fontSize: 12, color: '#888', fontStyle: 'italic' },
  deleteButton: { backgroundColor: '#DC3545', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  deleteButtonText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#777' }
});