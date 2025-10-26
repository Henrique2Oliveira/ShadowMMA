import { Text } from '@/components';
import { useUserData } from '@/contexts/UserDataContext';
import { Colors, Typography } from '@/themes/theme';
import { isTablet, rf, rs } from '@/utils/responsive';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

interface FightModeModalProps {
  isVisible: boolean;
  onClose: () => void;
  roundDuration: string;
  setRoundDuration: (duration: string) => void;
  numRounds: string;
  setNumRounds: (rounds: string) => void;
  restTime: string;
  setRestTime: (time: string) => void;
  moveSpeed: string;
  setMoveSpeed: (speed: string) => void;
  movesMode: string[];
  setMovesMode: (movesMode: string[]) => void;
  category: string;
  comboId?: string | number; // hidden param, not shown in UI
  moveType?: string; // The move type of the selected combo
  onStartFight: () => void;
  userLevel?: number; // player level for gating
  extraParams?: Record<string, string>; // optional extra router params
}

interface FightOption {
  value: string;
  label: string;
}

export const FIGHT_OPTIONS: {
  roundDurations: FightOption[];
  numberOfRounds: FightOption[];
  restTimes: FightOption[];
  movesMode: FightOption[];
} = {
  roundDurations: [
    { value: '1', label: '1 m' },
    { value: '2', label: '2 m' },
    { value: '3', label: '3 m' },
    { value: '4', label: '4 m' },
    { value: '5', label: '5 m' },
  ],
  numberOfRounds: [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '5', label: '5' },
    { value: '7', label: '7' },
  ],
  restTimes: [
    { value: '0.5', label: '30s' },
    { value: '1', label: '1m' },
    { value: '1.5', label: '1.5m' },
    { value: '2', label: '2m' },
    { value: '3', label: '3m' },
  ],
  movesMode: [
    { value: 'Punches', label: 'Strikes' },
    { value: 'Kicks', label: 'Kicks' },
    { value: 'Defense', label: 'Defense' },
  ],
};

