import { Link, Stack } from 'expo-router';
import { Text, View, StyleSheet } from "react-native";


export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Link href="/" style={styles.link}>
          <Text>Page not found!</Text>
          <Text>Go to home screen!</Text>
        </Link>
      </View>

    </>
  );
}

const styles = StyleSheet.create({
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
