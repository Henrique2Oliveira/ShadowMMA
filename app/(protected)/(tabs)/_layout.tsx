import { Text } from '@/components';
import { Colors } from '@/themes/theme';
import { getDeviceBucket, uiScale } from '@/utils/uiScale';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useFonts } from 'expo-font';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, TouchableOpacity, View } from 'react-native';

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
  // Flush the tab bar to the bottom edge (no extra gap)
  const tabBarBottom = 0;
  const iconSizeHome = uiScale(42, { category: 'icon' });
  const iconSizeGallery = uiScale(42, { category: 'icon' });
  const iconSizeCombos = uiScale(43, { category: 'icon' });
  const iconSizeProfile = uiScale(38, { category: 'icon' });
  const fightBtnHeightBase = uiScale(30, { category: 'button' });
  const fightFontSizeBase = uiScale(20, { category: 'font' });
  // Slightly larger on normal phones, unchanged on small/x-small; other buckets rely on uiScale
  const fightBtnHeight = Math.round(fightBtnHeightBase * (isNormalPhone ? 1.2 : 1.5));
  const fightFontSize = Math.round(fightFontSizeBase * (isNormalPhone ? 1.3 : 1.3));
  const fightLineHeight = fightFontSize + 4;
  // Width as a percent of the icon wrapper width so it visually overflows; bump on normal phones only
  const fightBtnWidthPercent = `${Math.round(160 * (isNormalPhone ? 0.8 : 0.5))}%` as const;
  const iconWrapperHeight = uiScale(50, { category: 'button' });
  // const iconWrapperWidth = uiScale(36, { category: 'button' });

  // Custom animated TabBar with small dot indicator under active icon
  const CustomTabBar = (props: BottomTabBarProps) => {
  const { state, descriptors, navigation } = props;

    // Drive animations from the navigation index
    const animIndex = useRef(new Animated.Value(state.index)).current;
    useEffect(() => {
      Animated.timing(animIndex, {
        toValue: state.index,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }, [state.index, animIndex]);

    const inputRange = useMemo(() => state.routes.map((_, i) => i), [state.routes]);

  // Now safe to derive conditional UI
  const focusedRoute = state.routes[state.index];
  const focusedOptions: any = descriptors[focusedRoute.key]?.options ?? {};
  const shouldHide = (focusedOptions?.tabBarStyle as any)?.display === 'none';
  if (shouldHide) return null;

    return (
      <View
        style={{
          backgroundColor: Colors.bgDark,
          position: 'absolute',
          bottom: tabBarBottom,
          left: uiScale(10, { category: 'spacing' }),
          right: uiScale(10, { category: 'spacing' }),
          borderRadius: tabBarRadius,
          paddingHorizontal: tabBarPaddingHorizontal,
          borderTopWidth: 0,
          elevation: 2,
          shadowOpacity: 0.2,
          height: tabBarHeight,
          flexDirection: 'row',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            if (route.name === 'game') {
              handleFightPress();
              return;
            }
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Animated icon scale for active tab
          const iconScale = animIndex.interpolate({
            inputRange,
            outputRange: inputRange.map((i) => (i === index ? 1.12 : 1)),
            extrapolate: 'clamp',
          });

          // Render icons matching the original configuration
          const renderIcon = () => {
            const color = isFocused ? 'white' : '#e6e6e6ff';
            switch (route.name) {
              case 'index':
                return (
                  <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                    <MaterialIcons name="home" size={iconSizeHome} color={color} />
                  </Animated.View>
                );
              case 'gallery':
                return (
                  <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                    <MaterialIcons name="school" size={iconSizeGallery} color={color} style={{ marginLeft: -20 }} />
                  </Animated.View>
                );
              case 'combos':
                return (
                  <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                    <MaterialCommunityIcons
                      name="boxing-glove"
                      size={iconSizeCombos}
                      color={color}
                      style={{ transform: [{ rotateZ: '90deg' }], marginRight: -20 }}
                    />
                  </Animated.View>
                );
              case 'profile':
                return (
                  <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                    <MaterialIcons name="account-circle" size={iconSizeProfile} color={color} />
                  </Animated.View>
                );
              case 'game':
                return (
                  <TouchableOpacity
                    onPress={handleFightPress}
                    activeOpacity={0.9}
                    style={{
                      width: fightBtnWidthPercent,
                      height: fightBtnHeight,
                      backgroundColor: isFocused ? 'white' : '#e6e6e6ff',
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
                    }}
                  >
                    <Text
                      style={{
                        color: '#000000',
                        fontSize: fightFontSize,
                        lineHeight: fightLineHeight,
                        shadowColor: '#000',
                        textShadowOffset: { width: 0, height: 2 },
                        textShadowRadius: 2,
                        fontFamily: fontsLoaded ? 'CalSans' : undefined,
                        transform: [{ rotateZ: '-5deg' }],
                      }}
                    >
                      Fight
                    </Text>
                  </TouchableOpacity>
                );
              default:
                return null;
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={descriptors[route.key]?.options?.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                height: iconWrapperHeight,
                marginVertical: uiScale(10, { category: 'spacing' }),
              }}
              activeOpacity={0.8}
            >
              {renderIcon()}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <>
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Gallery',
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="game"
        options={{
          title: 'Game',
          tabBarShowLabel: false,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="combos"
        options={{
          title: 'Combos',
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarShowLabel: false,
        }}
      />
  </Tabs>
  </>
  )
}
