import { Text } from '@/components';
import { Colors, Typography } from '@/themes/theme';
import { uiScale } from '@/utils/uiScale';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Dimensions, Easing, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  message?: string;
}

export default function NoFightsLeftModal({ visible, onClose, onUpgrade, message }: Props) {
  const [mounted, setMounted] = React.useState(visible);
  const overlayAnim = React.useRef(new Animated.Value(0)).current; // 0..1
  const cardAnim = React.useRef(new Animated.Value(0)).current; // 0..1

  // Shine animations (card) + button shimmer
  const shineAnim = React.useRef(new Animated.Value(0)).current; // 0..1 looping across card
  const buttonShimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(overlayAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, tension: 110, friction: 10 }),
      ]).start(() => {
        // start shine/shimmer when fully visible
        startCardShine();
        startButtonShimmer();
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
        Animated.delay(1000),
        Animated.timing(shineAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(1200),
      ])
    ).start();
  }, [shineAnim]);

  const startButtonShimmer = React.useCallback(() => {
    buttonShimmerAnim.setValue(0);
    Animated.loop(
      Animated.timing(buttonShimmerAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [buttonShimmerAnim]);

  if (!mounted) return null;

  const width = Dimensions.get('window').width;
  const translateY = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const scale = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] });
  const overlayOpacity = overlayAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.7] });

  // shine translateX across card width
  const shineTranslate = shineAnim.interpolate({ inputRange: [0, 1], outputRange: [-80, Math.min(700, width * 0.9) + 80] });
  const buttonShimmerTranslate = buttonShimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [-120, 120] });

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
      <View style={styles.overlayWrap}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY }, { scale }] }]}> 
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.headerRow}>
            <MaterialCommunityIcons name="boxing-glove" size={24} color="#da3434ff" />
            <Text style={styles.title}>No Fights Left!</Text>
          </View>

          <Animated.View style={{ width: '100%', alignItems: 'center' }}>
            <LinearGradient
              colors={["#101010", "rgba(54, 15, 15, 1)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.card, { maxWidth: Math.min(700, width * 0.9) }]}
            >
              <Text style={styles.message}>
                {message || 'You’ve used your free fight for today. It resets daily — upgrade to Pro for unlimited fights and keep the action going!'}
              </Text>

              <View style={styles.perksRow}>
                <View style={styles.perkPill}>
                  <MaterialCommunityIcons name="crown" size={16} color="#ffd257" />
                  <Text style={styles.perkText}>Unlimited fights</Text>
                </View>
                <View style={styles.perkPill}>
                  <MaterialCommunityIcons name="shield-star" size={16} color="#ccbf0aff" />
                  <Text style={styles.perkText}>Pro-only modes</Text>
                </View>
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
            <TouchableOpacity activeOpacity={0.95} onPress={onUpgrade} style={styles.primaryBtn}>
              <LinearGradient colors={["#df9629ff", "#ff4b4b"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtnGradient}>
                <MaterialCommunityIcons name="crown" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>Upgrade to Pro</Text>
                {/* button shimmer */}
                <Animated.View pointerEvents="none" style={[styles.buttonShimmer, { transform: [{ translateX: buttonShimmerTranslate }] }]}>
                  <LinearGradient
                    colors={["transparent", "rgba(255,255,255,0.35)", "transparent"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9} onPress={onClose} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>Maybe later</Text>
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
  },
  message: {
    color: Colors.text,
    opacity: 0.9,
    fontFamily: Typography.fontFamily,
    fontSize: uiScale(16, { category: 'font' }),
    lineHeight: uiScale(22, { category: 'font' }),
    textAlign: 'center',
  },
  perksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: uiScale(8, { category: 'spacing' }),
    marginTop: uiScale(14, { category: 'spacing' }),
  },
  perkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uiScale(6, { category: 'spacing' }),
    paddingVertical: uiScale(6, { category: 'spacing' }),
    paddingHorizontal: uiScale(10, { category: 'spacing' }),
    borderRadius: uiScale(14, { category: 'spacing' }),
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  perkText: {
    color: Colors.text,
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
    marginTop: uiScale(14, { category: 'spacing' }),
    gap: uiScale(10, { category: 'spacing' }),
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
    fontWeight: '700',
    letterSpacing: 0.3,
    fontSize: uiScale(15, { category: 'font' }),
  },
  buttonShimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 90,
    opacity: 0.35,
  },
  secondaryBtn: {
    height: uiScale(46, { category: 'button' }),
    borderRadius: uiScale(14, { category: 'spacing' }),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  secondaryBtnText: {
    color: 'rgba(255,255,255,0.95)',
    fontFamily: Typography.fontFamily,
    fontWeight: '600',
    fontSize: uiScale(14, { category: 'font' }),
  },
});
