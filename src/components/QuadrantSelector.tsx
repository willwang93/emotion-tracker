import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { QuadrantType } from '../types';
import { QUADRANTS } from '../constants/moodMeter';

interface Props {
  selectedQuadrant: QuadrantType;
  onSelect: (quadrant: QuadrantType) => void;
}

export const QuadrantSelector: React.FC<Props> = ({ selectedQuadrant, onSelect }) => {
  const handlePress = (quadrant: QuadrantType) => {
    Haptics.selectionAsync();
    onSelect(quadrant);
  };

  const renderQuadrantTile = (quadrant: QuadrantType) => {
    const meta = QUADRANTS[quadrant];
    const isSelected = selectedQuadrant === quadrant;

    return (
      <TouchableOpacity
        key={quadrant}
        activeOpacity={0.8}
        onPress={() => handlePress(quadrant)}
        style={[
          styles.tile,
          {
            backgroundColor: isSelected ? meta.subtleBg : 'rgba(255, 255, 255, 0.04)',
            borderColor: isSelected ? meta.activeBorder : 'rgba(255, 255, 255, 0.1)',
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
      >
        <View style={styles.tileHeader}>
          <Text style={[styles.tileCode, { color: meta.color }]}>
            {quadrant.toUpperCase()}
          </Text>
          <Text style={styles.tileEmoji}>{meta.emoji}</Text>
        </View>

        <View style={styles.tileBody}>
          <Text style={[styles.tileEnergy, isSelected && { color: meta.textColor }]}>
            {meta.energyLabel}
          </Text>
          <Text style={[styles.tilePleasantness, isSelected && { color: meta.textColor }]}>
            {meta.pleasantnessLabel}
          </Text>
        </View>

        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor: meta.color }]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <View style={styles.row}>
          {renderQuadrantTile('red')}
          {renderQuadrantTile('yellow')}
        </View>
        <View style={styles.row}>
          {renderQuadrantTile('blue')}
          {renderQuadrantTile('green')}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  grid: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  tile: {
    flex: 1,
    height: 86,
    borderRadius: 16,
    padding: 10,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tileCode: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tileEmoji: {
    fontSize: 16,
  },
  tileBody: {
    marginTop: 2,
  },
  tileEnergy: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E4E4E7',
  },
  tilePleasantness: {
    fontSize: 11,
    color: '#A1A1AA',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});
