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
        return Colors.background;  
      case '/gallery':
        return Colors.background; 
      case '/profile':
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

