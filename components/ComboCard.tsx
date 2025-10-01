import { Colors, Typography } from '@/themes/theme';
import { getDeviceBucket, uiScale } from '@/utils/uiScale';
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
  proOnly?: boolean;
  isFreePlan?: boolean;
  onUpgradePress?: () => void;
  onPress: () => void;
};

const ComboCard = React.memo(({ name, type, level, categoryName, isLocked, onPress, proOnly, isFreePlan, onUpgradePress }: ComboCardProps) => {
  // Treat pro-only combos with premium style always; only block interaction on free plan
  const proLocked = !!proOnly && !!isFreePlan;
  const isProCombo = !!proOnly;
  const displayLocked = isLocked && !proLocked; // dim only when locked by level, not by plan
  // Map categories/types to vibrant gradient color pairs (mirrors gallery.tsx)
  const gradientColors = useMemo<[string, string]>(() => {
    if (isProCombo) {
      // Premium gold gradient (always for pro-only combos)
      return ['#2b2111', '#b08d57'];
    }
    const key = (type || categoryName || '').toLowerCase();
    if (key.includes('punch')) return ['#ff512f', '#dd2476']; // red → magenta
    if (key.includes('kick')) return ['#7F00FF', '#E100FF']; // violet → pink
    if (key.includes('elbow')) return ['#f7971e', '#ffd200']; // orange → gold
    if (key.includes('knee')) return ['#11998e', '#38ef7d']; // teal → green
    if (key.includes('defense') || key.includes('defence')) return ['#00c6ff', '#0072ff']; // blue spectrum
    if (key.includes('footwork') || key.includes('foot')) return ['#fceabb', '#f8b500']; // pale gold → amber
    return ['#434343', '#000000'];
  }, [type, categoryName, isProCombo]);

  // Responsive sizing
  const bucket = getDeviceBucket();
  // Base responsive sizes
  let titleSize = uiScale(27, { category: 'font' });
  let descSize = uiScale(15, { category: 'font' });
  let lvlSize = uiScale(15, { category: 'font' });
  const iconSize = uiScale(105, { category: 'icon' });

  // Tablet-only adjustments (requested): tighter vertical height but larger text
  // Only apply to 'tablet' bucket, leave 'largeTablet' unchanged.
  const padding = bucket === 'tablet'
    ? uiScale(20, { category: 'spacing' })
    : uiScale(28, { category: 'spacing' });

  const minHeights: Record<string, number> = { phone: 130, phablet: 120, tablet: 120, largeTablet: 130 };
  const minHeight = uiScale(minHeights[bucket as keyof typeof minHeights] || 120, { category: 'spacing' });

  if (bucket === 'tablet') {
    titleSize += 4; // boost readability
    descSize += 2;
    lvlSize += 2;
  }

  return (
    <TouchableOpacity
      style={[
        styles.comboCard,
        { minHeight },
        displayLocked && styles.lockedCard,
        isProCombo && styles.proCard,
      ]}
      onPress={() => { onPress(); }}
      disabled={isLocked}
    >
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.cardGradient, { padding }]}>        
        <View style={styles.titleContainer}>
          <MaterialCommunityIcons
            name={type === 'Punches' ? 'boxing-glove' : type === 'Defense' ? 'shield' : 'karate'}
            size={iconSize}
            color="#02020247"
            style={styles.typeIcon}
          />
          <Text style={[styles.comboTitle, { fontSize: titleSize }, displayLocked && styles.lockedText]} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>{name}</Text>
          {displayLocked && (
            <MaterialCommunityIcons
              name="lock"
              size={uiScale(35, { category: 'icon' })}
              color={Colors.text}
              style={styles.lockIcon}
            />
          )}
        </View>
        <Text style={[styles.comboDescription, { fontSize: descSize, lineHeight: descSize + 4 }, displayLocked && styles.lockedText]}>
          {categoryName ? `${type ?? ''}` : type ?? ''}
        </Text>
        <View style={[styles.levelBadge, displayLocked && styles.lockedLevelBadge]}>
          <Text style={[styles.levelText, { fontSize: lvlSize }, displayLocked && styles.lockedLevelText]}>Level  {level}</Text>
        </View>

        {proLocked && (
          <View pointerEvents="none" style={styles.proOverlay}>
            <View style={styles.proOverlayBadge}>
              <MaterialCommunityIcons name="crown" size={uiScale(16, { category: 'icon' })} color="#1b1b1b" style={{ marginRight: 6 }} />
              <Text style={styles.proOverlayText}>PRO ONLY</Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
});

ComboCard.displayName = 'ComboCard';

const styles = StyleSheet.create({
  comboCard: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 2,
    elevation: 4,
  },
  cardGradient: {
    borderRadius: 12,
  },
  lockedCard: {
    opacity: 0.5,
  },
  proCard: {
    // premium border + subtle glow
    borderWidth: 1,
    borderColor: '#d4af37',
    shadowColor: '#d4af37',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
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
  // Removed inline "Upgrade" button for pro-only cards; using centered overlay instead
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
    top: -18,
    overflow: 'hidden',
    
  },
  comboTitle: {
    fontFamily: Typography.fontFamily,
    color: Colors.text,
    flex: 1,
  },
  comboDescription: {
    color: 'rgba(255, 255, 255, 0.94)',
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
  proOverlay: {
    ...StyleSheet.absoluteFillObject as any,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proOverlayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4d03f',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#b8860b',
  },
  proOverlayText: {
    color: '#1b1b1b',
    fontFamily: Typography.fontFamily,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

export default ComboCard;
