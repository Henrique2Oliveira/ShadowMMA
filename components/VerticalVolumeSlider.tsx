import { Colors, Typography } from '@/themes/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

interface VerticalVolumeSliderProps {
  volume: number; // 0.0 - 1.0
  isMuted: boolean;
  onVolumeChange: (newVolume: number) => void; // will also imply mute when 0
  onMuteToggle: () => void;
  isPaused: boolean;
  opacity: Animated.Value;
}

export const VerticalVolumeSlider: React.FC<VerticalVolumeSliderProps> = ({
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  isPaused,
  opacity,
}) => {
  const { width } = useWindowDimensions();
  const scaleUp = width >= 1024 ? 1.5 : width >= 768 ? 1.25 : 1;

  const SLIDER_HEIGHT = 110 * scaleUp;
  const TRACK_WIDTH = 10 * scaleUp;
  const THUMB_SIZE = 20 * scaleUp;
  const BUTTON_W = 80 * scaleUp;
  const BUTTON_H = 45 * scaleUp;
  const BUTTON_RADIUS = 25 * scaleUp;
  const ICON_SIZE = 30 * scaleUp;

  const MIN = 0;
  const MAX = 1;

  const [isVisible, setIsVisible] = React.useState(false);
  const [dragStartY, setDragStartY] = React.useState(0);
  const [dragStartValue, setDragStartValue] = React.useState(volume);

  const valueToPosition = (val: number) => {
    const ratio = (val - MIN) / (MAX - MIN);
    return SLIDER_HEIGHT - ratio * SLIDER_HEIGHT;
  };

  const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

  const toggleSlider = () => {
    if (!isPaused) return;
    setIsVisible((v) => !v);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => isPaused,
    onMoveShouldSetPanResponder: () => isPaused,

    onPanResponderGrant: (evt: any) => {
      setDragStartY(evt.nativeEvent.pageY);
      setDragStartValue(volume);
    },

    onPanResponderMove: (evt: any) => {
      if (!isPaused) return;
      const deltaY = evt.nativeEvent.pageY - dragStartY;
      const sensitivity = 1 / SLIDER_HEIGHT; // drag full height goes 0->1
      const deltaVal = -deltaY * sensitivity;
      const newVal = clamp(dragStartValue + deltaVal, MIN, MAX);
      // snap small values to exactly 0 to feel like mute
      onVolumeChange(newVal < 0.02 ? 0 : parseFloat(newVal.toFixed(2)));
    },

    onPanResponderRelease: () => {
      // no-op
    },
  });

  const isEffectivelyMuted = isMuted || volume <= 0;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      {/* Volume Button */}
      <TouchableOpacity
        style={[
          styles.sideButton,
          { width: BUTTON_W, height: BUTTON_H, borderRadius: BUTTON_RADIUS, borderBottomWidth: 5 * Math.min(scaleUp, 1.4) },
          !isPaused && styles.disabledButton,
        ]}
        onPress={toggleSlider}
        hitSlop={{ top: 10 * scaleUp, bottom: 10 * scaleUp, left: 10 * scaleUp, right: 10 * scaleUp }}
        disabled={!isPaused}
        accessibilityRole="button"
        accessibilityLabel="Volume"
      >
        <Ionicons
          name={isEffectivelyMuted ? 'volume-mute' : 'volume-high'}
          size={ICON_SIZE}
          color={Colors.bgDark}
        />
      </TouchableOpacity>

      {/* Vertical Slider */}
      {isVisible && (
        <View
          style={[
            styles.sliderContainer,
            {
              bottom: 65 * scaleUp,
              width: BUTTON_W,
              borderRadius: 15 * scaleUp,
              paddingVertical: 12 * scaleUp,
              paddingTop: 25 * scaleUp,
              paddingHorizontal: 10 * scaleUp,
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Slider Track */}
          <View
            style={[
              styles.track,
              { width: TRACK_WIDTH, height: SLIDER_HEIGHT, borderRadius: 5 * scaleUp, marginVertical: 5 * scaleUp },
            ]}
          >
            {/* Active Track */}
            <View
              style={[
                styles.activeTrack,
                {
                  height: SLIDER_HEIGHT - valueToPosition(volume),
                  width: TRACK_WIDTH,
                  borderRadius: 5 * scaleUp,
                },
              ]}
            />
          </View>

          {/* Thumb */}
          <View
            style={[
              styles.thumb,
              {
                top: valueToPosition(volume) - THUMB_SIZE / 2 + 30,
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                borderRadius: THUMB_SIZE / 2,
                left: 30 * scaleUp,
              },
            ]}
          />

          {/* Value Display */}
          <View
            style={[
              styles.speedDisplay,
              {
                marginTop: 4 * scaleUp,
                borderRadius: 8 * scaleUp,
                paddingHorizontal: 8 * scaleUp,
                paddingVertical: 4 * scaleUp,
              },
            ]}
          >
            <Text style={[styles.speedDisplayText, { fontSize: 14 * scaleUp }]}>
              {isEffectivelyMuted ? 'Muted' : `${Math.round(volume * 100)}%`}
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'relative',
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
    shadowOffset: { width: 0, height: 2 },
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
  sliderContainer: {
    position: 'absolute',
    bottom: 65,
    left: 0,
    width: 80,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 15,
    paddingVertical: 12,
    paddingTop: 25,
    paddingHorizontal: 10,
  },
  track: {
    width: 10,
    height: 120,
    backgroundColor: '#444',
    borderRadius: 5,
    position: 'relative',
    marginVertical: 5,
  },
  activeTrack: {
    position: 'absolute',
    bottom: 0,
    width: 10,
    backgroundColor: Colors.redDots,
    borderRadius: 5,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.redDots,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    left: 30,
  },
  speedDisplay: {
    marginTop: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  speedDisplayText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Typography.fontFamily,
  },
});

export default VerticalVolumeSlider;
