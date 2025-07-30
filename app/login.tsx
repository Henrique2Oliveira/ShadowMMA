import PaywallScreen from '@/components/PaywallScreen';
import { useAuth } from '@/contexts/AuthContext';
import AuthScreen from '@/screens/AuthScreen';
import { Colors, Typography } from "@/themes/theme";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  const [showPaywall, setShowPaywall] = useState(true);
  const [checkingFirstVisit, setCheckingFirstVisit] = useState(true);

  useEffect(() => {
    checkFirstVisit();
  }, []);

  const checkFirstVisit = async () => {
    try {
      const hasVisited = await AsyncStorage.getItem('hasVisitedBefore');
      if (hasVisited === null) {
        setShowPaywall(true);
        await AsyncStorage.setItem('hasVisitedBefore', 'true');
      } else {
        setShowPaywall(false);
      }
    } catch (error) {
      console.error('Error checking first visit:', error);
    } finally {
      setCheckingFirstVisit(false);
    }
  };

  const handlePaywallSkip = () => {
    setShowPaywall(false);
  };

  const [fontsLoaded, fontError] = useFonts({
    'CalSans': require('@/assets/fonts/CalSans-Regular.ttf'),
    'SpaceMono': require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { fontFamily: undefined }]}>Shadow MMA</Text>
        <ActivityIndicator size="large" color={Colors.text} />
        {fontError ? (
          <Text style={[styles.loadingText, { fontFamily: undefined, color: '#ff4444' }]}>
            Error loading fonts: {fontError.message}
          </Text>
        ) : (
          <Text style={[styles.loadingText, { fontFamily: undefined }]}>
            Loading ...
          </Text>
        )}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Shadow MMA</Text>
        <ActivityIndicator size="large" color={Colors.text} />
        <View>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(protected)/(tabs)" />;
  }

  if (checkingFirstVisit) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.text} />
      </View>
    );
  }

  if (showPaywall) {
    return (
      <View style={styles.container}>
        <PaywallScreen onSkip={handlePaywallSkip} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AuthScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020402',
  },
  loadingText: {
    fontFamily: Typography.fontFamily,
    color: Colors.text,
    fontSize: 24,
    marginTop: 20,
    textAlign: 'center',
  },
  title: {
    fontFamily: Typography.fontFamily,
    color: "#fff",
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: Colors.button,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    elevation: 3,
  },
  buttonText: {
    fontFamily: Typography.fontFamily,
    color: "#fff",
    fontSize: 24,
    textAlign: 'center',
  },
});


