import type { AppSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';
import { getStorageItem, setStorageItem, simulateAPICall } from './api';

const SETTINGS_KEY = 'explainit_settings';

export async function getSettings(): Promise<AppSettings> {
  return simulateAPICall(
    () => {
      return getStorageItem<AppSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
    },
    100,
    0
  );
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  return simulateAPICall(
    () => {
      const current = getStorageItem<AppSettings>(SETTINGS_KEY, DEFAULT_SETTINGS);
      const updated = { ...current, ...settings };
      setStorageItem(SETTINGS_KEY, updated);
      return updated;
    },
    100,
    0
  );
}

export async function resetSettings(): Promise<AppSettings> {
  return simulateAPICall(
    () => {
      setStorageItem(SETTINGS_KEY, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    },
    100,
    0
  );
}

export function getAvailableVoices(): { id: string; name: string }[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return [{ id: 'default', name: 'Default Voice' }];
  }
  
  const voices = window.speechSynthesis.getVoices();
  
  if (voices.length === 0) {
    return [{ id: 'default', name: 'Default Voice' }];
  }
  
  return voices.map((voice) => ({
    id: voice.voiceURI,
    name: `${voice.name} (${voice.lang})`,
  }));
}

export const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1.0, label: '1x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2.0, label: '2x' },
];
