import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CheckIn, QuadrantType } from '../types';
import { useAppTheme } from '../theme/ThemeContext';
import { fonts } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = -85;

interface Props {
  checkIn: CheckIn;
  onEdit?: (checkIn: CheckIn) => void;
  onDelete: (id: string) => void;
}

function getQuadrantBadgeIcon(quadrant: QuadrantType, color: string) {
  switch (quadrant) {
    case 'green':
      return <MaterialIcons name="spa" size={16} color={color} />;
    case 'yellow':
      return <MaterialIcons name="wb-sunny" size={16} color={color} />;
    case 'red':
      return <MaterialIcons name="air" size={16} color={color} />;
    case 'blue':
      return <MaterialIcons name="bedtime" size={16} color={color} />;
    default:
      return <MaterialIcons name="spa" size={16} color={color} />;
  }
}

function getChipIcon(name: string, color: string) {
  const lower = name.toLowerCase();
  if (lower.includes('home')) {
    return <MaterialIcons name="cottage" size={13} color={color} style={styles.chipIcon} />;
  }
  if (lower.includes('work') || lower.includes('studio') || lower.includes('office')) {
    return <MaterialIcons name="domain" size={13} color={color} style={styles.chipIcon} />;
  }
  if (lower.includes('school') || lower.includes('class')) {
    return <MaterialIcons name="apartment" size={13} color={color} style={styles.chipIcon} />;
  }
  if (lower.includes('transit') || lower.includes('commute')) {
    return <MaterialIcons name="commute" size={13} color={color} style={styles.chipIcon} />;
  }
  if (lower.includes('outdoor')) {
    return <MaterialIcons name="nature-people" size={13} color={color} style={styles.chipIcon} />;
  }
  if (lower.includes('gym') || lower.includes('exercise')) {
    return <MaterialIcons name="fitness-center" size={13} color={color} style={styles.chipIcon} />;
  }
  if (lower.includes('cafe') || lower.includes('restaurant')) {
    return <MaterialIcons name="local-cafe" size={13} color={color} style={styles.chipIcon} />;
  }
  if (lower.includes('alone')) {
    return <MaterialIcons name="self-improvement" size={13} color={color} style={styles.chipIcon} />;
  }
  if (lower.includes('friend')) {
    return <MaterialIcons name="group" size={13} color={color} style={styles.chipIcon} />;
  }
  if (lower.includes('coworker') || lower.includes('colleague')) {
    return <MaterialIcons name="badge" size={13} color={color} style={styles.chipIcon} />;
  }
  if (lower.includes('client')) {
    return <MaterialIcons name="support-agent" size={13} color={color} style={styles.chipIcon} />;
  }
  if (lower.includes('family')) {
    return <MaterialIcons name="favorite" size={13} color={color} style={styles.chipIcon} />;
  }
  if (lower.includes('partner') || lower.includes('wife')) {
    return <MaterialIcons name="favorite-border" size={13} color={color} style={styles.chipIcon} />;
  }
  return <MaterialIcons name="label-outline" size={13} color={color} style={styles.chipIcon} />;
}

export const TimelineCard: React.FC<Props> = ({ checkIn, onEdit, onDelete }) => {
  const { theme, isDark } = useAppTheme();
  const qMeta = theme.quadrants[checkIn.quadrant] || theme.quadrants.green;

  const dateObj = new Date(checkIn.timestamp);
  const timeFormatted = dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const translateX = useRef(new Animated.Value(0)).current;
  const isSwiping = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        return isHorizontal && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        isSwiping.current = true;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        } else {
          translateX.setValue(0);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            onDelete(checkIn.id);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
        setTimeout(() => {
          isSwiping.current = false;
        }, 120);
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        isSwiping.current = false;
      },
    })
  ).current;

  const handleCardPress = () => {
    if (!isSwiping.current) {
      onEdit?.(checkIn);
    }
  };

  const deleteOpacity = translateX.interpolate({
    inputRange: [-60, -10, 0],
    outputRange: [1, 0.2, 0],
    extrapolate: 'clamp',
  });

  // Collect Context Place & People chips
  const placeChips = [
    ...(checkIn.contextWhat || []),
    ...(checkIn.contextWhere && !(checkIn.contextWhat || []).includes(checkIn.contextWhere)
      ? [checkIn.contextWhere]
      : []),
  ];
  const peopleChips = checkIn.contextWho || [];
  const somaticChips = checkIn.somaticSensations || [];

  const displayChips = [...placeChips, ...peopleChips, ...somaticChips];

  return (
    <View style={styles.swipeWrapper}>
      {/* Background delete indicator revealed on swipe left */}
      <Animated.View style={[styles.deleteBackground, { opacity: deleteOpacity }]}>
        <Text style={styles.deleteBackgroundText}>DELETE</Text>
      </Animated.View>

      {/* Swipeable Card Foreground */}
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleCardPress}
          style={styles.cardInner}
        >
          {/* Top Row: Quadrant Icon Badge + Emotion Title + Time */}
          <View style={styles.cardTopRow}>
            <View style={styles.badgeAndTitle}>
              <View
                style={[
                  styles.quadrantBadge,
                  {
                    backgroundColor: qMeta.subtleBg,
                  },
                ]}
              >
                {getQuadrantBadgeIcon(checkIn.quadrant, qMeta.color)}
              </View>
              <Text style={[styles.emotionTitle, { color: theme.text }]}>
                {checkIn.primaryEmotion}
              </Text>
            </View>

            <Text style={[styles.timeText, { color: theme.textMuted }]}>
              {timeFormatted}
            </Text>
          </View>

          {/* Middle: Reflection note text */}
          {Boolean(checkIn.triggerNote || checkIn.urgeNote) && (
            <Text style={[styles.noteText, { color: theme.textSecondary }]} numberOfLines={3}>
              {checkIn.triggerNote || checkIn.urgeNote}
            </Text>
          )}

          {/* Bottom Row: Pill tags with icons */}
          {(Boolean(checkIn.intensity) || displayChips.length > 0) && (
            <View style={styles.chipsRow}>
              {Boolean(checkIn.intensity) && (
                <View
                  style={[
                    styles.cardChip,
                    {
                      backgroundColor: isDark ? theme.surfaceSecondary : '#F2EDE3',
                    },
                  ]}
                >
                  <Text style={[styles.cardChipText, { color: theme.textSecondary }]}>
                    {checkIn.intensity}
                  </Text>
                </View>
              )}
              {displayChips.map((chip, i) => (
                <View
                  key={`chip-${i}`}
                  style={[
                    styles.cardChip,
                    {
                      backgroundColor: isDark ? theme.surfaceSecondary : '#F2EDE3',
                    },
                  ]}
                >
                  {getChipIcon(chip, theme.textSecondary)}
                  <Text style={[styles.cardChipText, { color: theme.textSecondary }]}>
                    {chip}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  swipeWrapper: {
    marginVertical: 6,
    position: 'relative',
    justifyContent: 'center',
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#DC2626',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 24,
  },
  deleteBackgroundText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
  },
  cardInner: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgeAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quadrantBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emotionTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    letterSpacing: -0.2,
  },
  timeText: {
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  noteText: {
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 22,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 2,
  },
  cardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  chipIcon: {
    marginRight: 5,
  },
  cardChipText: {
    fontSize: 12,
    fontFamily: fonts.medium,
  },
});
