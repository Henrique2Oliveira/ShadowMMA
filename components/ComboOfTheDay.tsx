import { Colors, Typography } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Move {
  move: string;
  pauseTime: number;
  direction: "left" | "right" | "up" | "down";
  tiltValue: number;
  comboName?: string;
  comboIndex?: number;
  moveIndex?: number;
}

interface ComboOfTheDayProps {
  combo?: {
    name?: string;
    title?: string;
    level?: number;
    type?: string;
    description?: string;
    moves?: Move[] | string[];
    comboId?: string | number;
  };
  loading?: boolean;
  onPress?: () => void;
}

export const ComboOfTheDay: React.FC<ComboOfTheDayProps> = ({
  combo,
  loading = false,
  onPress,
}) => {
  // Get icon based on move type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Kicks':
        return 'karate';
      case 'Defense':
        return 'shield';
      case 'Punches':
      default:
        return 'boxing-glove';
    }
  };

  // Get type color based on move type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Kicks':
        return '#ff6b35';
      case 'Defense':
        return '#4a90e2';
      case 'Punches':
      default:
        return '#fdd700';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="star"
            size={24}
            color="#fdd700"
          />
          <Text style={styles.title}>Combo of the Day</Text>
          <MaterialCommunityIcons 
            name="loading" 
            size={24} 
            color={Colors.text} 
          />
        </View>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>Loading today's combo...</Text>
        </View>
      </View>
    );
  }

  if (!combo) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="star"
            size={24}
            color="#fdd700"
          />
          <Text style={styles.title}>Combo of the Day</Text>
          <MaterialCommunityIcons 
            name="alert-circle" 
            size={24} 
            color="#ff6b35" 
          />
        </View>
        <View style={styles.errorContent}>
          <Text style={styles.errorText}>Unable to load today's combo</Text>
        </View>
      </View>
    );
  }

  const comboName = combo.name || combo.title || `Combo ${combo.comboId || ''}`;
  const typeColor = getTypeColor(combo.type || 'Punches');
  const typeIcon = getTypeIcon(combo.type || 'Punches');

  // Function to extract move text from Move objects or strings
  const formatMoves = (moves: Move[] | string[]) => {
    return moves.map((move, index) => {
      if (typeof move === 'object' && move.move) {
        return move.move.replace(/\n/g, ' ');
      }
      return typeof move === 'string' ? move : '';
    }).filter(move => move.length > 0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="star"
          size={24}
          color="#fdd700"
        />
  <Text style={styles.title}>Combo of the Day</Text>
      </View>

      <View style={styles.comboContainer}>
        <LinearGradient
          colors={['#1a1a1aff', 'rgba(54, 15, 15, 1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.comboGradient}
        >
          <View style={styles.comboHeader}>
            <View style={styles.comboNameContainer}>
              <MaterialCommunityIcons
                name={typeIcon as any}
                size={20}
                color={typeColor}
                style={styles.comboIcon}
              />
              <Text style={styles.comboName}>{comboName}</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lvl {combo.level || 0}</Text>
            </View>
          </View>

          {combo.moves && combo.moves.length > 0 && (
            <View style={styles.movesContainer}>
              <Text style={styles.moveText}>
                {formatMoves(combo.moves ?? []).map((move, moveIndex) => (
                  <Text key={moveIndex}>
                    {move}
                    {moveIndex < formatMoves(combo.moves ?? []).length - 1 ? '   →   ' : ''}
                  </Text>
                ))}
              </Text>
            </View>
          )}

          {combo.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.description} numberOfLines={2}>
                {combo.description}
              </Text>
            </View>
          )}
        </LinearGradient>
        
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1b1b1bff',
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#c5c5c593',
    borderBottomWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  comboContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#edededff',
    borderBottomWidth: 6,
  },
  comboGradient: {
    padding: 15,
    paddingBottom: 17,
  },
  comboHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  comboNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  comboIcon: {
    marginRight: 8,
  },
  comboName: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: Typography.fontFamily,
    fontWeight: '600',
    flex: 1,
  },
  levelBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    zIndex: 1,
    backgroundColor: "#6c1818fd",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
    borderColor: '#b82929ff',
    borderWidth: 2,
    borderBottomWidth: 4,
  },
  levelText: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: Typography.fontFamily,
  },
  movesContainer: {
    flexDirection: 'column',
    padding: 3,
    alignItems: 'flex-start',
  },
  moveText: {
    color: "white",
    backgroundColor: '#fafafa25',
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
    fontFamily: Typography.fontFamily,
    lineHeight: 22,
    flexShrink: 1,
  },
  descriptionContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    borderRadius: 8,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: Typography.fontFamily,
    lineHeight: 20,
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontFamily: Typography.fontFamily,
  },
  errorContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: '#ff6b35',
    fontSize: 14,
    fontFamily: Typography.fontFamily,
  },
  
});
