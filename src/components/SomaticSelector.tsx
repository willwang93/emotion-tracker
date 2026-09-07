import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SOMATIC_SENSATIONS } from '../constants/moodMeter';
import { useAppTheme } from '../theme/ThemeContext';

interface Props {
  selectedSensations: string[];
  onChange: (sensations: string[]) => void;
  accentColor: string;
}

export const SomaticSelector: React.FC<Props> = ({
  selectedSensations,
  onChange,
  accentColor,
}) => {
  const { theme, isDark } = useAppTheme();
  const [customInput, setCustomInput] = useState('');
  const [customList, setCustomList] = useState<string[]>([]);

  const toggleSensation = (item: string) => {
    Haptics.selectionAsync();
    if (selectedSensations.includes(item)) {
      onChange(selectedSensations.filter((s) => s !== item));
    } else {
      onChange([...selectedSensations, item]);
    }
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (!customList.includes(trimmed) && !SOMATIC_SENSATIONS.includes(trimmed)) {
      setCustomList([...customList, trimmed]);
    }
    if (!selectedSensations.includes(trimmed)) {
      onChange([...selectedSensations, trimmed]);
    }
    setCustomInput('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const customFromSelected = selectedSensations.filter((s) => !SOMATIC_SENSATIONS.includes(s));
  const allSensations = Array.from(new Set([...SOMATIC_SENSATIONS, ...customList, ...customFromSelected]));

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Body Sensations</Text>
      </View>

      <View style={styles.chipsContainer}>
        {allSensations.map((item) => {
          const isSelected = selectedSensations.includes(item);
          return (
            <TouchableOpacity
              key={item}
              onPress={() => toggleSensation(item)}
              style={[
                styles.chip,
                isSelected
                  ? {
                      backgroundColor: accentColor,
                      borderColor: accentColor,
                      shadowColor: accentColor,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: isDark ? 0.35 : 0.15,
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
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : { color: theme.text, fontWeight: '500' },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Freeform Short Custom Input */}
      <View style={styles.customRow}>
        <TextInput
          placeholder="+ Add custom physical sensation..."
          placeholderTextColor={theme.textSubtle}
          value={customInput}
          onChangeText={setCustomInput}
          onSubmitEditing={handleAddCustom}
          returnKeyType="done"
          style={[
            styles.customInput,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
        />
        <TouchableOpacity
          onPress={handleAddCustom}
          disabled={!customInput.trim()}
          style={[
            styles.addBtn,
            customInput.trim()
              ? { backgroundColor: accentColor }
              : { backgroundColor: theme.surfaceSecondary },
          ]}
        >
          <Text
            style={[
              styles.addBtnText,
              { color: customInput.trim() ? '#FFFFFF' : theme.textMuted },
            ]}
          >
            Add
          </Text>
        </TouchableOpacity>
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
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipDefault: {
    backgroundColor: '#18181B',
    borderColor: '#27272A',
  },
  chipText: {
    fontSize: 11,
  },
  chipTextDefault: {
    color: '#A1A1AA',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  customInput: {
    flex: 1,
    height: 36,
    backgroundColor: '#18181B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#27272A',
    paddingHorizontal: 10,
    paddingVertical: 0,
    color: '#F4F4F5',
    fontSize: 12,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  addBtn: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    backgroundColor: '#27272A',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});
