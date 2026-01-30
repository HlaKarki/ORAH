import type { AppSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';
import { apiRequest } from './api';

interface SettingsResponse {
  settings: AppSettings;
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const response = await apiRequest<SettingsResponse>('/api/settings');
    return response.settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  try {
    const response = await apiRequest<{ success: boolean; settings: AppSettings }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return response.settings;
  } catch {
    const current = await getSettings();
    return { ...current, ...settings };
  }
}

export async function resetSettings(): Promise<AppSettings> {
  try {
    const response = await apiRequest<{ success: boolean; settings: AppSettings }>('/api/settings', {
      method: 'DELETE',
    });
    return response.settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
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
