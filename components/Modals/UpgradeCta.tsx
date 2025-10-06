import { Text } from '@/components';
import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  width: number;
  scaleUp: number;
};

export default function UpgradeCta({ visible, onClose, onUpgrade, width, scaleUp }: Props) {
  const [mounted, setMounted] = React.useState<boolean>(visible);
  const anim = React.useRef(new Animated.Value(visible ? 1 : 0)).current;

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, anim]);

  if (!mounted) return null;

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] });
  const opacity = anim;

  return (
    <View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.upgradeCtaContainer,
        {
          bottom: 180 * scaleUp,
          paddingHorizontal: 16 * scaleUp,
          width: Math.min(700, width * 0.92),
        },
      ]}
    >
  <Animated.View style={[{ transform: [{ translateY }, { scale }], opacity }]}>
        <LinearGradient
          colors={["#1e1e1e", "#2a0f10"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.upgradeCta,
            {
              paddingVertical: 14 * Math.min(scaleUp, 1.3),
              paddingHorizontal: 16 * Math.min(scaleUp, 1.3),
              borderRadius: 14 * Math.min(scaleUp, 1.3),
            },
          ]}
        >
          <View style={styles.upgradeIconWrap}>
            <MaterialCommunityIcons name="crown" size={24 * scaleUp} color="#ffd257" />
          </View>
          <View style={{ flex: 1, marginRight: 12 * scaleUp }}>
            <Text style={[styles.upgradeTitle, { fontSize: 16 * scaleUp }]}>You’re out of fights</Text>
            <Text style={[styles.upgradeSubtitle, { fontSize: 13 * scaleUp }]}>Free plan limit reached. Upgrade for unlimited fights and full access.</Text>
          </View>

          <TouchableOpacity
            onPress={onUpgrade}
            style={[
              styles.upgradeButton,
              {
                paddingVertical: 10 * Math.min(scaleUp, 1.2),
                paddingHorizontal: 16 * Math.min(scaleUp, 1.2),
                borderRadius: 10 * Math.min(scaleUp, 1.2),
              },
            ]}
            activeOpacity={0.9}
          >
            <Text style={[styles.upgradeButtonText, { fontSize: 14 * scaleUp }]}>Upgrade</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            accessibilityLabel="Close upgrade CTA"
            style={[
              styles.closeButton,
              {
                position: 'absolute',
                top: 8 * Math.min(scaleUp, 1.3),
                right: 8 * Math.min(scaleUp, 1.3),
                padding: 6 * Math.min(scaleUp, 1.3),
                borderRadius: 16 * Math.min(scaleUp, 1.3),
              },
            ]}
          >
            <View>
              <MaterialCommunityIcons name="close" size={18 * Math.min(scaleUp, 1.3)} color="rgba(255,255,255,0.95)" />
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  upgradeCtaContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 120,
    elevation: 10,
  },
  upgradeCta: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  upgradeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 210, 87, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  upgradeTitle: {
    color: '#ffffff',
    fontFamily: Typography.fontFamily,
    marginBottom: 2,
  },
  upgradeSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: Typography.fontFamily,
  },
  upgradeButton: {
    backgroundColor: Colors.bgGameDark,
  },
  upgradeButtonText: {
    color: '#fff',
    fontFamily: Typography.fontFamily,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    zIndex: 50,
    elevation: 12,
  },
  closeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontFamily: Typography.fontFamily,
  }
});
