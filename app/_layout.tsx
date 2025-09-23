import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';
import { ConsentProvider } from '@/contexts/ConsentContext';
import { Colors } from '@/themes/theme';
import { Stack, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
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

  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: "goog_WKPrTYSCxEvIzYhRBIXwOOsIJmY" });
    }
    else {
      console.warn("Purchases is only configured for Android in this app.");
    }

    // getCustomerInfo();
  }, []);

  async function getCustomerInfo() {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      console.log("Customer Info:", JSON.stringify(customerInfo));
    } catch (error) {
      console.error("Error fetching customer info");
    }
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Here you could log to a crash reporting service like Sentry
        console.error('App Error Boundary:', error, errorInfo);
      }}
    >
      <AuthProvider>
        <ConsentProvider>
          <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: getBackgroundColor() }}>
              <Stack screenOptions={{ headerShown: false }} />
            </SafeAreaView>
          </SafeAreaProvider>
        </ConsentProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

