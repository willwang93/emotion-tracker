import { isRunningInExpoGo, requireOptionalNativeModule } from 'expo';

export interface SpeechCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

let SpeechModule: any = null;

function getModule(): any {
  if (SpeechModule !== null) return SpeechModule;

  // Third-party native modules like expo-speech-recognition are not bundled in Expo Go.
  // Checking isRunningInExpoGo() prevents uncaught native module errors.
  if (isRunningInExpoGo()) {
    SpeechModule = false;
    return null;
  }

  try {
    const nativeModule = requireOptionalNativeModule('ExpoSpeechRecognition');
    if (!nativeModule) {
      SpeechModule = false;
      return null;
    }
    const mod = require('expo-speech-recognition');
    SpeechModule = mod.ExpoSpeechRecognitionModule || null;
  } catch (err) {
    SpeechModule = false;
  }
  return SpeechModule;
}

let activeSubscriptions: Array<{ remove: () => void }> = [];
let isListeningActive = false;

export function isSpeechModuleInstalled(): boolean {
  const mod = getModule();
  return Boolean(mod && typeof mod.isRecognitionAvailable === 'function');
}

export async function checkSpeechRecognitionSupport(): Promise<boolean> {
  try {
    const mod = getModule();
    if (!mod || typeof mod.isRecognitionAvailable !== 'function') {
      return false;
    }
    return await mod.isRecognitionAvailable();
  } catch (err) {
    return false;
  }
}

export async function requestSpeechPermissions(): Promise<boolean> {
  try {
    const mod = getModule();
    if (!mod || typeof mod.requestPermissionsAsync !== 'function') {
      return false;
    }
    const result = await mod.requestPermissionsAsync();
    return result.granted;
  } catch (err) {
    return false;
  }
}

export async function startListening(callbacks: SpeechCallbacks): Promise<boolean> {
  try {
    const isSupported = await checkSpeechRecognitionSupport();
    if (!isSupported) {
      callbacks.onError?.(
        'Speech module not embedded in Expo Go. Use the mic icon on your keyboard (Gboard) for instant dictation!'
      );
      return false;
    }

    const hasPermission = await requestSpeechPermissions();
    if (!hasPermission) {
      callbacks.onError?.('Microphone permission was denied.');
      return false;
    }

    stopListening();

    const mod = getModule();
    const startSub = mod.addListener('start', () => {
      isListeningActive = true;
      callbacks.onStart?.();
    });

    const resultSub = mod.addListener('result', (event: any) => {
      const transcripts = event?.results || [];
      const transcript = transcripts[0]?.transcript || transcripts[0] || '';
      const isFinal = Boolean(event?.isFinal);
      callbacks.onResult?.(transcript, isFinal);
    });

    const errorSub = mod.addListener('error', (event: any) => {
      isListeningActive = false;
      callbacks.onError?.(event?.message || 'Error occurred during speech recognition');
    });

    const endSub = mod.addListener('end', () => {
      isListeningActive = false;
      callbacks.onEnd?.();
    });

    activeSubscriptions = [startSub, resultSub, errorSub, endSub];

    await mod.start({
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
    const mod = getModule();
    if (isListeningActive && mod && typeof mod.stop === 'function') {
      mod.stop();
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
