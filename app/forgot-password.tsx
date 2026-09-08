import { useState } from 'react';
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
import * as Linking from 'expo-linking';
import { Link } from 'expo-router';

import { useAuth } from '@/lib/auth-context';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const trimmedEmail = email.trim();
    setError(null);
    setSent(false);

    if (!trimmedEmail) {
      setError('Renseigne ton adresse email.');
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(trimmedEmail, getResetRedirectUrl());
    setLoading(false);

    if (error) {
      setError(friendlyError(error));
      return;
    }

    setSent(true);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>JCC ⚽</Text>
        <Text style={styles.title}>Mot de passe oublié</Text>
        <Text style={styles.subtitle}>
          {"Entre ton email et on t'envoie un lien de réinitialisation."}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#555"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        {error && <Text style={styles.error}>{error}</Text>}
        {sent && (
          <Text style={styles.success}>
            Si un compte existe avec cet email, le lien de réinitialisation a été envoyé.
          </Text>
        )}

        <Pressable
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.btnText}>{"Envoyer l'email de réinitialisation"}</Text>
          )}
        </Pressable>

        <Link href="/auth" asChild>
          <Pressable style={styles.backLink}>
            <Text style={styles.backText}>Retour à la connexion</Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

function getResetRedirectUrl() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/reset-password`;
  }

  return Linking.createURL('/reset-password');
}

function friendlyError(msg: string): string {
  if (msg.includes('Unable to validate')) return 'Email invalide.';
  if (msg.includes('rate limit')) return 'Trop de demandes. Réessaie dans quelques minutes.';
  return msg;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  logo: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: '#777',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#ffffff',
    fontSize: 15,
  },
  error: {
    color: '#e05555',
    fontSize: 13,
    textAlign: 'center',
  },
  success: {
    color: '#85D096',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  backText: {
    color: '#aaaaaa',
    fontSize: 13,
    fontWeight: '700',
  },
});
