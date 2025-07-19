import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/themes/theme";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.navigate("/(tabs)")}>
        <Text style={styles.text}>Go to tabs</Text>
      </TouchableOpacity>

    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background, // Using the background color from the theme
  },
  text: {
    color: "#fff",
    fontSize: 30,
    textAlign: 'center',
    margin: 10,
  },
});


