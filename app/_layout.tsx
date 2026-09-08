import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/lib/auth-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const { session, loading, passwordRecovery } = useAuth();
  const colorScheme = useColorScheme();
  // useSegments est stable pendant les transitions de navigation,
  // contrairement à usePathname() qui peut retourner '/' brièvement.
  const segments = useSegments();
  const isAdmin = segments[0] === 'admin';
  const isLogin = segments[0] === 'auth';
  const isForgotPassword = segments[0] === 'forgot-password';
  const isResetPassword = segments[0] === 'reset-password';
  const isPublicAuthRoute = isLogin || isForgotPassword;
  const isAuthRoute = isPublicAuthRoute || isResetPassword;

  // Tant que la session se charge, on ne rend rien (évite le flash)
  if (loading) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="reset-password" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>

      {/* Redirection automatique selon l'état de connexion — ignorée pour /admin */}
      {!isAdmin && passwordRecovery && !isResetPassword && <Redirect href="/reset-password" />}
      {!isAdmin && !session && !isPublicAuthRoute && <Redirect href="/auth" />}
      {!isAdmin && session && !passwordRecovery && isAuthRoute && <Redirect href="/(tabs)" />}

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
