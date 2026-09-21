export type QuadrantType = 'red' | 'yellow' | 'blue' | 'green';

export interface EmotionItem {
  id: string;
  name: string;
  quadrant: QuadrantType;
  energy: 'high' | 'low';
  pleasantness: 'unpleasant' | 'pleasant';
  definition: string;
}

export interface CheckIn {
  id: string;
  timestamp: number; // epoch ms
  quadrant: QuadrantType;
  energyLevel: number; // 1 - 10
  pleasantnessLevel: number; // 1 - 10
  primaryEmotion: string;
  intensity: number; // 1 - 10
  somaticSensations: string[];
  contextWho: string[];
  contextWhat: string[];
  contextWhere?: string;
  triggerNote?: string;
  urgeNote?: string;
  createdAt: number;
}

export interface ReminderSetting {
  id: number;
  enabled: boolean;
  times: string[]; // e.g. ["09:00", "13:00", "18:00", "21:30"]
}
