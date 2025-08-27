import { Colors, Typography } from '@/themes/theme';
import React from 'react';
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VerticalSpeedSliderProps {
  speedMultiplier: number;
  onSpeedChange: (newSpeed: number) => void;
  isPaused: boolean;
  opacity: Animated.Value;
}

export const VerticalSpeedSlider: React.FC<VerticalSpeedSliderProps> = ({
  speedMultiplier,
  onSpeedChange,
  isPaused,
  opacity,
}) => {
  const SLIDER_HEIGHT = 120;
  const THUMB_SIZE = -10;
  const MIN_SPEED = 1;
  const MAX_SPEED = 2.5;
  
  const [isVisible, setIsVisible] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStartY, setDragStartY] = React.useState(0);
  const [dragStartSpeed, setDragStartSpeed] = React.useState(speedMultiplier);
  
  // Convert speed to position (0 to SLIDER_HEIGHT)
  const speedToPosition = (speed: number) => {
    const ratio = (speed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED);
    return SLIDER_HEIGHT - (ratio * SLIDER_HEIGHT);
  };

  // Convert position to speed with smooth continuous values
  const positionToSpeed = (position: number) => {
    const ratio = (SLIDER_HEIGHT - position) / SLIDER_HEIGHT;
    const speed = MIN_SPEED + (ratio * (MAX_SPEED - MIN_SPEED));
    // Return smooth values with one decimal place precision
    return Math.round(speed * 10) / 10;
  };

  const showSlider = () => {
    if (!isPaused) return;
    setIsVisible(true);
  };

  const hideSlider = () => {
    if (isDragging) return; // Don't hide while dragging
    setIsVisible(false);
  };

  const toggleSlider = () => {
    if (!isPaused) return;
    setIsVisible(prev => !prev);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => isPaused,
    onMoveShouldSetPanResponder: () => isPaused,
    
    onPanResponderGrant: (evt: any) => {
      setIsDragging(true);
      setDragStartY(evt.nativeEvent.pageY);
      setDragStartSpeed(speedMultiplier);
    },
    
    onPanResponderMove: (evt: any) => {
      if (!isPaused) return;
      
      const deltaY = evt.nativeEvent.pageY - dragStartY;
      const sensitivity = 0.01; // Adjust for sensitivity
      const speedChange = -deltaY * sensitivity; // Negative because Y increases downward
      const newSpeed = dragStartSpeed + speedChange;
      const clampedSpeed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, newSpeed));
      onSpeedChange(clampedSpeed);
    },
    
    onPanResponderRelease: () => {
      setIsDragging(false);
      // Slider stays open - only closes when speed button is clicked again
    },
  });

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      {/* Speed Button */}
      <TouchableOpacity 
        style={[
          styles.speedButton, 
          !isPaused && styles.disabledButton
        ]}
        onPress={toggleSlider}
        disabled={!isPaused}
      >
        <Text style={styles.speedText}>x{Math.round(speedMultiplier * 10) / 10}</Text>
      </TouchableOpacity>

      {/* Vertical Slider */}
      {isVisible && (
        <View style={styles.sliderContainer}>
          
          {/* Slider Track */}
          <View style={styles.track}>
            {/* Active Track */}
            <View 
              style={[
                styles.activeTrack,
                {
                  height: SLIDER_HEIGHT - speedToPosition(speedMultiplier),
                }
              ]}
            />
          </View>

          {/* Thumb */}
          <View
            style={[
              styles.thumb,
              {
                top: speedToPosition(speedMultiplier) - THUMB_SIZE / 2,
              },
            ]}
            {...panResponder.panHandlers}
          />
          
          {/* Speed Value Display */}
          <View style={styles.speedDisplay}>
            <Text style={styles.speedDisplayText}>
              {Math.round(speedMultiplier * 10) / 10}x
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
  speedButton: {
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
    bottom: 65, // Position above the speed button
    left: 0, // Center it with the button
    width: 80, // Same width as button
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 15,
    paddingVertical: 12,
    paddingTop: 15,
    paddingHorizontal: 10,

  },
  speedIconsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 6,
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    left: 30, // Center the thumb on the track (track width 10px, thumb width 20px, so -5px)
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
