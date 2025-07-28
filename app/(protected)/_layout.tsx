import { AuthContext } from '@/contexts/AuthContext';
import { Colors } from '@/themes/theme';
import { Redirect, Stack, usePathname } from 'expo-router';
import { useContext } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function ProtectedLayout() {

  const pathname = usePathname();

  const getBackgroundColor = () => {
    switch (pathname) {
      case '/(protected)/(tabs)/game':
        return Colors.bgGameDark;
      case '/(protected)/(tabs)/shop':
        return Colors.background;
      case '/(protected)/(tabs)/gallery':
        return Colors.background;
      case '/(protected)/(tabs)/profile':
        return Colors.background;
      default:
        return Colors.background;
    }
  };
  const auth = useContext(AuthContext);

  // Show nothing while checking authentication
  if (auth?.loading) {
    return null;
  }

  // If not authenticated, redirect to login
  if (!auth?.isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: getBackgroundColor() }}>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
    </SafeAreaProvider>

  )
}
