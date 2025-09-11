import AppOpenAdManager from '@/components/ads/AppOpenAdManager';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';
import { Colors } from '@/themes/theme';
import Constants from 'expo-constants';
import { Stack, usePathname } from 'expo-router';
import { Platform } from 'react-native';
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
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Here you could log to a crash reporting service like Sentry
        console.error('App Error Boundary:', error, errorInfo);
      }}
    >
      <AuthProvider>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: getBackgroundColor() }}>
            {/* App Open Ads on launch and on foreground (Android Dev Client/Prod only) */}
            {Platform.OS === 'android' && Constants.appOwnership !== 'expo' ? (
              <AppOpenAdManager />
            ) : null}
            <Stack screenOptions={{ headerShown: false }} />
          </SafeAreaView>
        </SafeAreaProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

