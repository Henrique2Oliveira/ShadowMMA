import AuthScreen from '@/components/AuthScreen';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Typography } from "@/themes/theme";
import { useFonts } from 'expo-font';
import { useRouter } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [fontsLoaded] = useFonts({
    'CalSans': require('../assets/fonts/CalSans-Regular.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <AuthScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
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


