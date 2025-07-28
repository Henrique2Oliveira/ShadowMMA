import { Colors, Typography } from '@/themes/theme';
import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from "react-native";


export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View
        style={styles.container}
      >
        <Text style={styles.buttonText}>Error 404 </Text>

        <Link href="/" style={styles.button}>
          <Text style={styles.buttonText}>Go to home screen.</Text>
        </Link>

      </View>

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
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

