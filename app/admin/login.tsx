import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { adminApiUrl } from '@/lib/admin-api';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = window.sessionStorage.getItem('adminToken');
      if (token) router.replace('/admin');
    }
    // Run once on admin login mount to reuse an existing session token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogin() {
    const pwd = password.trim();
    if (!pwd) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(adminApiUrl('/api/admin/auth'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });

      let data: { ok?: boolean; error?: string };
      try {
        data = await res.json();
      } catch {
        setError(`Route introuvable (HTTP ${res.status}) — vérifier le déploiement Vercel`);
        return;
      }

      if (res.ok && data.ok) {
        window.sessionStorage.setItem('adminToken', pwd);
        router.replace('/admin');
      } else {
        setError(data.error ?? `Erreur HTTP ${res.status}`);
      }
    } catch (err) {
      setError(`Erreur réseau : ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>ADMIN</Text>
        <Text style={styles.subtitle}>JCC FOOTBALL</Text>

        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor="#555"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={handleLogin}
          autoFocus
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.button, (loading || pressed) && styles.buttonDim]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator size="small" color="#000" />
            : <Text style={styles.buttonText}>Accéder</Text>
          }
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 420,
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 42,
    borderWidth: 1,
    borderColor: '#222',
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
  },
  subtitle: {
    color: '#333',
    fontSize: 15,
    letterSpacing: 3,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 36,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 15,
    color: '#fff',
    fontSize: 19,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 14,
  },
  error: {
    color: '#e05c5c',
    fontSize: 17,
    marginBottom: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonDim: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
