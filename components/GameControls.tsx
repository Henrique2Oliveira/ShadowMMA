import { VerticalSpeedSlider } from '@/components/VerticalSpeedSlider';
import { VerticalVolumeSlider } from '@/components/VerticalVolumeSlider';
import { Colors, Typography } from '@/themes/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Animated, BackHandler, Modal, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';

interface GameControlsProps {
  isPaused: boolean;
  isMuted: boolean;
  volume?: number; // 0..1, optional for backward compatibility
  animationMode: 'none' | 'old' | 'new';
  speedMultiplier: number;
  sideButtonsOpacity: Animated.Value;
  onPauseToggle: () => void;
  onMuteToggle: () => void;
  onVolumeChange?: (newVolume: number) => void;
  onSpeedChange: () => void;
  onSpeedSliderChange: (newSpeed: number) => void;
  onOptionsPress: () => void;
  isGameOver: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  isPaused,
  isMuted,
  volume = 1,
  animationMode,
  speedMultiplier,
  sideButtonsOpacity,
  onPauseToggle,
  onMuteToggle,
  onVolumeChange,
  onSpeedChange,
  onSpeedSliderChange,
  onOptionsPress,
  isGameOver,
}) => {
  const { width } = useWindowDimensions();
  const scaleUp = width >= 1024 ? 1.6 : width >= 768 ? 1.3 : 1;
  const [confirmHomeVisible, setConfirmHomeVisible] = React.useState(false);
  const confirmAnim = React.useRef(new Animated.Value(0)).current;
  const sideBtn = {
    width: 80 * scaleUp,
    height: 45 * scaleUp,
    borderRadius: 25 * scaleUp,
    borderBottomWidth: 5 * Math.min(scaleUp, 1.4),
  } as const;
  const pauseBtn = {
    width: 80 * scaleUp,
    height: 80 * scaleUp,
    borderRadius: 40 * scaleUp,
    borderBottomWidth: 5 * Math.min(scaleUp, 1.4),
  } as const;
  const iconMain = 40 * scaleUp;
  const iconSide = 30 * scaleUp;

  React.useEffect(() => {
    if (confirmHomeVisible) {
      confirmAnim.setValue(0);
      Animated.timing(confirmAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [confirmHomeVisible, confirmAnim]);

  // Android hardware back: show confirmation when game is active
  React.useEffect(() => {
    const onBackPress = () => {
      if (isGameOver) return false; // let default behavior outside active fights
      if (confirmHomeVisible) {
        setConfirmHomeVisible(false);
        return true; // handled
      }
      setConfirmHomeVisible(true);
      return true; // prevent navigation
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isGameOver, confirmHomeVisible]);

  return (
    <View style={[styles.buttonsContainer, { bottom: 40 * scaleUp, paddingHorizontal: 30 * scaleUp }]}>
      <Animated.View style={{ opacity: sideButtonsOpacity }}>

        {/* Volume Slider (includes mute at 0) */}
        <VerticalVolumeSlider
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={(v) => onVolumeChange?.(v)}
          onMuteToggle={onMuteToggle}
          isPaused={isPaused}
          opacity={sideButtonsOpacity}
        />

        {/* Home Button */}
        <TouchableOpacity
          style={[styles.sideButton, sideBtn, !isPaused && styles.disabledButton]}
          onPress={() => {
            if (isPaused) setConfirmHomeVisible(true);
          }}
        >
          <Ionicons name="home" size={iconSide} color={Colors.bgDark} />
        </TouchableOpacity>
      </Animated.View>

      {/* Pause/Play Button - Hidden when fight is over */}
      {!isGameOver && (
        <TouchableOpacity style={[styles.pauseButton, pauseBtn]} onPress={onPauseToggle}>
          <Ionicons
            name={isPaused ? "play" : "pause"}
            size={iconMain}
            color={Colors.bgDark}
          />
        </TouchableOpacity>
      )}

      <Animated.View style={{ opacity: sideButtonsOpacity }}>
        {/* Speed Slider */}
        <VerticalSpeedSlider
          speedMultiplier={speedMultiplier}
          onSpeedChange={onSpeedSliderChange}
          isPaused={isPaused}
          opacity={sideButtonsOpacity}
        />
        {/* Options Button */}
        <TouchableOpacity
          style={[styles.sideButton, sideBtn, !isPaused && styles.disabledButton]}
          onPress={onOptionsPress}
        >
          <Ionicons name="options" size={iconSide} color={Colors.bgDark}
          />
        </TouchableOpacity>
      </Animated.View>

      {confirmHomeVisible && (
        <Modal
          animationType="fade"
          transparent
          visible
          onRequestClose={() => setConfirmHomeVisible(false)}
        >
          <View style={styles.fullscreenOverlay}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setConfirmHomeVisible(false)}
              style={styles.fullscreenBackdrop}
            />
            <Animated.View
              style={[
                styles.confirmCard,
                {
                  opacity: confirmAnim,
                  transform: [
                    { scale: confirmAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
                  ],
                },
              ]}
              accessibilityRole="alert"
            >
              <Ionicons name="alert-circle" size={28} color={Colors.redDots} style={{ marginBottom: 6 }} />
              <Animated.Text style={[styles.confirmTitle, { opacity: confirmAnim }]}>Leave fight?</Animated.Text>
              <Animated.Text style={[styles.confirmMessage, { opacity: confirmAnim }]}>You’ll lose today’s fight progress. Are you sure you want to go home?</Animated.Text>
              <View style={styles.confirmActions}>
                <TouchableOpacity
                  onPress={() => setConfirmHomeVisible(false)}
                  style={styles.confirmSecondary}
                  accessibilityLabel="Stay in fight"
                >
                  <Animated.Text style={[styles.confirmSecondaryText, { opacity: confirmAnim }]}>Stay</Animated.Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setConfirmHomeVisible(false);
                    router.push('/');
                  }}
                  style={styles.confirmDestructive}
                  accessibilityLabel="Go to home"
                >
                  <Animated.Text style={[styles.confirmDestructiveText, { opacity: confirmAnim }]}>Leave</Animated.Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    width: '100%',
    paddingHorizontal: 30,
  },
  sideButton: {
    backgroundColor: '#efefefff',
    width: 80,
    height: 45,
    marginVertical: 10,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.background,
    borderBottomWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pauseButton: {
    backgroundColor: '#efefefff',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.background,
    borderBottomWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  speedText: {
    fontSize: 22,
    fontFamily: Typography.fontFamily,
    color: Colors.bgDark,
  },
  disabledButton: {
    backgroundColor: '#d4d4d4',
    opacity: 0.8,
  },
  // Confirmation styles
  fullscreenOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)'
  },
  fullscreenBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  confirmCard: {
    width: '80%',
    maxWidth: 380,
    backgroundColor: Colors.bgDark,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  confirmTitle: {
    fontFamily: 'CalSans',
    fontSize: 20,
    color: Colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  confirmMessage: {
    fontFamily: Typography.fontFamily,
    fontSize: 14,
    color: Colors.text,
    opacity: 0.85,
    textAlign: 'center',
    marginBottom: 14,
  },
  confirmActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmSecondary: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginRight: 10,
  },
  confirmSecondaryText: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: 15,
  },
  confirmDestructive: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.redDots,
  },
  confirmDestructiveText: {
    color: '#000',
    fontFamily: Typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
  },
});
