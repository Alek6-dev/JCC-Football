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

export default function AuthScreen() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Remplis tous les champs.');
      return;
    }
    if (password.length < 6) {
      setError('Mot de passe : 6 caractères minimum.');
      return;
    }

    setLoading(true);
    const { error } = mode === 'login'
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password);
    setLoading(false);

    if (error) {
      setError(friendlyError(error));
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    const { error } = await signInWithGoogle(getAuthRedirectUrl());
    setGoogleLoading(false);

    if (error) {
      setError(friendlyError(error));
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>

        <Text style={styles.logo}>JCC ⚽</Text>
        <Text style={styles.tagline}>Football Card Collection</Text>

        <View style={styles.toggle}>
          <Pressable
            style={[styles.toggleBtn, mode === 'login' && styles.toggleActive]}
            onPress={() => { setMode('login'); setError(null); }}
          >
            <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>
              Connexion
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, mode === 'signup' && styles.toggleActive]}
            onPress={() => { setMode('signup'); setError(null); }}
          >
            <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>
              Inscription
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.googleBtn, googleLoading && styles.btnDisabled]}
          onPress={handleGoogleSignIn}
          disabled={googleLoading || loading}
        >
          {googleLoading ? (
            <ActivityIndicator color="#111" />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continuer avec Google</Text>
            </>
          )}
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

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
        <View style={styles.passwordRow}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Mot de passe"
            placeholderTextColor="#555"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
          <Pressable onPress={() => setShowPassword(p => !p)} style={styles.eyeBtn}>
            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
          </Pressable>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading || googleLoading}
        >
          {loading
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.btnText}>
                {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
              </Text>
          }
        </Pressable>

        {mode === 'login' && (
          <Link href="/forgot-password" asChild>
            <Pressable style={styles.forgotLink}>
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </Pressable>
          </Link>
        )}

        <Text style={[styles.hint, { opacity: mode === 'signup' ? 1 : 0 }]}>
          Un email de confirmation te sera envoyé.
        </Text>

      </View>
    </KeyboardAvoidingView>
  );
}

function getAuthRedirectUrl() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }

  return Linking.createURL('/');
}

function friendlyError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Email ou mot de passe incorrect.';
  if (msg.includes('Email not confirmed')) return 'Confirme ton email avant de te connecter.';
  if (msg.includes('User already registered')) return 'Un compte existe déjà avec cet email.';
  if (msg.includes('Password should be')) return 'Mot de passe trop court (6 caractères min).';
  if (msg.includes('Unable to validate')) return 'Email invalide.';
  if (msg.includes('provider is not enabled')) return 'La connexion Google doit être activée dans Supabase.';
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
  tagline: {
    color: '#444',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 32,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 4,
    marginBottom: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#ffffff',
  },
  toggleText: {
    color: '#555',
    fontWeight: '700',
    fontSize: 13,
  },
  toggleTextActive: {
    color: '#000000',
  },
  googleBtn: {
    minHeight: 50,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#111',
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 22,
    textAlign: 'center',
  },
  googleText: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '800',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#222',
  },
  dividerText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#ffffff',
    fontSize: 15,
  },
  eyeBtn: {
    paddingHorizontal: 14,
  },
  eyeIcon: {
    fontSize: 16,
  },
  error: {
    color: '#e05555',
    fontSize: 13,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
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
    fontSize: 15,
    letterSpacing: 0.5,
  },
  forgotLink: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  forgotText: {
    color: '#aaaaaa',
    fontSize: 13,
    fontWeight: '700',
  },
  hint: {
    color: '#444',
    fontSize: 12,
    textAlign: 'center',
  },
});
