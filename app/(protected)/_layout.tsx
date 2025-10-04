import { AuthContext } from '@/contexts/AuthContext';
import { useFonts } from 'expo-font';
import { Redirect, Stack } from 'expo-router';
import { useContext } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function ProtectedLayout() {

  const [_fontsLoaded] = useFonts({
    'CalSans': require('@/assets/fonts/CalSans-Regular.ttf'),
  });
  // Mark as used to satisfy linter; font loading handled by useFonts side-effect
  void _fontsLoaded;
  
  const auth = useContext(AuthContext);

  // Show nothing while checking authentication
  if (auth?.loading) {
    return null;
  }

  // If not authenticated, redirect to login
  if (!auth?.isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
    </SafeAreaProvider>

  )
}
