import { Colors, Typography } from '@/themes/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

interface GameOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onMuteToggle: () => void;
  isMuted: boolean;
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
      icon: isMuted ? 'volume-off' : 'volume-high',
      label: isMuted ? 'Unmute' : 'Mute',
      onPress: onMuteToggle,
    },
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
});
