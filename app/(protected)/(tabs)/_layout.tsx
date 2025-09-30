import { Colors } from '@/themes/theme';
import { getDeviceBucket, uiScale } from '@/utils/uiScale';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

export default function TabsLayout() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'CalSans': require('@/assets/fonts/CalSans-Regular.ttf'),
  });

  const handleFightPress = () => {
    router.push('/(protected)/(tabs)');
    // Using a timeout to ensure navigation completes before showing modal
    setTimeout(() => {
      globalThis.showFightModal?.();
    }, 100);
  };

  // --- Responsive scaling values ---
  const deviceBucket = getDeviceBucket();
  const isNormalPhone = deviceBucket === 'phone';
  const tabBarHeight = uiScale(80, { category: 'button' });
  const tabBarRadius = uiScale(35, { category: 'button' });
  const tabBarPaddingHorizontal = uiScale(10, { category: 'spacing' });
  const tabBarBottom = uiScale(8, { category: 'spacing' });
  const iconSizeHome = uiScale(42, { category: 'icon' });
  const iconSizeGallery = uiScale(42, { category: 'icon' });
  const iconSizeCombos = uiScale(43, { category: 'icon' });
  const iconSizeProfile = uiScale(38, { category: 'icon' });
  const fightBtnHeightBase = uiScale(30, { category: 'button' });
  const fightFontSizeBase = uiScale(20, { category: 'font' });
  // Slightly larger on normal phones, unchanged on small/x-small; other buckets rely on uiScale
  const fightBtnHeight = Math.round(fightBtnHeightBase * (isNormalPhone ? 1.2 : 1.1));
  const fightFontSize = Math.round(fightFontSizeBase * (isNormalPhone ? 1.3 : 1));
  const fightLineHeight = fightFontSize + 4;
  // Width as a percent of the icon wrapper width so it visually overflows; bump on normal phones only
  const fightBtnWidthPercent = `${Math.round(160 * (isNormalPhone ? 1.25 : 0.9))}%` as const;
  const iconWrapperHeight = uiScale(50, { category: 'button' });
  const iconWrapperWidth = uiScale(36, { category: 'button' });

  return (
    <>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: Colors.bgDark,
          position: 'absolute',
          bottom: tabBarBottom,
          borderRadius: tabBarRadius,
          marginHorizontal: uiScale(10, { category: 'spacing' }),
          paddingHorizontal: tabBarPaddingHorizontal,
          borderTopWidth: 0,
          elevation: 2,
          shadowOpacity: 0.2,
          height: tabBarHeight,
        },
        tabBarIconStyle: {
          height: iconWrapperHeight,
          marginVertical: uiScale(10, { category: 'spacing' }),
          marginHorizontal: uiScale(10, { category: 'spacing' }),
          width: iconWrapperWidth,
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
              size={iconSizeHome}
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
              size={iconSizeGallery}
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
                width: fightBtnWidthPercent,
                height: fightBtnHeight,
                backgroundColor: focused ? 'white' : '#e6e6e6ff',
                borderRadius: uiScale(5, { category: 'button' }),
                paddingVertical: uiScale(2, { category: 'spacing' }),
                paddingHorizontal: uiScale(5, { category: 'spacing' }),
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}>
              <Text style={{
                color: "#000000",
                fontSize: fightFontSize,
                lineHeight: fightLineHeight,
                shadowColor: "#000",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 2,
                fontFamily: fontsLoaded ? 'CalSans' : undefined,
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
              size={iconSizeCombos}
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
              size={iconSizeProfile}
              color={focused ? 'white' : '#e6e6e6ff'}
            />
          ),
        }}
      />
  </Tabs>
  </>
  )
}
