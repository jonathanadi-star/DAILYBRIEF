import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isRegister, setIsRegister] = useState<boolean>(false); // State penentu login / register

  // Fungsi penanganan autentikasi
  const handleAuth = async () => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert('Peringatan', 'Email dan password wajib diisi!');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        // Proses Pendaftaran Akun Baru ke Firebase
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('Sukses', 'Akun Anda berhasil didaftarkan! Silakan masuk.');
        setIsRegister(false);
      } else {
        // Proses Masuk (Sign In) ke Firebase
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error(error);
      let errorMsg = 'Terjadi kesalahan sistem.';
      if (error.code === 'auth/invalid-credential') {
        errorMsg = 'Email atau password salah.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMsg = 'Email tersebut sudah terdaftar.';
      } else if (error.code === 'auth/weak-password') {
        errorMsg = 'Password minimal harus 6 karakter.';
      }
      Alert.alert('Gagal', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>
        {isRegister ? 'Daftar Akun Baru' : 'Masuk ke DailyBrief'}
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Masukkan Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Masukkan Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleAuth}>
          <Text style={styles.buttonText}>{isRegister ? 'DAFTAR' : 'MASUK'}</Text>
        </TouchableOpacity>
      )}

      {/* Tombol switch antara Login dan Register */}
      <TouchableOpacity 
        onPress={() => setIsRegister(!isRegister)} 
        style={styles.switchContainer}
      >
        <Text style={styles.switchText}>
          {isRegister ? 'Sudah punya akun? Masuk di sini' : 'Belum punya akun? Daftar di sini'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007BFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 16,
  },
  switchContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchText: {
    color: '#007BFF',
    fontSize: 14,
    fontWeight: '500',
  },
});