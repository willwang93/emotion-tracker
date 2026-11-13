import React, { useState, useEffect, useCallback } from 'react';
import { Modal, View, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../theme/ThemeContext';
import { AppText } from './ui/AppText';
import { AppButton } from './ui/AppButton';
import { AppChip } from './ui/AppChip';
import { AppModalLayout } from './ui/AppModalLayout';
import {
  AvailableMonth,
  getAvailableMonths,
  getCheckInsForMonth,
} from '../services/db';
import { formatCheckInsToMarkdown, exportMarkdownFile } from '../services/export';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function formatMonthChipLabel(month: AvailableMonth): string {
  return `${MONTH_NAMES[month.monthIndex]} ${month.year} (${month.count})`;
}

export function getMonthExportFilename(year: number, monthIndex: number): string {
  return `${MONTH_NAMES[monthIndex]}-${year}-Emotion-Entries.md`;
}

export function getMonthExportTitle(year: number, monthIndex: number): string {
  return `Emotion Entries — ${MONTH_NAMES[monthIndex]} ${year}`;
}

export const ExportModal: React.FC<Props> = ({ visible, onClose }) => {
  const { theme } = useAppTheme();
  const [availableMonths, setAvailableMonths] = useState<AvailableMonth[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<{
    year: number;
    monthIndex: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const loadAvailableMonths = useCallback(async () => {
    setIsLoading(true);
    setExportSuccess(false);
    try {
      const months = await getAvailableMonths();
      setAvailableMonths(months);
      if (months.length > 0) {
        setSelectedMonth({
          year: months[0].year,
          monthIndex: months[0].monthIndex,
        });
      } else {
        setSelectedMonth(null);
      }
    } catch (err) {
      console.error('Failed to load available months for export:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadAvailableMonths();
    }
  }, [visible, loadAvailableMonths]);

  const handleSelectMonth = (month: AvailableMonth) => {
    setSelectedMonth({ year: month.year, monthIndex: month.monthIndex });
    setExportSuccess(false);
  };

  const handleExport = async () => {
    if (!selectedMonth) return;
    setIsExporting(true);
    try {
      const entries = await getCheckInsForMonth(
        selectedMonth.year,
        selectedMonth.monthIndex
      );
      const filename = getMonthExportFilename(
        selectedMonth.year,
        selectedMonth.monthIndex
      );
      const title = getMonthExportTitle(
        selectedMonth.year,
        selectedMonth.monthIndex
      );

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
              disabled={isLoading || isExporting || !selectedMonth}
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
            Select Month
          </AppText>

          {isLoading ? (
            <ActivityIndicator size="small" color={theme.btnPrimaryBg} style={styles.loader} />
          ) : availableMonths.length === 0 ? (
            <AppText variant="body" color="muted">
              No entries recorded yet.
            </AppText>
          ) : (
            <View style={styles.chipsRow}>
              {availableMonths.map((month) => {
                const isSelected =
                  selectedMonth?.year === month.year &&
                  selectedMonth?.monthIndex === month.monthIndex;

                return (
                  <AppChip
                    key={`${month.year}-${month.monthIndex}`}
                    label={formatMonthChipLabel(month)}
                    selected={isSelected}
                    onPress={() => handleSelectMonth(month)}
                  />
                );
              })}
            </View>
          )}

          {exportSuccess && selectedMonth && (
            <View
              style={[
                styles.successNotice,
                { backgroundColor: theme.surfaceContainer, borderColor: theme.border },
              ]}
            >
              <MaterialIcons name="check-circle" size={20} color={theme.quadrants.green.color} />
              <AppText variant="caption" color="primary" style={styles.successText}>
                Exported {getMonthExportFilename(selectedMonth.year, selectedMonth.monthIndex)}!
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
  loader: {
    paddingVertical: 16,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
