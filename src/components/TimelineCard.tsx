import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CheckIn } from '../types';
import { QUADRANTS } from '../constants/moodMeter';

interface Props {
  checkIn: CheckIn;
  onEdit?: (checkIn: CheckIn) => void;
  onDelete: (id: string) => void;
}

export const TimelineCard: React.FC<Props> = ({ checkIn, onEdit, onDelete }) => {
  const meta = QUADRANTS[checkIn.quadrant] || QUADRANTS.red;

  const dateObj = new Date(checkIn.timestamp);
  const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const confirmDelete = () => {
    Alert.alert('Delete Check-In', 'Are you sure you want to delete this check-in entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(checkIn.id) },
    ]);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onEdit?.(checkIn)}
      style={[
        styles.card,
        {
          borderColor: meta.badgeBg,
          backgroundColor: meta.subtleBg,
        },
      ]}
    >
      {/* Card Header */}
      <View style={styles.header}>
        <View style={styles.emotionTitleRow}>
          <View style={[styles.colorDot, { backgroundColor: meta.color }]} />
          <Text style={[styles.emotionText, { color: meta.textColor }]}>
            {checkIn.primaryEmotion}
          </Text>
          <View style={[styles.quadrantPill, { backgroundColor: meta.badgeBg }]}>
            <Text style={[styles.quadrantPillText, { color: meta.textColor }]}>
              {meta.energyLabel} • {meta.pleasantnessLabel}
            </Text>
          </View>
        </View>

        <View style={styles.timeAndAction}>
          <Text style={styles.timeText}>{timeFormatted}</Text>
          <TouchableOpacity
            onPress={() => onEdit?.(checkIn)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.actionBtn}
          >
            <Text style={styles.editIcon}>✎</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={confirmDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.actionBtn}
          >
            <Text style={styles.deleteIcon}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Intensity and Meta Summary */}
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

      {/* Somatic Sensations Chips */}
      {checkIn.somaticSensations.length > 0 && (
        <View style={styles.somaticContainer}>
          {checkIn.somaticSensations.map((sens, idx) => (
            <View key={idx} style={[styles.somaticPill, { backgroundColor: meta.badgeBg }]}>
              <Text style={[styles.somaticPillText, { color: meta.textColor }]}>{sens}</Text>
            </View>
          ))}
        </View>
      )}

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
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginVertical: 6,
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
    gap: 6,
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
  quadrantPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  quadrantPillText: {
    fontSize: 9,
    fontWeight: '700',
  },
  timeAndAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#A1A1AA',
  },
  actionBtn: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 12,
    color: '#A1A1AA',
    paddingHorizontal: 3,
  },
  deleteIcon: {
    fontSize: 13,
    color: '#71717A',
    paddingHorizontal: 3,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 8,
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
  somaticContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  somaticPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  somaticPillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  notesBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
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
