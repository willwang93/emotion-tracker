import React, { useState, useEffect, useCallback } from 'react';
import { Modal, View, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';
import { AppText } from './ui/AppText';
import { AppButton } from './ui/AppButton';
import { AppChip } from './ui/AppChip';
import { AppCard } from './ui/AppCard';
import { AppModalLayout } from './ui/AppModalLayout';
import { getCheckInsForMonth, getAllCheckIns } from '../services/db';
import { formatCheckInsToMarkdown, exportMarkdownFile } from '../services/export';
import { CheckIn } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type ExportScope = 'september_2026' | 'all_time';

export const ExportModal: React.FC<Props> = ({ visible, onClose }) => {
  const { theme } = useAppTheme();
  const [scope, setScope] = useState<ExportScope>('september_2026');
  const [entries, setEntries] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    setExportSuccess(false);
    try {
      if (scope === 'september_2026') {
        // Month index 8 is September (0-indexed)
        const data = await getCheckInsForMonth(2026, 8);
        setEntries(data);
      } else {
        const data = await getAllCheckIns();
        setEntries(data);
      }
    } catch (err) {
      console.error('Failed to load entries for export:', err);
    } finally {
      setIsLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    if (visible) {
      loadEntries();
    }
  }, [visible, loadEntries]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filename =
        scope === 'september_2026'
          ? 'September-2026-Emotion-Entries.md'
          : 'Emotion-Entries-All-Time.md';

      const title =
        scope === 'september_2026'
          ? 'Emotion Entries — September 2026'
          : 'Emotion Entries — Complete Archive';

      const markdown = formatCheckInsToMarkdown(entries, title);
      await exportMarkdownFile(markdown, filename);
      setExportSuccess(true);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <AppModalLayout
        title="Export Entries"
        onClose={onClose}
        footer={
          <View style={styles.footerContainer}>
            <AppButton
              title={
                isExporting
                  ? 'Generating export...'
                  : exportSuccess
                  ? 'Share Again'
                  : 'Export Markdown File'
              }
              variant="primary"
              disabled={isLoading || isExporting || entries.length === 0}
              icon={
                isExporting ? (
                  <ActivityIndicator size="small" color={theme.btnPrimaryText} />
                ) : (
                  <MaterialIcons name="file-download" size={20} color={theme.btnPrimaryText} />
                )
              }
              iconPosition="left"
              onPress={handleExport}
            />
          </View>
        }
      >
        <View style={styles.content}>
          <AppText variant="heading2" color="primary" style={styles.sectionHeader}>
            Export Range
          </AppText>
          <View style={styles.chipsRow}>
            <AppChip
              label="September 2026"
              selected={scope === 'september_2026'}
              onPress={() => setScope('september_2026')}
            />
            <AppChip
              label="All Time"
              selected={scope === 'all_time'}
              onPress={() => setScope('all_time')}
            />
          </View>

          <AppCard style={styles.summaryCard}>
            <AppText variant="caption" bold color="muted" style={styles.summaryKicker}>
              PREVIEW
            </AppText>
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.btnPrimaryBg} style={styles.loader} />
            ) : (
              <>
                <AppText variant="heading1" color="primary" style={styles.countText}>
                  {entries.length}
                </AppText>
                <AppText variant="body" color="secondary">
                  {entries.length === 1 ? 'entry ready to export' : 'entries ready to export'}
                </AppText>
                <AppText variant="caption" color="muted" style={styles.formatDescription}>
                  Formatted in semantic Markdown optimized for LLM reading, daily journals, and analysis.
                </AppText>
              </>
            )}
          </AppCard>

          {exportSuccess && (
            <View
              style={[
                styles.successNotice,
                { backgroundColor: theme.surfaceContainer, borderColor: theme.border },
              ]}
            >
              <MaterialIcons name="check-circle" size={20} color={theme.quadrants.green.color} />
              <AppText variant="caption" color="primary" style={styles.successText}>
                Export created and shared!
              </AppText>
            </View>
          )}
        </View>
      </AppModalLayout>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 16,
  },
  sectionHeader: {
    marginBottom: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryCard: {
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
  },
  summaryKicker: {
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  loader: {
    paddingVertical: 16,
  },
  countText: {
    fontSize: 40,
    lineHeight: 48,
    marginBottom: 4,
  },
  formatDescription: {
    marginTop: 12,
    lineHeight: 18,
  },
  successNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  successText: {
    flex: 1,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});
