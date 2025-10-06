import { Text } from '@/components';
import { Colors, Typography } from '@/themes/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, Easing, Modal, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';

interface GameOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onMuteToggle: () => void;
  isMuted: boolean;
  volume?: number;
  onVolumeChange?: (v: number) => void;
  onSpeedChange: () => void;
  speedMultiplier: number;
  onAnimationModeChange: () => void;
  animationMode: 'none' | 'old' | 'new';
  onShowCombos: () => void;
  onQuit: () => void;
  // Stance controls
  stance: 'orthodox' | 'southpaw';
  onToggleStance: () => void;
  // Combo carousel toggle
  showComboCarousel: boolean;
  onToggleComboCarousel: () => void;
}

export const GameOptionsModal: React.FC<GameOptionsModalProps> = ({
  visible,
  onClose,
  onMuteToggle,
  isMuted,
  volume = 1,
  onVolumeChange,
  onSpeedChange,
  speedMultiplier,
  onAnimationModeChange,
  animationMode,
  onShowCombos,
  onQuit,
  stance,
  onToggleStance,
  showComboCarousel,
  onToggleComboCarousel,
}) => {
  const { width } = useWindowDimensions();
  const slideX = React.useRef(new Animated.Value(0)).current;

  // Slide modal content from the right when opening
  React.useEffect(() => {
    if (visible) {
      slideX.setValue(width); // start off-screen to the right
      Animated.timing(slideX, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, width, slideX]);
  const getAnimationModeLabel = (mode: 'none' | 'old' | 'new') => {
    switch (mode) {
      case 'none': return 'Animations: None';
      case 'old': return 'Animations: Old';
      case 'new': return 'Animations: Slide';
      default: return 'Animations: Old';
    }
  };

  const getAnimationModeIcon = (mode: 'none' | 'old' | 'new') => {
    switch (mode) {
      case 'none': return 'square-outline';
      case 'old': return 'cube-outline';
      case 'new': return 'cube';
      default: return 'cube-outline';
    }
  };

  const options = [
    {
      icon: 'flash-outline',
      label: `Speed: ${speedMultiplier.toFixed(1)}x`,
      onPress: onSpeedChange,
    },
    {
      icon: stance === 'orthodox' ? 'walk' : 'walk-outline',
      label: `Stance: ${stance === 'orthodox' ? 'Jab-Left (Orthodox)' : 'Jab-Right (Southpaw)'}`,
      onPress: onToggleStance,
    },
    {
      icon: getAnimationModeIcon(animationMode),
      label: getAnimationModeLabel(animationMode),
      onPress: onAnimationModeChange,
    },
    {
      icon: showComboCarousel ? 'eye' : 'eye-off',
      label: showComboCarousel ? 'Hide Combo Display' : 'Show Combo Display',
      onPress: onToggleComboCarousel,
    },
    {
      icon: 'list',
      label: 'Show Combos',
      onPress: onShowCombos,
    },
    {
      icon: 'exit',
      label: 'Quit',
      onPress: onQuit,
    },
  ];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContent, { transform: [{ translateX: slideX }] }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>

          <Text style={styles.title}>Options</Text>

          {/* Volume control row with inline adjustments */}
          <View style={[styles.optionRow, styles.optionButtonBorder]}>
            <Ionicons
              name={(isMuted || volume <= 0) ? 'volume-mute' : volume < 0.5 ? 'volume-low' : 'volume-high'}
              size={24}
              color={Colors.text}
              style={styles.optionIcon}
            />
            <Text style={[styles.optionText, { flex: 1 }]}>
              {isMuted || volume <= 0 ? 'Muted' : `Volume: ${Math.round(volume * 100)}%`}
            </Text>
            <TouchableOpacity
              onPress={onMuteToggle}
              style={[styles.pillButton, { backgroundColor: 'rgba(255,255,255,0.08)' }]}
            >
              <Text style={styles.pillButtonText}>{isMuted || volume <= 0 ? 'Unmute' : 'Mute'}</Text>
            </TouchableOpacity>
          </View>

          {/* Volume slider-like bar with +/- nudge buttons */}
          <View style={[styles.volumeAdjustRow, styles.optionButtonBorder]}>
            <TouchableOpacity
              onPress={() => onVolumeChange && onVolumeChange(Math.max(0, Math.round((volume - 0.1) * 10) / 10))}
              style={[styles.nudgeBtn, { marginRight: 10 }]}
            >
              <Text style={styles.nudgeBtnText}>-</Text>
            </TouchableOpacity>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, Math.round(volume * 100)))}%` }]} />
            </View>
            <TouchableOpacity
              onPress={() => onVolumeChange && onVolumeChange(Math.min(1, Math.round((volume + 0.1) * 10) / 10))}
              style={[styles.nudgeBtn, { marginLeft: 10 }]}
            >
              <Text style={styles.nudgeBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionsList}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.label}
                style={[
                  styles.optionButton,
                  index < options.length - 1 && styles.optionButtonBorder,
                ]}
                onPress={option.onPress}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={Colors.text}
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.bgDark,
    borderRadius: 10,
    padding: 25,
    width: '80%',
    minWidth: 200,
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 5,
  },
  title: {
    fontFamily: 'CalSans',
    fontSize: 24,
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsList: {
    width: '100%',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  optionButtonBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgray,
  },
  optionIcon: {
    marginRight: 10,
  },
  optionText: {
    fontFamily: Typography.fontFamily,
    fontSize: 16,
    color: Colors.text,
  },
  pillButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillButtonText: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: 14,
  },
  volumeAdjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  nudgeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  nudgeBtnText: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: Typography.fontFamily,
  },
  progressTrack: {
    flex: 1,
    height: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.12)'
  },
  progressFill: {
    height: 10,
    backgroundColor: Colors.redDots,
    borderRadius: 6,
  },
});
