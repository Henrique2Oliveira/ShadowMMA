import { Text } from '@/components';
import { Colors } from '@/themes/theme';
import { getNewCombosCount, hydrateNewCombosCount, setNewCombosCount, subscribeNewCombosCount } from '@/utils/badgeBus';
import { ensureTouchSize, getDeviceBucket, scaledHitSlop, uiScale } from '@/utils/uiScale';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useFonts } from 'expo-font';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const isSmallPhone = deviceBucket === 'smallPhone' || deviceBucket === 'xSmallPhone';
  const isNormalPhone = deviceBucket === 'phone';
  const tabBarHeight = ensureTouchSize(uiScale(74, { category: 'button' }));
  const tabBarRadius = uiScale(35, { category: 'button' });
  const tabBarPaddingHorizontal = uiScale(10, { category: 'spacing' });
  // Flush the tab bar to the bottom edge (no extra gap)
  const tabBarBottom = 0;
  // Tighten icons on compact screens while respecting uiScale
  const iconSizeHome = uiScale(isSmallPhone ? 34 : 40, { category: 'icon' });
  const iconSizeGallery = uiScale(isSmallPhone ? 34 : 40, { category: 'icon' });
  const iconSizeCombos = uiScale(isSmallPhone ? 35 : 41, { category: 'icon' });
  const iconSizeProfile = uiScale(isSmallPhone ? 32 : 36, { category: 'icon' });
  const sideNudge = isSmallPhone ? -14 : -20;
  // Fight button sizing
  const fightBtnHeight = ensureTouchSize(uiScale(isSmallPhone ? 26 : 30, { category: 'button' }));
  const fightFontSize = uiScale(isSmallPhone ? 22 : 22, { category: 'font' });
  const fightLineHeight = fightFontSize + 4;
  // Keep width within its tab cell to avoid wrapping/clipping on narrow devices
  const fightBtnWidthPercent = (isSmallPhone ? '100%' : isNormalPhone ? '100%' : '100%');
  const iconWrapperHeight = ensureTouchSize(uiScale(48, { category: 'button' }));
  // const iconWrapperWidth = uiScale(36, { category: 'button' });

  // Custom animated TabBar with small dot indicator under active icon
  const CustomTabBar = (props: BottomTabBarProps) => {
    const { state, descriptors, navigation } = props;

    // Drive animations from the navigation index
  const animIndex = useRef(new Animated.Value(state.index)).current;
  const [newCombosCount, setNewCombosIndicator] = useState<number>(getNewCombosCount());
    const dotPulse = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.timing(animIndex, {
        toValue: state.index,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }, [state.index, animIndex]);

    // hydrate persisted badge count
    useEffect(() => {
      hydrateNewCombosCount();
    }, []);

    // Subscribe to global badge updates
    useEffect(() => {
      const unsub = subscribeNewCombosCount(setNewCombosIndicator);
      return unsub;
    }, []);

    // Gentle pulse animation for the red dot to draw attention without being annoying
    useEffect(() => {
      let loop: Animated.CompositeAnimation | undefined;
      if (newCombosCount > 0) {
        dotPulse.setValue(0);
        loop = Animated.loop(
          Animated.sequence([
            Animated.timing(dotPulse, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(dotPulse, { toValue: 0, duration: 900, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          ])
        );
        loop.start();
      }
      return () => {
        if (loop) loop.stop();
      };
    }, [newCombosCount, dotPulse]);

    const dotScale = dotPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });

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
            if (route.name === 'combos') {
              // Clear badge once user heads to Combos
              setNewCombosCount(0);
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
                    <MaterialIcons name="school" size={iconSizeGallery} color={color} style={{ marginLeft: sideNudge }} />
                  </Animated.View>
                );
              case 'combos': {
                const count = newCombosCount;
                const showBadge = count > 0;
                const badgeMin = uiScale(14, { category: 'icon' });
                const badgePadH = uiScale(4, { category: 'spacing' });
                const badgeHeight = uiScale(16, { category: 'icon' });
                // Position a bit higher and further right so it sits on the top-right corner visually
                const badgeTop = uiScale(-5, { category: 'spacing' });
                const badgeRight = uiScale(-42 + Math.abs(sideNudge), { category: 'spacing' });
                const ringPadV = uiScale(3, { category: 'spacing' });
                const ringPadH = uiScale(3, { category: 'spacing' });
                const label = count > 99 ? '99+' : String(count);
                return (
                  <View style={{ position: 'relative' }}>
                    <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                      <MaterialCommunityIcons
                        name="boxing-glove"
                        size={iconSizeCombos}
                        color={color}
                        style={{ transform: [{ rotateZ: '90deg' }], marginRight: sideNudge }}
                      />
                    </Animated.View>
                    {showBadge && (
                      <Animated.View
                        pointerEvents="none"
                        style={{
                          position: 'absolute',
                          top: badgeTop,
                          right: badgeRight,
                          paddingHorizontal: ringPadH,
                          paddingVertical: ringPadV,
                          borderRadius: uiScale(12, { category: 'icon' }),
                          backgroundColor: Colors.bgDark, // ring color matching tab bar bg
                          transform: [{ scale: dotScale }],
                        }}
                      >
                        <View
                          style={{
                            minWidth: badgeMin,
                            height: badgeHeight,
                            paddingHorizontal: badgePadH,
                            borderRadius: uiScale(10, { category: 'icon' }),
                            backgroundColor: '#ff3b30', // brighter red for better visibility
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#ff3b30',
                            shadowOpacity: 0.9,
                            shadowRadius: 6,
                            shadowOffset: { width: 0, height: 0 },
                            elevation: 4,
                          }}
                        >
                          <Text
                            style={{
                              color: 'white',
                              fontSize: uiScale(10, { category: 'font' }),
                              lineHeight: uiScale(12, { category: 'font' }),
                              fontFamily: fontsLoaded ? 'CalSans' : undefined,
                            }}
                            numberOfLines={1}
                          >
                            {label}
                          </Text>
                        </View>
                      </Animated.View>
                    )}
                  </View>
                );
              }
              case 'profile':
                return (
                  <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                    <MaterialIcons name="account-circle" size={iconSizeProfile} color={color} />
                  </Animated.View>
                );
              case 'game':
                // Render a view styled as a button; rely on outer onPress to avoid nested touchables
                return (
                  <View
                    style={{
                      width: fightBtnWidthPercent,
                      height: fightBtnHeight,
                      backgroundColor: isFocused ? 'white' : '#e6e6e6ff',
                      borderRadius: uiScale(6, { category: 'button' }),
                      paddingVertical: uiScale(2, { category: 'spacing' }),
                      paddingHorizontal: uiScale(6, { category: 'spacing' }),
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
                      numberOfLines={1}
                      ellipsizeMode="clip"
                      adjustsFontSizeToFit
                      style={{
                        color: '#000000',
                        fontSize: fightFontSize,
                        lineHeight: fightLineHeight,
                        textShadowColor: '#000',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 1,
                        fontFamily: fontsLoaded ? 'CalSans' : undefined,
                        transform: [{ rotateZ: '-5deg' }],
                        
                      }}
                    >
                      Fight
                    </Text>
                  </View>
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
              hitSlop={scaledHitSlop(6)}
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