export function FightModeModal({
  isVisible,
  onClose,
  roundDuration,
  setRoundDuration,
  numRounds,
  setNumRounds,
  restTime,
  setRestTime,
  moveSpeed,
  setMoveSpeed,
  setMovesMode,
  movesMode,
  category,
  comboId,
  moveType,
  onStartFight,
  userLevel = 0,
  extraParams,
}: FightModeModalProps) {
  // Pull user plan + lives from context (fallback to any explicit extraParams override)
  const { userData } = useUserData();
  const derivedPlan = (extraParams?.plan || userData?.plan || '').toLowerCase();
  const isFreePlan = derivedPlan === 'free';
  const livesLeft = typeof userData?.fightsLeft === 'number' ? userData.fightsLeft : undefined;

  const isFullRandomFight = movesMode.includes('RANDOM_ALL');
  const isCustomSelected = movesMode.includes('CUSTOM_SELECTED');
  const KICKS_REQUIRED_LEVEL = 7;
  const DEFENSE_REQUIRED_LEVEL = 3;
  const handleStartFight = () => {
    // Add haptic feedback when fight button is pressed
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Guard: Prevent entering game if on Free plan with zero lives
    if (isFreePlan && typeof livesLeft === 'number' && livesLeft <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onStartFight(); // keep callbacks consistent (will just close sheet upstream)
      // Route user to plans instead of loading game
      router.push('/(protected)/plans');
      return;
    }

    onStartFight();
    router.push({
      pathname: '/(protected)/(tabs)/game',
      params: {
        roundDuration,
        numRounds,
        restTime,
        moveSpeed,
        // If comboId is provided, use its specific moveType
        // otherwise use the selected moveTypes from the modal
        movesMode: comboId ? moveType || 'Punches' : movesMode.join(','),
        category,
        comboId: comboId !== undefined && comboId !== null ? String(comboId) : undefined,
        // Send fight configuration for tracking
        fightRounds: numRounds,
        fightTimePerRound: roundDuration,
        randomFight: movesMode.includes('RANDOM_ALL') ? 'true' : 'false',
        timestamp: Date.now().toString()
        , ...(extraParams || {})
      }
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
      >
        <View style={styles.bottomSheet}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
            }}
          >
            <MaterialCommunityIcons name="close" size={rs(28)} color="white" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Fight Mode Options</Text>
          {/* Mode description + cost badge */}
          <View style={styles.modeHeaderRow}>
            <Text style={styles.modeDescription}>
              {comboId !== undefined && comboId !== null
                ? 'Focused Combo: Repeat a chosen combo each round to sharpen precision and endurance.'
                : isFullRandomFight
                  ? 'Random Fight: All unlocked combos (below or at your level) are loaded. Order shuffles each time.'
                  : 'Random Combos: 3–5 varied combos from selected move types for skill variety & conditioning.'}
            </Text>
          </View>
          {/* Life cost info moved below Start button */}
          {/* (Compact lives info moved below Start button) */}

          <View style={styles.optionsContainer}>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Round Duration:</Text>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={4}
                  step={1}
                  value={FIGHT_OPTIONS.roundDurations.findIndex(d => d.value === roundDuration)}
                  onValueChange={(value) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setRoundDuration(FIGHT_OPTIONS.roundDurations[value].value);
                  }}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#FFFFFF40"
                  thumbTintColor="#FFFFFF"
                />
                <View style={styles.sliderLabels}>
                  {FIGHT_OPTIONS.roundDurations.map((duration, index) => (
                    <Text
                      key={duration.value}
                      style={[
                        styles.sliderLabel,
                        roundDuration === duration.value && styles.sliderLabelActive
                      ]}
                    >
                      {duration.label}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Rounds:</Text>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={4}
                  step={1}
                  value={FIGHT_OPTIONS.numberOfRounds.findIndex(r => r.value === numRounds)}
                  onValueChange={(value) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setNumRounds(FIGHT_OPTIONS.numberOfRounds[value].value);
                  }}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#FFFFFF40"
                  thumbTintColor="#FFFFFF"
                />
                <View style={styles.sliderLabels}>
                  {FIGHT_OPTIONS.numberOfRounds.map((round, index) => (
                    <Text
                      key={round.value}
                      style={[
                        styles.sliderLabel,
                        numRounds === round.value && styles.sliderLabelActive
                      ]}
                    >
                      {round.label}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Rest Time:</Text>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={4}
                  step={1}
                  value={FIGHT_OPTIONS.restTimes.findIndex(t => t.value === restTime)}
                  onValueChange={(value) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setRestTime(FIGHT_OPTIONS.restTimes[value].value);
                  }}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#FFFFFF40"
                  thumbTintColor="#FFFFFF"
                />
                <View style={styles.sliderLabels}>
                  {FIGHT_OPTIONS.restTimes.map((time, index) => (
                    <Text
                      key={time.value}
                      style={[
                        styles.sliderLabel,
                        restTime === time.value && styles.sliderLabelActive
                      ]}
                    >
                      {time.label}
                    </Text>
                  ))}
                </View>
              </View>
            </View>



            {comboId === undefined && !isFullRandomFight && !isCustomSelected && (
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Moves:</Text>
                <View style={styles.buttonContainer}>
                  {FIGHT_OPTIONS.movesMode.map((move) => {
                    const requiredLevel = move.value === 'Kicks' ? KICKS_REQUIRED_LEVEL : move.value === 'Defense' ? DEFENSE_REQUIRED_LEVEL : 0;
                    const locked = requiredLevel > 0 && userLevel < requiredLevel;
                    const selected = movesMode.includes(move.value);
                    return (
                      <TouchableOpacity
                        key={move.value}
                        style={[
                          styles.moveModeButton,
                          selected && styles.moveModeButtonActive,
                          locked && { opacity: 0.45, borderColor: '#555', borderWidth: 1 }
                        ]}
                        onPress={() => {
                          if (locked) {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                            return;
                          }
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          const newMovesMode = selected
                            ? movesMode.length > 1
                              ? movesMode.filter(m => m !== move.value)
                              : movesMode
                            : [...movesMode, move.value];
                          setMovesMode(newMovesMode);
                        }}
                        disabled={locked}
                      >
                        <MaterialCommunityIcons
                          name={
                            move.value === 'Punches' ? 'hand-back-right' :
                              move.value === 'Kicks' ? 'foot-print' :
                                'shield'
                          }
                          size={rs(28)}
                          color={selected ? '#FFFFFF' : '#FFFFFF80'}
                        />
                        <Text style={[
                          styles.moveModeButtonText,
                          selected && styles.moveModeButtonTextActive
                        ]}>
                          {move.label}
                        </Text>
                        {locked && (
                          <View style={{ position: 'absolute', bottom: 4, right: 4, backgroundColor: '#222', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                            <Text style={{ color: '#ffdd55', fontSize: 10, fontFamily: Typography.fontFamily }}>Lv {requiredLevel}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.startButton} onPress={handleStartFight} activeOpacity={0.9}>
              <Text style={styles.startButtonText}>Start Fight</Text>
            </TouchableOpacity>
            {isFreePlan && (
              <View style={styles.livesInline}>
                <MaterialCommunityIcons
                  name={livesLeft !== undefined && livesLeft <= 0 ? 'heart-broken' : 'heart'}
                  size={rs(isTablet ? 18 : 14)}
                  color={
                    livesLeft === undefined ? '#ffffff80' : livesLeft <= 0 ? '#ff5b57' : livesLeft === 1 ? '#ffb347' : '#67d76a'
                  }
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.livesInlineText}>
                  {typeof livesLeft === 'number'
                    ? `${Math.max(livesLeft, 0)} ${Math.max(livesLeft, 0) === 1 ? 'Life' : 'Lives'} left • Upgrade for ∞ Fights!`
                    : 'Lives: …'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    flex: 2,
    justifyContent: 'space-between',
    columnGap: 8,
  },
  moveModeButton: {
    backgroundColor: '#444444',
    paddingVertical: isTablet ? 14 : 10,
    paddingHorizontal: isTablet ? 14 : 10,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  moveModeButtonActive: {
    backgroundColor: Colors.darkGreen,
    borderWidth: 1,
    borderColor: '#1a610c9c',
    borderBottomWidth: 4,
    shadowColor: '#000',
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  moveModeButtonText: {
    color: '#FFFFFF80',
    fontSize: rf(12),
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  moveModeButtonTextActive: {
    color: '#FFFFFF',
    fontSize: rf(12),
    fontFamily: Typography.fontFamily,
    fontWeight: '600'
  },
  sliderContainer: {
    flex: 2,
    paddingHorizontal: isTablet ? 20 : 10,
  },
  slider: {
    width: '100%',
    height: isTablet ? 50 : 35,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: isTablet ? 8 : 10,
    marginTop: isTablet ? -2 : -5,
  },
  sliderLabel: {
    color: '#ffffff80',
    fontSize: rf(14),
    fontFamily: Typography.fontFamily,
  },
  sliderLabelActive: {
    color: '#FFFFFF',
    fontSize: rf(16),
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  bottomSheet: {
    backgroundColor: '#333333',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: isTablet ? 32 : 20,
    paddingBottom: isTablet ? 45 : 28,
    width: '100%',
    maxWidth: isTablet ? 760 : '100%',
    alignSelf: 'center'
  },
  closeButton: {
    position: 'absolute',
    right: isTablet ? 28 : 20,
    top: isTablet ? 24 : 20,
    zIndex: 1,
    padding: 4,
  },
  modalTitle: {
    color: 'white',
    fontSize: rf(30),
    fontFamily: Typography.fontFamily,
    marginTop: isTablet ? 28 : 20,
    marginBottom: isTablet ? 22 : 15,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  modeDescription: {
    color: '#ffffffcc',
    fontSize: rf(15),
    fontFamily: Typography.fontFamily,
    flex: 1,
    marginRight: isTablet ? 16 : 12,
    marginBottom: 6,
    lineHeight: rf(20),
  },
  modeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 8,
  },
  lifeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#b72222',
    paddingHorizontal: isTablet ? 14 : 10,
    paddingVertical: isTablet ? 8 : 6,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
    elevation: 4,
  },
  lifeBadgeText: {
    color: '#fff',
    fontSize: rf(12),
    fontFamily: Typography.fontFamily,
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  lifeHint: {
    color: '#ffffff80',
    fontSize: rf(12),
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: rf(16),
  },
  // Compact inline lives indicator (below Start button)
  livesInline: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#2f2f2f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444'
  },
  livesInlineText: {
    color: '#ffffffb8',
    fontSize: rf(isTablet ? 12 : 10),
    fontFamily: Typography.fontFamily,
    letterSpacing: 0.4,
  },
  optionsContainer: {
    width: '100%',
    marginTop: isTablet ? 28 : 20,
    gap: isTablet ? 8 : 0,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isTablet ? 26 : 20,
    gap: isTablet ? 12 : 0,
  },
  optionLabel: {
    color: 'white',
    fontSize: rf(19),
    fontFamily: Typography.fontFamily,
    flex: 1,
    letterSpacing: 0.3,
  },

  startButton: {
    backgroundColor: Colors.darkGreen,
    paddingVertical: isTablet ? 22 : 15,
    borderRadius: 14,
    marginTop: isTablet ? 30 : 20,
    borderWidth: 1,
    borderColor: '#1a610cff',
    borderBottomWidth: 5,
    shadowColor: '#000',
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 4.2,
  },
  startButtonText: {
    color: 'white',
    fontSize: rf(22),
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
    shadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
    elevation: 5,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    letterSpacing: 0.5,
    fontWeight: '600'
  },
});
