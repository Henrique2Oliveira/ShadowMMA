import { Text } from '@/components';
import { Colors, Typography } from '@/themes/theme';
import { uiScale } from '@/utils/uiScale';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Dimensions, Easing, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function WelcomeBonusModal({ visible, onClose }: Props) {
  const [mounted, setMounted] = React.useState(visible);
  const overlayAnim = React.useRef(new Animated.Value(0)).current; // 0..1
  const cardAnim = React.useRef(new Animated.Value(0)).current; // 0..1
  const shineAnim = React.useRef(new Animated.Value(0)).current; // 0..1 looping across card
  const heartsPulse = React.useRef(new Animated.Value(0)).current; // 0..1

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.parallel([
        Animated.timing(overlayAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, tension: 110, friction: 10 }),
      ]).start(() => {
        startCardShine();
        startHeartsPulse();
      });
    } else {
      Animated.parallel([
        Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(cardAnim, { toValue: 0, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const startCardShine = React.useCallback(() => {
    shineAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, { toValue: 1, duration: 2200, easing: Easing.linear, useNativeDriver: true }),
        Animated.delay(1200),
        Animated.timing(shineAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(1200),
      ])
    ).start();
  }, [shineAnim]);

  const startHeartsPulse = React.useCallback(() => {
    heartsPulse.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartsPulse, { toValue: 1, duration: 680, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(heartsPulse, { toValue: 0, duration: 680, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.delay(400),
      ])
    ).start();
  }, [heartsPulse]);

  if (!mounted) return null;

  const width = Dimensions.get('window').width;
  const cardWidth = Math.min(700, width * 0.9);
  const translateY = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const scale = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] });
  const overlayOpacity = overlayAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.7] });
  // Make shine start further off-screen to the left and exit further to the right
  const shineTranslate = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-(cardWidth + 140), cardWidth + 140],
  });
  const pulseScale = heartsPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
      <View style={styles.overlayWrap}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY }, { scale }] }]}> 
          <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityLabel="Close">
            <MaterialCommunityIcons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={[styles.headerRow]}>
                        <MaterialCommunityIcons name="gift" size={24} color="#ffffffff" />

            <Text style={[styles.title]}>Welcome Bonus</Text>
            <MaterialCommunityIcons name="gift" size={24} color="#ffffffff" />
          </View>

          <Animated.View style={{ width: '100%', alignItems: 'center' }}>
            <LinearGradient
              colors={["#101010", "rgba(54, 15, 15, 1)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.card, { maxWidth: Math.min(700, width * 0.9) }]}
            >
              <View style={styles.bonusRow}>
                <Animated.View style={{ transform: [{ scale: pulseScale }] }}>
                  <MaterialCommunityIcons name="heart" size={uiScale(28, { category: 'icon' })} color="#ff5757" />
                </Animated.View>
                <Animated.View style={{ transform: [{ scale: pulseScale }] }}>
                  <MaterialCommunityIcons name="heart" size={uiScale(28, { category: 'icon' })} color="#ff5757" />
                </Animated.View>
                <Animated.View style={{ transform: [{ scale: pulseScale }] }}>
                  <MaterialCommunityIcons name="heart" size={uiScale(28, { category: 'icon' })} color="#ff5757" />
                </Animated.View>
                <Animated.View style={{ transform: [{ scale: pulseScale }] }}>
                  <MaterialCommunityIcons name="heart" size={uiScale(28, { category: 'icon' })} color="#ff5757" />
                </Animated.View>
              </View>

              <Text style={styles.bonusTitle}>+4 Extra Lives</Text>
              <Text style={styles.message}>Jump right in — you start with more fights today.</Text>

              <View style={styles.notePill}>
                <MaterialCommunityIcons name="refresh" size={16} color="#ffffffff" />
                <Text style={styles.noteText}>Lives restore daily</Text>
              </View>

              {/* animated shine overlay */}
              <Animated.View pointerEvents="none" style={[styles.shine, { transform: [{ translateX: shineTranslate }] }]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{ width: '100%', height: '100%' }}
                />
              </Animated.View>
            </LinearGradient>
          </Animated.View>

          <View style={styles.buttons}>
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onClose();
              }}
              style={styles.primaryBtn}
            >
              <LinearGradient colors={["#db2020ff", "#a31919ff"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtnGradient}>
                
                <Text style={styles.primaryBtnText}>Let’s Fight!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: uiScale(16, { category: 'spacing' }),
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  sheet: {
    backgroundColor: '#000',
    borderRadius: uiScale(18, { category: 'spacing' }),
    padding: uiScale(18, { category: 'spacing' }),
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: '#edededff',
    width: '100%',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: uiScale(14, { category: 'spacing' }),
    top: uiScale(14, { category: 'spacing' }),
    zIndex: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uiScale(8, { category: 'spacing' }),
    marginTop: uiScale(4, { category: 'spacing' }),
    marginBottom: uiScale(12, { category: 'spacing' }),
  },
  title: {
    color: Colors.text,
    fontSize: uiScale(22, { category: 'font' }),
    fontFamily: Typography.fontFamily,
  },
  card: {
    width: '100%',
    borderRadius: uiScale(12, { category: 'spacing' }),
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: '#edededff',
    padding: uiScale(14, { category: 'spacing' }),
    overflow: 'hidden',
    alignItems: 'center',
  },
  bonusRow: {
    flexDirection: 'row',
    gap: uiScale(8, { category: 'spacing' }),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: uiScale(12, { category: 'spacing' }),
  },
  bonusTitle: {
    color: Colors.text,
    fontSize: uiScale(28, { category: 'font' }),
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    marginBottom: uiScale(6, { category: 'spacing' }),
  },
  message: {
    color: Colors.text,
    opacity: 0.9,
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(15, { category: 'font' }),
    lineHeight: uiScale(21, { category: 'font' }),
    textAlign: 'center',
  },
  notePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uiScale(6, { category: 'spacing' }),
    paddingVertical: uiScale(6, { category: 'spacing' }),
    paddingHorizontal: uiScale(10, { category: 'spacing' }),
    borderRadius: uiScale(14, { category: 'spacing' }),
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginTop: uiScale(14, { category: 'spacing' }),
  },
  noteText: {
    color: '#d0d0d0',
    opacity: 0.95,
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(12, { category: 'font' }),
  },
  shine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    opacity: 0.4,
  },
  buttons: {
    marginTop: uiScale(16, { category: 'spacing' }),
    width: '100%'
  },
  primaryBtn: {
    borderRadius: uiScale(14, { category: 'spacing' }),
    overflow: 'hidden',
  },
  primaryBtnGradient: {
    height: uiScale(48, { category: 'button' }),
    borderRadius: uiScale(14, { category: 'spacing' }),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: uiScale(8, { category: 'spacing' }),
  },
  primaryBtnText: {
    color: '#fff',
    fontFamily: Typography.fontFamily,
    letterSpacing: 0.3,
    fontSize: uiScale(18, { category: 'font' }),
  },
});
