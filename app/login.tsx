import { useAuth } from '@/contexts/AuthContext';
import AuthScreen from '@/screens/AuthScreen';
import { Colors, Typography } from "@/themes/theme";
import { useFonts } from 'expo-font';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  const [fontsLoaded] = useFonts({
    'CalSans': require('../assets/fonts/CalSans-Regular.ttf'),
  });


  if (!fontsLoaded) {
    return null; // Return null while fonts are still loading
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

  return (
    <View style={styles.container} >
      <AuthScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
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


