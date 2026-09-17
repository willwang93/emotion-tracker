import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { QuadrantType } from '../types';
import { useAppTheme } from '../theme/ThemeContext';

interface Props {
  selectedQuadrant: QuadrantType;
  onSelect: (quadrant: QuadrantType) => void;
}

const QUADRANT_DATA: Record<QuadrantType, { line1: string; line2: string }> = {
  red: { line1: 'High energy', line2: 'Unpleasant' },
  yellow: { line1: 'High energy', line2: 'Pleasant' },
  blue: { line1: 'Low energy', line2: 'Unpleasant' },
  green: { line1: 'Low energy', line2: 'Pleasant' },
};

export const QuadrantSelector: React.FC<Props> = ({ selectedQuadrant, onSelect }) => {
  const { theme, isDark } = useAppTheme();

  const handlePress = (quadrant: QuadrantType) => {
    onSelect(quadrant);
  };

  const renderTile = (quadrant: QuadrantType) => {
    const qMeta = theme.quadrants[quadrant];
    const item = QUADRANT_DATA[quadrant];
    const isSelected = selectedQuadrant === quadrant;

    return (
      <TouchableOpacity
        key={quadrant}
        activeOpacity={0.85}
        onPress={() => handlePress(quadrant)}
        style={[
          styles.tile,
          {
            backgroundColor: isSelected
              ? qMeta.subtleBg
              : isDark
              ? 'rgba(255, 255, 255, 0.03)'
              : theme.surfaceSecondary,
            borderColor: isSelected
              ? qMeta.activeBorder
              : isDark
              ? 'rgba(255, 255, 255, 0.08)'
              : theme.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.line1,
            {
              color: isSelected
                ? (isDark ? '#FFFFFF' : qMeta.color)
                : theme.text,
            },
          ]}
        >
          {item.line1}
        </Text>
        <Text
          style={[
            styles.line2,
            {
              color: isSelected
                ? (isDark ? qMeta.textColor : qMeta.color)
                : theme.textMuted,
            },
          ]}
        >
          {item.line2}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <View style={styles.row}>
          {renderTile('red')}
          {renderTile('yellow')}
        </View>
        <View style={styles.row}>
          {renderTile('blue')}
          {renderTile('green')}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  grid: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  tile: {
    flex: 1,
    height: 84,
    borderRadius: 14,
    padding: 14,
    justifyContent: 'center',
  },
  line1: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  line2: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
