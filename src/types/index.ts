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
