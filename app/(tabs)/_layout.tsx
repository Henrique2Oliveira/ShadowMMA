import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { FontAwesome5 } from '@expo/vector-icons'

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
          backgroundColor: 'black',
          paddingTop: 20,
          borderRadius: 65,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          borderRadius: 65,
          backgroundColor: 'yellow',
          margin: 5,
          padding: 10,
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
              name="image"
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
            <Text style={{ color: focused ? 'white' : 'gray', fontSize: 14 }}>Fight</Text>
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

