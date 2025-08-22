import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
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

const ComboCard = React.memo(({
  name,
  type,
  level,
  categoryName,
  isLocked,
  onPress,
}: ComboCardProps) => {
  return (
    <TouchableOpacity
      style={[styles.comboCard, isLocked && styles.lockedCard]}
      onPress={() => {onPress()}}
      disabled={isLocked}
    >
      <LinearGradient colors={[Colors.button, '#5a5a5aff']} style={styles.cardGradient}>
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
              size={80}
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
    left: '5%',
    top: '5%',
    transform: [{ translateX: -12 }],
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
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    color: Colors.text,
    flex: 1,
  },
  comboDescription: {
    color: "rgba(187, 187, 187, 1)",
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
