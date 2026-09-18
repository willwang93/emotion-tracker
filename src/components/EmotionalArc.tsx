import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CheckIn, QuadrantType } from '../types';
import { useAppTheme } from '../theme/ThemeContext';
import { fonts } from '../theme';

interface Props {
  checkIns: CheckIn[];
}

function getQuadrantIcon(quadrant: QuadrantType, color: string) {
  switch (quadrant) {
    case 'green':
      return <MaterialIcons name="spa" size={16} color={color} />;
    case 'yellow':
      return <MaterialIcons name="bolt" size={16} color={color} />;
    case 'red':
      return <MaterialIcons name="air" size={16} color={color} />;
    case 'blue':
      return <MaterialIcons name="bedtime" size={16} color={color} />;
    default:
      return <MaterialIcons name="spa" size={16} color={color} />;
  }
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export const EmotionalArc: React.FC<Props> = ({ checkIns }) => {
  const { theme, isDark } = useAppTheme();

  if (!checkIns || checkIns.length === 0) {
    return null;
  }

  // Sort chronologically ascending for the arc timeline
  const sortedCheckIns = [...checkIns].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? theme.surfaceSecondary : '#FFF8EB',
          borderColor: isDark ? theme.border : '#F6E8D0',
        },
      ]}
    >
      <Text style={[styles.title, { color: theme.textSecondary }]}>
        Today's Emotional Arc
      </Text>

      {/* Segmented Timeline Bar */}
      <View style={styles.segmentedBar}>
        {sortedCheckIns.map((item, idx) => {
          const qColor = theme.quadrants[item.quadrant]?.color || theme.btnPrimaryBg;
          return (
            <View
              key={`segment-${item.id}-${idx}`}
              style={[
                styles.barSegment,
                {
                  backgroundColor: qColor,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Checkpoints Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.checkpointsContent}
        style={styles.checkpointsScroll}
      >
        {sortedCheckIns.map((item) => {
          const qMeta = theme.quadrants[item.quadrant] || theme.quadrants.green;
          return (
            <View key={`checkpoint-${item.id}`} style={styles.checkpointItem}>
              <View
                style={[
                  styles.checkpointBadge,
                  {
                    backgroundColor: qMeta.subtleBg,
                  },
                ]}
              >
                {getQuadrantIcon(item.quadrant, qMeta.color)}
              </View>
              <Text
                style={[styles.emotionLabel, { color: theme.text }]}
                numberOfLines={1}
              >
                {item.primaryEmotion}
              </Text>
              <Text style={[styles.timeLabel, { color: theme.textMuted }]}>
                {formatTime(item.timestamp)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    marginBottom: 20,
    elevation: 0,
    shadowOpacity: 0,
  },
  title: {
    fontSize: 13,
    fontFamily: fonts.bold,
    letterSpacing: 0.2,
    marginBottom: 14,
  },
  segmentedBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 9999,
    overflow: 'hidden',
    gap: 4,
    marginBottom: 16,
  },
  barSegment: {
    flex: 1,
    height: '100%',
    borderRadius: 9999,
  },
  checkpointsScroll: {
    marginHorizontal: -4,
  },
  checkpointsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: 4,
  },
  checkpointItem: {
    alignItems: 'center',
    minWidth: 64,
  },
  checkpointBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emotionLabel: {
    fontSize: 12,
    fontFamily: fonts.bold,
    marginBottom: 2,
    textAlign: 'center',
  },
  timeLabel: {
    fontSize: 11,
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
});
