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
import { CheckIn } from '../types';
import { useAppTheme } from '../theme/ThemeContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = -85;

interface Props {
  checkIn: CheckIn;
  onEdit?: (checkIn: CheckIn) => void;
  onDelete: (id: string) => void;
}

export const TimelineCard: React.FC<Props> = ({ checkIn, onEdit, onDelete }) => {
  const { theme, isDark } = useAppTheme();
  const qMeta = theme.quadrants[checkIn.quadrant] || theme.quadrants.red;

  const dateObj = new Date(checkIn.timestamp);
  const timeFormatted = dateObj
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    .toUpperCase();

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

  // Construct location & company kicker
  // e.g. "09:15 AM · AT THE OFFICE DESK WITH WIFE"
  const locationPart = checkIn.contextWhere ? `AT THE ${checkIn.contextWhere.toUpperCase()}` : '';
  const whoPart = checkIn.contextWho && checkIn.contextWho.length > 0
    ? (checkIn.contextWho.includes('Alone') ? 'ALONE' : `WITH ${checkIn.contextWho.join(', ').toUpperCase()}`)
    : '';

  const allChips = [
    ...(checkIn.somaticSensations || []),
    ...(checkIn.contextWhat || (checkIn.contextWhere ? [checkIn.contextWhere] : [])),
  ];

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
          activeOpacity={0.85}
          onPress={handleCardPress}
          style={styles.cardInner}
        >
          {/* Top Row: Tabular Time & Quadrant Dot */}
          <View style={styles.cardTopRow}>
            <Text style={[styles.timeText, { color: theme.textMuted }]}>
              {timeFormatted}
            </Text>
            <View style={[styles.quadrantDot, { backgroundColor: qMeta.color }]} />
          </View>

          {/* Middle Section: Emotion & Note */}
          <View style={styles.middleSection}>
            <Text style={[styles.emotionTitle, { color: theme.text }]}>
              {checkIn.primaryEmotion}
            </Text>
            {Boolean(checkIn.triggerNote || checkIn.urgeNote) && (
              <Text style={[styles.noteText, { color: theme.textSecondary }]} numberOfLines={2}>
                "{checkIn.triggerNote || checkIn.urgeNote}"
              </Text>
            )}
          </View>

          {/* Bottom Row: Somatics & Locations */}
          {allChips.length > 0 && (
            <View style={styles.chipsRow}>
              {allChips.map((chip, i) => (
                <View key={i} style={[styles.cardChip, { backgroundColor: theme.chipBg }]}>
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
    marginVertical: 5,
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
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 20,
  },
  deleteBackgroundText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
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
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  quadrantDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  middleSection: {
    marginBottom: 10,
  },
  emotionTitle: {
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: '400',
  },
  noteText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 19,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 4,
  },
  cardChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
