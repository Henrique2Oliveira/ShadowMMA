import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TouchableOpacity onPress={() => router.navigate("/(tabs)")}>
        <Text>Go to tabs</Text>
      </TouchableOpacity>

    </View>
  );
}

