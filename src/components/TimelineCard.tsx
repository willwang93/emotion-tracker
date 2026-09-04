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
import { QUADRANTS } from '../constants/moodMeter';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = -85;

interface Props {
  checkIn: CheckIn;
  onEdit?: (checkIn: CheckIn) => void;
  onDelete: (id: string) => void;
}

export const TimelineCard: React.FC<Props> = ({ checkIn, onEdit, onDelete }) => {
  const meta = QUADRANTS[checkIn.quadrant] || QUADRANTS.red;

  const dateObj = new Date(checkIn.timestamp);
  const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const translateX = useRef(new Animated.Value(0)).current;
  const isSwiping = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Capture horizontal swipe left
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        return isHorizontal && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        isSwiping.current = true;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow swiping to the left
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

  return (
    <View style={styles.swipeWrapper}>
      {/* Background delete indicator revealed on swipe left */}
      <Animated.View style={[styles.deleteBackground, { opacity: deleteOpacity }]}>
        <Text style={styles.deleteBackgroundText}>🗑️ Delete</Text>
      </Animated.View>

      {/* Swipeable Card Foreground */}
      <Animated.View
        style={[
          styles.card,
          {
            borderColor: meta.badgeBg,
            backgroundColor: '#18181B',
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleCardPress}
        >
          {/* Card Header */}
          <View style={styles.header}>
            <View style={styles.emotionTitleRow}>
              <View style={[styles.colorDot, { backgroundColor: meta.color }]} />
              <Text style={[styles.emotionText, { color: meta.textColor }]}>
                {checkIn.primaryEmotion}
              </Text>
            </View>

            <Text style={styles.timeText}>{timeFormatted}</Text>
          </View>

          {/* Intensity and Context Summary */}
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              Intensity: <Text style={styles.boldText}>{checkIn.intensity} / 10</Text>
            </Text>
            {checkIn.contextWho.length > 0 && (
              <>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.metaText}>
                  With: <Text style={[styles.boldText, checkIn.contextWho.includes('Wife') && styles.wifeHighlight]}>
                    {checkIn.contextWho.join(', ')}
                  </Text>
                </Text>
              </>
            )}
            {checkIn.contextWhat.length > 0 && (
              <>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.metaText}>
                  Doing: <Text style={styles.boldText}>{checkIn.contextWhat.join(', ')}</Text>
                </Text>
              </>
            )}
            {checkIn.contextWhere && (
              <>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.metaText}>@{checkIn.contextWhere}</Text>
              </>
            )}
          </View>

          {/* Trigger & Urge Notes */}
          {(checkIn.triggerNote || checkIn.urgeNote) && (
            <View style={styles.notesBox}>
              {checkIn.triggerNote && (
                <Text style={styles.noteLine}>
                  <Text style={styles.noteLabel}>Trigger: </Text>
                  {checkIn.triggerNote}
                </Text>
              )}
              {checkIn.urgeNote && (
                <Text style={[styles.noteLine, checkIn.triggerNote && styles.noteLineSpacing]}>
                  <Text style={styles.noteLabel}>Urge / Behavior: </Text>
                  {checkIn.urgeNote}
                </Text>
              )}
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
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 20,
  },
  deleteBackgroundText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emotionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  emotionText: {
    fontSize: 16,
    fontWeight: '800',
  },
  timeText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#A1A1AA',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#A1A1AA',
  },
  boldText: {
    color: '#F4F4F5',
    fontWeight: '700',
  },
  wifeHighlight: {
    color: '#FDA4AF',
    fontWeight: '800',
  },
  dotSeparator: {
    color: '#52525B',
    marginHorizontal: 5,
  },
  notesBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginTop: 6,
  },
  noteLine: {
    fontSize: 11,
    color: '#D4D4D8',
    lineHeight: 16,
  },
  noteLineSpacing: {
    marginTop: 4,
  },
  noteLabel: {
    fontWeight: '700',
    color: '#A1A1AA',
  },
});
