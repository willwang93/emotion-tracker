import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';
import { CheckIn, QuadrantType } from '../types';

function getQuadrantDescription(quadrant: QuadrantType): string {
  switch (quadrant) {
    case 'red':
      return 'Red (High Energy, Unpleasant)';
    case 'yellow':
      return 'Yellow (High Energy, Pleasant)';
    case 'blue':
      return 'Blue (Low Energy, Unpleasant)';
    case 'green':
      return 'Green (Low Energy, Pleasant)';
    default:
      return quadrant;
  }
}

/**
 * Formats a list of check-in entries into a clean semantic Markdown document
 * optimized for LLM comprehension and human readability.
 */
export function formatCheckInsToMarkdown(
  checkIns: CheckIn[],
  title: string = 'Emotion Entries'
): string {
  if (checkIns.length === 0) {
    return `# ${title}\n\n*No entries recorded for this period.*\n`;
  }

  // Sort ascending by timestamp
  const sorted = [...checkIns].sort((a, b) => a.timestamp - b.timestamp);

  // Group by date string (e.g. "Tuesday, September 1, 2026")
  const groupedByDate = new Map<string, CheckIn[]>();

  for (const entry of sorted) {
    const d = new Date(entry.timestamp);
    const dateHeading = d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const existing = groupedByDate.get(dateHeading) || [];
    existing.push(entry);
    groupedByDate.set(dateHeading, existing);
  }

  const lines: string[] = [];
  lines.push(`# ${title}`);
  lines.push('');
  lines.push(`*Total entries: ${sorted.length}*`);
  lines.push('');

  for (const [dateHeading, entries] of groupedByDate.entries()) {
    lines.push(`## ${dateHeading}`);
    lines.push('');

    for (const entry of entries) {
      const d = new Date(entry.timestamp);
      const timeStr = d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      lines.push(`### ${timeStr} — ${entry.primaryEmotion}`);
      lines.push(`- **Quadrant:** ${getQuadrantDescription(entry.quadrant)}`);
      lines.push(
        `- **Intensity:** ${entry.intensity}/10 | **Energy:** ${entry.energyLevel}/10 | **Pleasantness:** ${entry.pleasantnessLevel}/10`
      );

      if (entry.somaticSensations && entry.somaticSensations.length > 0) {
        lines.push(`- **Physical Sensations:** ${entry.somaticSensations.join(', ')}`);
      }

      const contexts: string[] = [];
      if (entry.contextWho && entry.contextWho.length > 0) {
        contexts.push(`Who: ${entry.contextWho.join(', ')}`);
      }
      if (entry.contextWhat && entry.contextWhat.length > 0) {
        contexts.push(`What: ${entry.contextWhat.join(', ')}`);
      }
      if (entry.contextWhere) {
        contexts.push(`Where: ${entry.contextWhere}`);
      }
      if (contexts.length > 0) {
        lines.push(`- **Context:** ${contexts.join(' | ')}`);
      }

      if (entry.triggerNote && entry.triggerNote.trim()) {
        lines.push(`- **Trigger:** ${entry.triggerNote.trim()}`);
      }

      if (entry.urgeNote && entry.urgeNote.trim()) {
        lines.push(`- **Urge / Behavior:** ${entry.urgeNote.trim()}`);
      }

      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Saves markdown content to cache and opens Android system share sheet.
 */
export async function exportMarkdownFile(
  content: string,
  filename: string
): Promise<string> {
  try {
    const file = new File(Paths.cache, filename);
    if (file.exists) {
      file.delete();
    }
    file.create();
    file.write(content);

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/markdown',
        dialogTitle: `Export ${filename}`,
        UTI: 'net.daringfireball.markdown',
      });
    } else {
      // Fallback to React Native text share if file sharing is unavailable
      await Share.share({
        title: filename,
        message: content,
      });
    }

    return file.uri;
  } catch (err) {
    console.warn('File share failed, falling back to text share:', err);
    await Share.share({
      title: filename,
      message: content,
    });
    return '';
  }
}
