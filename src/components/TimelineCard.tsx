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
import * as Haptics from 'expo-haptics';
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
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
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

  const kickerDetails = [locationPart, whoPart].filter(Boolean).join(' ');
  const kickerFull = kickerDetails ? `${timeFormatted} · ${kickerDetails}` : timeFormatted;

  // Hero quote: User's reflection text
  const reflectionText = checkIn.triggerNote || checkIn.urgeNote || `Noticed a quiet sense of feeling ${checkIn.primaryEmotion.toLowerCase()}.`;

  // Body areas summary
  const bodySummary = checkIn.somaticSensations && checkIn.somaticSensations.length > 0
    ? ` · ${checkIn.somaticSensations.join(', ')}`
    : '';

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
            backgroundColor: isDark ? 'rgba(17, 24, 39, 0.85)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : theme.border,
            borderLeftColor: qMeta.color,
            borderLeftWidth: 3,
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={handleCardPress}
          style={styles.cardInner}
        >
          {/* Top Kicker: Typewriter Monospace */}
          <Text style={[styles.kickerText, { color: theme.textMuted }]}>
            {kickerFull}
          </Text>

          {/* Hero Quote: Editorial Serif Italic */}
          <View style={styles.quoteWrapper}>
            <Text
              style={[
                styles.heroQuote,
                {
                  color: theme.text,
                },
              ]}
            >
              “{reflectionText}”
            </Text>
          </View>

          {/* Byline: Typewriter Monospace with Quadrant Color Accent */}
          <View style={styles.bylineRow}>
            <Text style={[styles.bylineDash, { color: qMeta.color }]}>—</Text>
            <Text style={[styles.bylineEmotion, { color: qMeta.color }]}>
              {checkIn.primaryEmotion.toUpperCase()}
            </Text>
            <Text style={[styles.bylineDetails, { color: theme.textSubtle }]}>
              {` · Intensity ${checkIn.intensity}${bodySummary}`}
            </Text>
          </View>
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
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 20,
  },
  deleteBackgroundText: {
    color: '#FFFFFF',
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardInner: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  kickerText: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  quoteWrapper: {
    marginBottom: 10,
  },
  heroQuote: {
    fontFamily: 'serif',
    fontStyle: 'italic',
    fontSize: 17,
    lineHeight: 25,
    letterSpacing: -0.2,
  },
  bylineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  bylineDash: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
    marginRight: 6,
  },
  bylineEmotion: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  bylineDetails: {
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: 0.4,
  },
});
