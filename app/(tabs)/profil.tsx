import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/lib/auth-context';

export default function ProfilScreen() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await signOut();
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.email}>{user?.email ?? 'Compte connecté'}</Text>

      <Pressable
        style={[styles.signOutButton, loading && styles.signOutButtonDisabled]}
        onPress={handleSignOut}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.signOutText}>Se déconnecter</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    paddingHorizontal: 32,
    gap: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '900',
  },
  email: {
    color: '#777777',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  signOutButton: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#e05555',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  signOutButtonDisabled: {
    opacity: 0.6,
  },
  signOutText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
