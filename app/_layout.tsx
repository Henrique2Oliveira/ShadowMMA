import { AuthProvider } from '@/contexts/AuthContext';
import { Stack, usePathname } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../themes/theme';

export default function RootLayout() {
  
  const pathname = usePathname();
  
  const getBackgroundColor = () => {
    switch (pathname) {
      case '/game':
        return Colors.bgGameDark; // Dark background for game
      case '/shop':
        return '#1a1a1a';  // Darker background for shop
      case '/gallery':
        return '#242424';  // Slightly lighter background for gallery
      case '/profile':
        return '#1f1f1f';  // Different dark shade for profile
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

