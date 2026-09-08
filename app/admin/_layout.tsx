import { Stack } from 'expo-router';

// Layout minimaliste — l'auth check est géré dans chaque page (index.tsx / login.tsx)
// via window.sessionStorage pour éviter les boucles de redirect dans le layout.
export default function AdminLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
