import { Colors, Typography } from '@/themes/theme';
import { uiScale } from '@/utils/uiScale';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MESSAGES = [
  'Great fight! Keep the momentum going.',
  'Nice work — your discipline shows.',
  'Good job! Precision beats power.',
  'Sharp performance. Stay consistent!',
  'You’re building real fight IQ. Well done!',
  'Strong round! Hydrate and reset.',
  'Clean technique — that’s how you grow.',
  'Solid session. Come back hungry.',
];

interface GoodJobModalProps {
  visible: boolean;
  onClose: () => void;
  message?: string;
}

const GoodJobModal: React.FC<GoodJobModalProps> = ({ visible, onClose, message }) => {
  const [text, setText] = React.useState('');
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(40)).current;
  const scale = React.useRef(new Animated.Value(0.98)).current;

  React.useEffect(() => {
    if (visible) {
      setText(message || MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      opacity.setValue(0);
      translateY.setValue(40);
      scale.setValue(0.98);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 240, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 240, useNativeDriver: true }),
      ]).start();
    }
  }, [message, opacity, scale, translateY, visible]);

  const handleClose = React.useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 30, duration: 180, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.98, duration: 180, useNativeDriver: true }),
    ]).start(() => onClose());
  }, [onClose, opacity, scale, translateY]);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.wrap, { opacity, transform: [{ translateY }, { scale }] }]}>
          <TouchableOpacity style={styles.close} onPress={handleClose}>
            <MaterialCommunityIcons name="close" size={22} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerRow}>
            {/* <MaterialCommunityIcons name="check-circle" size={26} color="#7fd35f" /> */}
            <Text style={styles.title}>🔥 Great Fight!</Text>
          </View>
          <LinearGradient
            colors={["#1a1a1aff", "rgba(54, 15, 15, 1)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.card}
          >
            <Text style={styles.message}>{text}</Text>
          </LinearGradient>
          <TouchableOpacity style={styles.cta} onPress={handleClose} activeOpacity={0.9}>
            <LinearGradient colors={["#5a1515", "#3e1010"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.ctaBg}>
              <Text style={styles.ctaText}>Nice</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: uiScale(16, { category: 'spacing' }),
  },
  wrap: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: uiScale(18, { category: 'spacing' }),
    padding: uiScale(18, { category: 'spacing' }),
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: '#edededff',
  },
  close: {
    position: 'absolute',
    right: uiScale(14, { category: 'spacing' }),
    top: uiScale(14, { category: 'spacing' }),
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uiScale(8, { category: 'spacing' }),
    marginBottom: uiScale(12, { category: 'spacing' }),
  },
  title: {
    color: Colors.text,
    fontSize: uiScale(22, { category: 'font' }),
    fontFamily: Typography.fontFamily,
  },
  card: {
    borderRadius: uiScale(12, { category: 'spacing' }),
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: '#edededff',
    padding: uiScale(14, { category: 'spacing' }),
  },
  message: {
    color: Colors.text,
    fontSize: uiScale(18, { category: 'font' }),
    fontFamily: Typography.fontFamily,
  },
  cta: {
    alignSelf: 'center',
    width: '50%',
    borderRadius: uiScale(10, { category: 'spacing' }),
    marginTop: uiScale(16, { category: 'spacing' }),
    borderBottomWidth: 6,
    borderWidth: 2,
    borderColor: '#ff3636ff',
    overflow: 'hidden',
  },
  ctaBg: {
    paddingVertical: uiScale(12, { category: 'spacing' }),
  },
  ctaText: {
    color: Colors.text,
    fontSize: uiScale(20, { category: 'font' }),
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
  },
});

export default GoodJobModal;
