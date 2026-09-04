import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

export interface SpeechCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

let activeSubscriptions: Array<{ remove: () => void }> = [];
let isListeningActive = false;

export async function checkSpeechRecognitionSupport(): Promise<boolean> {
  try {
    if (!ExpoSpeechRecognitionModule || typeof ExpoSpeechRecognitionModule.isRecognitionAvailable !== 'function') {
      return false;
    }
    return await ExpoSpeechRecognitionModule.isRecognitionAvailable();
  } catch (err) {
    console.warn('Speech recognition availability check failed:', err);
    return false;
  }
}

export async function requestSpeechPermissions(): Promise<boolean> {
  try {
    if (!ExpoSpeechRecognitionModule || typeof ExpoSpeechRecognitionModule.requestPermissionsAsync !== 'function') {
      return false;
    }
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    return result.granted;
  } catch (err) {
    console.warn('Speech recognition permission request failed:', err);
    return false;
  }
}

export async function startListening(callbacks: SpeechCallbacks): Promise<boolean> {
  try {
    const isSupported = await checkSpeechRecognitionSupport();
    if (!isSupported) {
      callbacks.onError?.('Speech recognition is not supported on this device/environment.');
      return false;
    }

    const hasPermission = await requestSpeechPermissions();
    if (!hasPermission) {
      callbacks.onError?.('Microphone permission was denied.');
      return false;
    }

    // Clear old subscriptions if any
    stopListening();

    const startSub = ExpoSpeechRecognitionModule.addListener('start', () => {
      isListeningActive = true;
      callbacks.onStart?.();
    });

    const resultSub = ExpoSpeechRecognitionModule.addListener('result', (event: any) => {
      const transcripts = event?.results || [];
      const transcript = transcripts[0]?.transcript || transcripts[0] || '';
      const isFinal = Boolean(event?.isFinal);
      callbacks.onResult?.(transcript, isFinal);
    });

    const errorSub = ExpoSpeechRecognitionModule.addListener('error', (event: any) => {
      isListeningActive = false;
      callbacks.onError?.(event?.message || 'Error occurred during speech recognition');
    });

    const endSub = ExpoSpeechRecognitionModule.addListener('end', () => {
      isListeningActive = false;
      callbacks.onEnd?.();
    });

    activeSubscriptions = [startSub, resultSub, errorSub, endSub];

    await ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      continuous: false,
    });

    isListeningActive = true;
    return true;
  } catch (err: any) {
    isListeningActive = false;
    callbacks.onError?.(err?.message || 'Failed to start speech recognition');
    return false;
  }
}

export function stopListening() {
  try {
    if (isListeningActive && ExpoSpeechRecognitionModule && typeof ExpoSpeechRecognitionModule.stop === 'function') {
      ExpoSpeechRecognitionModule.stop();
    }
  } catch (e) {
    // Ignore error on stop
  } finally {
    isListeningActive = false;
    activeSubscriptions.forEach((sub) => {
      try {
        sub.remove();
      } catch (e) {
        // Ignore
      }
    });
    activeSubscriptions = [];
  }
}

export function isListening(): boolean {
  return isListeningActive;
}
