import axios from 'axios';

const GNEWS_API_KEY = 'bb773074e28ccc12419557d4bb92ac01'; 
const BASE_URL = 'https://gnews.io/api/v4';

// ==========================================
// FITUR 1: Menampilkan Berita Utama (Headline)
// Tambahkan parameter 'page' dengan default 1
// ==========================================
export const getTopHeadlines = async (page: number = 1) => {
  try {
    const response = await axios.get(`${BASE_URL}/top-headlines`, {
      params: {
        category: 'general',
        lang: 'id',
        country: 'id',
        max: 10,       // Tetap 10 per request agar ringan
        page: page,    // Parameter halaman baru
        apikey: GNEWS_API_KEY 
      }
    });
    return response.data.articles; 
  } catch (error) {
    console.error("Error fetching top headlines:", error);
    throw error;
  }
};

// ==========================================
// FITUR 2: Pencarian Berita (Search by Keyword)
// Tambahkan parameter 'page' dengan default 1
// ==========================================
export const searchNews = async (searchQuery: string, page: number = 1) => {
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        q: searchQuery,
        lang: 'id',
        country: 'id',
        max: 10,
        page: page,    // Parameter halaman baru
        apikey: GNEWS_API_KEY 
      }
    });
    return response.data.articles; 
  } catch (error) {
    console.error(`Error searching news for keyword "${searchQuery}":`, error);
    throw error;
  }
};