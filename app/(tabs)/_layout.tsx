import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { Colors } from '../../themes/theme'; // Adjust the import path as necessary
/**
 * This is the layout for the tabs in the app.
 * It can be used to define common styles or components that should be present across all tab screens.
 */
export default function TabsLayout() {
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
              name="book"
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
            <Text style={
              {
                color: "#000000",
                fontSize: 24,
                fontWeight: 'bold',
                width: '220%',
                height: 40,
                lineHeight: 35,
                textAlign: 'center',
                backgroundColor: focused ? 'white' : '#e6e6e6ff',
                borderRadius: 5,
                paddingVertical: 2,
                paddingHorizontal: 5,
                transform: [{ rotateZ: '-5deg' }],
              }
            }>Fight</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              name="shopping-cart"
              size={40}
              marginRight={-20}
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
              size={40}
              color={focused ? 'white' : '#e6e6e6ff'}
            />
          ),
        }}
      />
    </Tabs>
  )
}


