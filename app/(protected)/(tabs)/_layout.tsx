import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

export default function TabsLayout() {
  const router = useRouter();

  const [fontsLoaded, fontError] = useFonts({
    'CalSans': require('@/assets/fonts/CalSans-Regular.ttf'),
  });

  const handleFightPress = () => {
    router.push('/(protected)/(tabs)');
    // Using a timeout to ensure navigation completes before showing modal
    setTimeout(() => {
      globalThis.showFightModal?.();
    }, 100);
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: Colors.bgDark,
          position: 'absolute',
          bottom: 0,

          borderRadius: 35,
          marginHorizontal: 10,
          paddingHorizontal: 10,
          borderTopWidth: 0,
          elevation: 2,
          shadowOpacity: 0.2,
          height: 80,
        },
        tabBarIconStyle: {
          height: 50,
          marginVertical: 10,
          marginHorizontal: 10,
          width: 36,
        },

      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              name="home"
              size={42}
              color={focused ? 'white' : '#e6e6e6ff'}
              alt="Home Icon"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Gallery',
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              name="school"
              marginLeft={-20}
              size={42}
              color={focused ? 'white' : '#e6e6e6ff'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="game"
        options={{
          title: 'Game',
          tabBarShowLabel: false,
          tabBarStyle: { display: 'none' },
          tabBarIcon: ({ focused }) => (
            <TouchableOpacity
              onPress={handleFightPress}
              style={{
                width: '220%',
                height: 40,
                backgroundColor: focused ? 'white' : '#e6e6e6ff',
                borderRadius: 5,
                paddingVertical: 2,
                paddingHorizontal: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{
                color: "#000000",
                fontSize: 28,
                lineHeight: 34,
                fontFamily: Typography.fontFamily,
                transform: [{ rotateZ: '-5deg' }],
              }}>Fight</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="combos"
        options={{
          title: 'Combos',
          tabBarShowLabel: false,

          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="boxing-glove"
              size={43}
              marginRight={-20}
              style={{ transform: [{ rotateZ: '90deg' }] }}
              color={focused ? 'white' : '#e6e6e6ff'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              name="account-circle"
              size={38}
              color={focused ? 'white' : '#e6e6e6ff'}
            />
          ),
        }}
      />
    </Tabs>
  )
}
