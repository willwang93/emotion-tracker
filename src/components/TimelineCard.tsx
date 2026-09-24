import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Image,
} from 'react-native';
import { CheckIn, QuadrantType } from '../types';
import { useAppTheme } from '../theme/ThemeContext';
import { AppText } from './ui/AppText';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = -85;

const QUADRANT_HEADSHOTS: Record<QuadrantType, any> = {
  yellow: require('../../assets/headshots/headshot_high_pleasant.png'),
  green: require('../../assets/headshots/headshot_low_pleasant.png'),
  blue: require('../../assets/headshots/headshot_low_unpleasant.png'),
  red: require('../../assets/headshots/headshot_high_unpleasant.png'),
};

interface Props {
  checkIn: CheckIn;
  onEdit?: (checkIn: CheckIn) => void;
  onDelete: (id: string) => void;
}

export const TimelineCard: React.FC<Props> = ({ checkIn, onEdit, onDelete }) => {
  const { theme } = useAppTheme();

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

  const noteContent = checkIn.triggerNote || checkIn.urgeNote || '';

  return (
    <View style={styles.swipeWrapper}>
      {/* Background delete indicator revealed on swipe left */}
      <Animated.View
        style={[
          styles.deleteBackground,
          { backgroundColor: theme.quadrants.red.color, opacity: deleteOpacity },
        ]}
      >
        <AppText variant="caption" bold color={theme.btnPrimaryText} style={styles.deleteBackgroundText}>
          DELETE
        </AppText>
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
          {/* Arrangement: Header row (Title + Time on left, Illustration on right), Note below */}
          <View style={styles.headerRow}>
            <View style={styles.titleBlock}>
              <AppText variant="heading2" color="primary" style={styles.emotionTitle}>
                {checkIn.primaryEmotion}
              </AppText>
              <AppText variant="caption" color="muted" style={styles.timeText}>
                {timeFormatted}
              </AppText>
            </View>

            <Image
              source={QUADRANT_HEADSHOTS[checkIn.quadrant] || QUADRANT_HEADSHOTS.green}
              style={styles.rightIllustration}
              resizeMode="contain"
            />
          </View>

          {Boolean(noteContent) && (
            <AppText variant="bodySmall" color="secondary" style={styles.noteText}>
              {noteContent}
            </AppText>
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
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 24,
  },
  deleteBackgroundText: {
    fontSize: 12,
    letterSpacing: 1.5,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    elevation: 0,
    shadowOpacity: 0,
  },
  cardInner: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
    paddingRight: 12,
  },
  rightIllustration: {
    width: 68,
    height: 68,
    flexShrink: 0,
  },
  emotionTitle: {
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 13,
  },
  noteText: {
    marginTop: 12,
    lineHeight: 21,
  },
});
