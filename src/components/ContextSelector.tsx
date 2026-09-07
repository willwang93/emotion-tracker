import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CONTEXT_WHO, CONTEXT_WHAT, CONTEXT_WHERE } from '../constants/moodMeter';
import { useAppTheme } from '../theme/ThemeContext';

interface Props {
  selectedWho: string[];
  onChangeWho: (who: string[]) => void;
  selectedWhat: string[];
  onChangeWhat: (what: string[]) => void;
  selectedWhere?: string;
  onChangeWhere: (where: string) => void;
  accentColor: string;
}

export const ContextSelector: React.FC<Props> = ({
  selectedWho,
  onChangeWho,
  selectedWhat,
  onChangeWhat,
  selectedWhere,
  onChangeWhere,
  accentColor,
}) => {
  const { theme, isDark } = useAppTheme();
  const [customWhoInput, setCustomWhoInput] = useState('');
  const [customWhoList, setCustomWhoList] = useState<string[]>([]);

  const [customWhatInput, setCustomWhatInput] = useState('');
  const [customWhatList, setCustomWhatList] = useState<string[]>([]);

  const toggleWho = (item: string) => {
    Haptics.selectionAsync();
    if (selectedWho.includes(item)) {
      onChangeWho(selectedWho.filter((w) => w !== item));
    } else {
      onChangeWho([...selectedWho, item]);
    }
  };

  const handleAddCustomWho = () => {
    const trimmed = customWhoInput.trim();
    if (!trimmed) return;
    if (!customWhoList.includes(trimmed) && !CONTEXT_WHO.includes(trimmed)) {
      setCustomWhoList([...customWhoList, trimmed]);
    }
    if (!selectedWho.includes(trimmed)) {
      onChangeWho([...selectedWho, trimmed]);
    }
    setCustomWhoInput('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleWhat = (item: string) => {
    Haptics.selectionAsync();
    if (selectedWhat.includes(item)) {
      onChangeWhat(selectedWhat.filter((w) => w !== item));
    } else {
      onChangeWhat([...selectedWhat, item]);
    }
  };

  const handleAddCustomWhat = () => {
    const trimmed = customWhatInput.trim();
    if (!trimmed) return;
    if (!customWhatList.includes(trimmed) && !CONTEXT_WHAT.includes(trimmed)) {
      setCustomWhatList([...customWhatList, trimmed]);
    }
    if (!selectedWhat.includes(trimmed)) {
      onChangeWhat([...selectedWhat, trimmed]);
    }
    setCustomWhatInput('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleWhere = (item: string) => {
    Haptics.selectionAsync();
    onChangeWhere(selectedWhere === item ? '' : item);
  };

  const customWhoFromSelected = selectedWho.filter((w) => !CONTEXT_WHO.includes(w));
  const allWho = Array.from(new Set([...CONTEXT_WHO, ...customWhoList, ...customWhoFromSelected]));

  const customWhatFromSelected = selectedWhat.filter((w) => !CONTEXT_WHAT.includes(w));
  const allWhat = Array.from(new Set([...CONTEXT_WHAT, ...customWhatList, ...customWhatFromSelected]));

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Context</Text>

      <View style={[styles.box, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {/* Who Section */}
        <View style={styles.subSection}>
          <Text style={[styles.subTitle, { color: theme.textMuted }]}>Who are you with?</Text>
          <View style={styles.chipsContainer}>
            {allWho.map((item) => {
              const isSelected = selectedWho.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => toggleWho(item)}
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
                          backgroundColor: isDark ? '#27272A' : theme.surfaceSecondary,
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

          {/* Custom Who Input */}
          <View style={styles.customRow}>
            <TextInput
              placeholder="+ Add custom person / tag..."
              placeholderTextColor={theme.textSubtle}
              value={customWhoInput}
              onChangeText={setCustomWhoInput}
              onSubmitEditing={handleAddCustomWho}
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
              onPress={handleAddCustomWho}
              disabled={!customWhoInput.trim()}
              style={[
                styles.addBtn,
                customWhoInput.trim()
                  ? { backgroundColor: accentColor }
                  : { backgroundColor: theme.surfaceSecondary },
              ]}
            >
              <Text
                style={[
                  styles.addBtnText,
                  { color: customWhoInput.trim() ? '#FFFFFF' : theme.textMuted },
                ]}
              >
                Add
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* What Section */}
        <View style={[styles.subSection, styles.borderTop, { borderTopColor: theme.divider }]}>
          <Text style={[styles.subTitle, { color: theme.textMuted }]}>What are you doing? (Activities)</Text>
          <View style={styles.chipsContainer}>
            {allWhat.map((item) => {
              const isSelected = selectedWhat.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => toggleWhat(item)}
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
                          backgroundColor: isDark ? '#27272A' : theme.surfaceSecondary,
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

          {/* Custom What Input */}
          <View style={styles.customRow}>
            <TextInput
              placeholder="+ Add custom activity..."
              placeholderTextColor={theme.textSubtle}
              value={customWhatInput}
              onChangeText={setCustomWhatInput}
              onSubmitEditing={handleAddCustomWhat}
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
              onPress={handleAddCustomWhat}
              disabled={!customWhatInput.trim()}
              style={[
                styles.addBtn,
                customWhatInput.trim()
                  ? { backgroundColor: accentColor }
                  : { backgroundColor: theme.surfaceSecondary },
              ]}
            >
              <Text
                style={[
                  styles.addBtnText,
                  { color: customWhatInput.trim() ? '#FFFFFF' : theme.textMuted },
                ]}
              >
                Add
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Where Section */}
        <View style={[styles.subSection, styles.borderTop, { borderTopColor: theme.divider }]}>
          <Text style={[styles.subTitle, { color: theme.textMuted }]}>Where are you?</Text>
          <View style={styles.chipsContainer}>
            {CONTEXT_WHERE.map((item) => {
              const isSelected = selectedWhere === item;
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => toggleWhere(item)}
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
                          backgroundColor: isDark ? '#27272A' : theme.surfaceSecondary,
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
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#D4D4D8',
    marginBottom: 6,
  },
  box: {
    backgroundColor: '#18181B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272A',
    padding: 10,
  },
  subSection: {
    marginBottom: 8,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#27272A',
    paddingTop: 8,
  },
  subTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A1A1AA',
    marginBottom: 6,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipDefault: {
    backgroundColor: '#27272A',
    borderColor: '#3F3F46',
  },
  chipText: {
    fontSize: 11,
  },
  chipTextDefault: {
    color: '#D4D4D8',
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
    backgroundColor: '#27272A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3F3F46',
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
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    backgroundColor: '#3F3F46',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});
