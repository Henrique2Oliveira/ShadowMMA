import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ComboCardProps = {
  id: string;
  name: string;
  level: number;
  type?: string;
  categoryName?: string;
  comboId?: number | string;
  isLocked: boolean;
  onPress: () => void;
};

const ComboCard = React.memo(({ name, type, level, categoryName, isLocked, onPress }: ComboCardProps) => {
  // Map categories/types to vibrant gradient color pairs (mirrors gallery.tsx)
  const gradientColors = useMemo<[string, string]>(() => {
    const key = (type || categoryName || '').toLowerCase();
    if (key.includes('punch')) return ['#ff512f', '#dd2476']; // red → magenta
    if (key.includes('kick')) return ['#7F00FF', '#E100FF']; // violet → pink
    if (key.includes('elbow')) return ['#f7971e', '#ffd200']; // orange → gold
    if (key.includes('knee')) return ['#11998e', '#38ef7d']; // teal → green
    if (key.includes('defense') || key.includes('defence')) return ['#00c6ff', '#0072ff']; // blue spectrum
    if (key.includes('footwork') || key.includes('foot')) return ['#fceabb', '#f8b500']; // pale gold → amber
    return ['#434343', '#000000'];
  }, [type, categoryName]);

  return (
    <TouchableOpacity
      style={[styles.comboCard, isLocked && styles.lockedCard]}
      onPress={() => {onPress()}}
      disabled={isLocked}
    >
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardGradient}>
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons
            name={type === 'Punches' ? 'boxing-glove' : type === 'Defense' ? 'shield' : 'karate'}
            size={115}
            color="#02020247"
            style={styles.typeIcon}
          />
          <Text style={[styles.comboTitle, isLocked && styles.lockedText]}>{name}</Text>
          {isLocked && (
            <MaterialCommunityIcons
              name="lock"
              size={35}
              color={Colors.text}
              style={styles.lockIcon}
            />
          )}
        </View>
        <Text style={[styles.comboDescription, isLocked && styles.lockedText]}>
          {categoryName ? `${type ?? ''}` : type ?? ''}
        </Text>
        <View style={[styles.levelBadge, isLocked && styles.lockedLevelBadge]}>
          <Text style={[styles.levelText, isLocked && styles.lockedLevelText]}>Level  {level}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

ComboCard.displayName = 'ComboCard';

const styles = StyleSheet.create({
  comboCard: {
    marginVertical: 8,
    marginHorizontal: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
    borderRadius: 8,
  },
  lockedCard: {
    opacity: 0.5,
  },
  lockedText: {
    color: Colors.text + '99',
  },
  lockIcon: {
    position: 'absolute',
    top: 26,
    right: 5,
    zIndex: 5,
  },
  lockedLevelBadge: {
    backgroundColor: 'rgba(22, 22, 22, 1)',
  },
  lockedLevelText: {
    color: Colors.text + '99',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIcon: {
    position: 'absolute',
    right: -25,
    top: -15,
    overflow: 'hidden',
  },
  comboTitle: {
    fontSize: 25,
    fontFamily: Typography.fontFamily,
    color: Colors.text,
    flex: 1,
  },
  comboDescription: {
    color: "rgba(255, 255, 255, 0.94)",
    fontFamily: Typography.fontFamily,
    marginTop: 4,
  },
  levelBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  levelText: {
    color: Colors.text,
    fontFamily: Typography.fontFamily,
    fontSize: 15,
  },
});

export default ComboCard;
