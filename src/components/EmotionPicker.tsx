import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { QuadrantType, EmotionItem } from '../types';
import { EMOTIONS, QUADRANTS } from '../constants/moodMeter';
import { useAppTheme } from '../theme/ThemeContext';

interface Props {
  quadrant: QuadrantType;
  selectedEmotion: string;
  onSelectEmotion: (emotion: string) => void;
  intensity: number;
  onChangeIntensity: (intensity: number) => void;
}

export const EmotionPicker: React.FC<Props> = ({
  quadrant,
  selectedEmotion,
  onSelectEmotion,
  intensity,
  onChangeIntensity,
}) => {
  const { theme, isDark } = useAppTheme();
  const qMeta = theme.quadrants[quadrant] || theme.quadrants.red;
  const emotionsList = EMOTIONS[quadrant] || [];
  const meta = QUADRANTS[quadrant];

  // Selected item object to extract definition
  const currentEmotionItem =
    emotionsList.find((e) => e.name.toLowerCase() === selectedEmotion.toLowerCase()) ||
    emotionsList[0];

  const handleSelectEmotion = (emotionName: string) => {
    Haptics.selectionAsync();
    onSelectEmotion(emotionName);
  };

  const handleIntensityChange = (newVal: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChangeIntensity(newVal);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Name The Feeling</Text>
      </View>

      {/* Emotion Chips */}
      <View style={[styles.chipsWrapper, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
        <ScrollView
          nestedScrollEnabled
          contentContainerStyle={styles.chipsContainer}
          showsVerticalScrollIndicator={true}
        >
          {emotionsList.map((item) => {
            const isSelected = selectedEmotion.toLowerCase() === item.name.toLowerCase();
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleSelectEmotion(item.name)}
                style={[
                  styles.emotionChip,
                  isSelected
                    ? {
                        backgroundColor: qMeta.color,
                        borderColor: qMeta.color,
                        shadowColor: qMeta.color,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: isDark ? 0.35 : 0.2,
                        shadowRadius: 4,
                        elevation: 3,
                      }
                    : {
                        backgroundColor: isDark ? '#27272A' : theme.surface,
                        borderColor: theme.border,
                      },
                ]}
              >
                <Text
                  style={[
                    styles.emotionChipText,
                    isSelected ? styles.emotionChipTextSelected : { color: theme.text, fontWeight: '500' },
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Word Definition Banner */}
      {currentEmotionItem && (
        <View
          style={[
            styles.definitionCard,
            {
              backgroundColor: qMeta.subtleBg,
              borderColor: isDark ? qMeta.color : qMeta.activeBorder,
            },
          ]}
        >
          <View style={styles.definitionHeader}>
            <View style={styles.wordAndBadge}>
              <Text style={[styles.definitionLabel, { color: theme.textMuted }]}>Definition:</Text>
              <Text style={[styles.definitionWord, { color: isDark ? '#FFFFFF' : qMeta.color }]}>{currentEmotionItem.name}</Text>
            </View>
          </View>
          <Text style={[styles.definitionBody, { color: theme.text }]}>{currentEmotionItem.definition}</Text>
        </View>
      )}

      {/* Intensity Selector (1 - 10) */}
      <View style={[styles.intensityContainer, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
        <View style={styles.intensityHeader}>
          <Text style={[styles.intensityTitle, { color: theme.textMuted }]}>Intensity</Text>
        </View>
        <View style={styles.intensityPillsRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const isSelected = intensity === num;
            return (
              <TouchableOpacity
                key={num}
                onPress={() => handleIntensityChange(num)}
                style={[
                  styles.intensityPill,
                  isSelected
                    ? {
                        backgroundColor: qMeta.color,
                        borderColor: qMeta.color,
                        shadowColor: qMeta.color,
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: isDark ? 0.35 : 0.2,
                        shadowRadius: 3,
                        elevation: 2,
                      }
                    : {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                      },
                ]}
              >
                <Text
                  style={[
                    styles.intensityPillText,
                    isSelected ? styles.intensityPillTextSelected : { color: theme.textMuted },
                  ]}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#D4D4D8',
  },
  chipsWrapper: {
    maxHeight: 280,
    backgroundColor: 'rgba(24, 24, 27, 0.6)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272A',
    padding: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  emotionChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  emotionChipDefault: {
    backgroundColor: '#27272A',
    borderColor: '#3F3F46',
  },
  emotionChipText: {
    fontSize: 12,
  },
  emotionChipTextDefault: {
    color: '#D4D4D8',
    fontWeight: '500',
  },
  emotionChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  definitionCard: {
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  definitionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  wordAndBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  definitionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A1A1AA',
    textTransform: 'uppercase',
  },
  definitionWord: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  quadrantPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  quadrantPillText: {
    fontSize: 9,
    fontWeight: '600',
  },
  definitionBody: {
    fontSize: 11,
    lineHeight: 16,
    color: '#E4E4E7',
  },
  intensityContainer: {
    marginTop: 10,
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  intensityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  intensityTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  intensityPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  intensityPill: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  intensityPillDefault: {
    backgroundColor: '#27272A',
    borderColor: '#3F3F46',
  },
  intensityPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  intensityPillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
