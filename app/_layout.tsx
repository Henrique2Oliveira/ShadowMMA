import { AuthProvider } from '@/contexts/AuthContext';
import { Colors } from '@/themes/theme';
import { Stack, usePathname } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  const pathname = usePathname();


  const getBackgroundColor = () => {
    switch (pathname) {
      case '/login':
        return "#020402"; // special Dark background for login to match image
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
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: getBackgroundColor() }}>
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

