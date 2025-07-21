import { FontAwesome5 } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { Colors, Typography } from '../../themes/theme'; // Adjust the import path as necessary
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
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarIconStyle: {
          alignItems: 'center',
          justifyContent: 'center',
          height: 80,
        },

      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              name="home"
              size={24}
              color={focused ? 'white' : 'gray'}
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
            <FontAwesome5
              name="book"
              size={24}
              color={focused ? 'white' : 'gray'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="game"
        options={{
          title: 'Game',
          tabBarShowLabel: false,


          tabBarIcon: ({ focused }) => (
            <Text style={
              {
                color: focused ? 'white' : 'gray',
                fontFamily: Typography.fontFamily,
                fontSize: 22,
                fontWeight: 'bold',
                width: '200%',
                height: 34,
                textAlign: 'center',
                backgroundColor: Colors.button,
                borderRadius: 10,
                paddingVertical: 2,
                paddingHorizontal: 5,
                transform: [{ rotateZ: '5deg' }],
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
            <FontAwesome5
              name="shopping-cart"
              size={24}
              color={focused ? 'white' : 'gray'}
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
            <FontAwesome5
              name="user"
              size={24}
              color={focused ? 'white' : 'gray'}
            />
          ),
        }}
      />
    </Tabs>
  )
}


