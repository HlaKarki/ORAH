'use client';

import { useState, useEffect } from 'react';
import { Volume2, Palette, Play, Database, Info, ChevronRight, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getAvailableVoices, SPEED_OPTIONS } from '@/services/settings';
import { clearHistory } from '@/services/history';
import DeleteDialog from '@/components/shared/DeleteDialog';

interface SettingItemProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  children: React.ReactNode;
}

function SettingItem({ icon: Icon, label, description, children }: SettingItemProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#1F1F22] last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#1A1A1D] flex items-center justify-center">
          <Icon size={18} className="text-[#6B6B70]" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          {description && (
            <p className="text-xs text-[#6B6B70]">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`toggle ${checked ? 'active' : ''}`}
    >
      <div className="toggle-knob" />
    </button>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings, addToast } = useApp();
  const [voices, setVoices] = useState<{ id: string; name: string }[]>([]);
  const [showClearDialog, setShowClearDialog] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const available = getAvailableVoices();
      setVoices(available);
    };
    
    loadVoices();
    
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      addToast('success', 'History cleared');
    } catch {
      addToast('error', 'Failed to clear history');
    } finally {
      setShowClearDialog(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Settings</h1>
        <p className="text-[#6B6B70]">Customize your experience</p>
      </div>
      
      <div className="space-y-6">
        <section className="card p-4">
          <h2 className="text-sm font-semibold text-[#FF5C00] mb-2 px-1">Voice Settings</h2>
          
          <SettingItem icon={Volume2} label="Voice" description="Select TTS voice">
            <select
              value={settings.voice}
              onChange={(e) => updateSettings({ voice: e.target.value })}
              className="bg-[#1A1A1D] border border-[#1F1F22] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF5C00]"
            >
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          </SettingItem>
          
          <SettingItem icon={Play} label="Default Speed" description="Playback speed">
            <select
              value={settings.speed}
              onChange={(e) => updateSettings({ speed: parseFloat(e.target.value) })}
              className="bg-[#1A1A1D] border border-[#1F1F22] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF5C00]"
            >
              {SPEED_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </SettingItem>
        </section>
        
        <section className="card p-4">
          <h2 className="text-sm font-semibold text-[#FF5C00] mb-2 px-1">Display</h2>
          
          <SettingItem icon={Palette} label="Theme" description="Appearance mode">
            <select
              value={settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value as 'dark' | 'light' | 'system' })}
              className="bg-[#1A1A1D] border border-[#1F1F22] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF5C00]"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </SettingItem>
        </section>
        
        <section className="card p-4">
          <h2 className="text-sm font-semibold text-[#FF5C00] mb-2 px-1">Audio</h2>
          
          <SettingItem icon={Play} label="Auto-play" description="Start audio automatically">
            <Toggle
              checked={settings.autoPlay}
              onChange={(checked) => updateSettings({ autoPlay: checked })}
            />
          </SettingItem>
          
          <SettingItem icon={ChevronRight} label="Show Transcript" description="Display transcript by default">
            <Toggle
              checked={settings.showTranscript}
              onChange={(checked) => updateSettings({ showTranscript: checked })}
            />
          </SettingItem>
        </section>
        
        <section className="card p-4">
          <h2 className="text-sm font-semibold text-[#FF5C00] mb-2 px-1">Data</h2>
          
          <div className="py-4 border-b border-[#1F1F22]">
            <button
              onClick={() => setShowClearDialog(true)}
              className="w-full flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF3B30]/10 flex items-center justify-center">
                  <Trash2 size={18} className="text-[#FF3B30]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-[#FF3B30]">Clear History</p>
                  <p className="text-xs text-[#6B6B70]">Delete all explanation history</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#6B6B70]" />
            </button>
          </div>
          
          <div className="py-4">
            <button className="w-full flex items-center justify-between opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1A1A1D] flex items-center justify-center">
                  <Database size={18} className="text-[#6B6B70]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">Export Data</p>
                  <p className="text-xs text-[#6B6B70]">Download your data as JSON</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#6B6B70]" />
            </button>
          </div>
        </section>
        
        <section className="card p-4">
          <h2 className="text-sm font-semibold text-[#FF5C00] mb-2 px-1">About</h2>
          
          <SettingItem icon={Info} label="Version" description="ExplainIt MVP">
            <span className="text-sm text-[#6B6B70]">1.0.0</span>
          </SettingItem>
        </section>
      </div>
      
      {showClearDialog && (
        <DeleteDialog
          title="Clear all history?"
          description="This will permanently delete all your explanation history. This action cannot be undone."
          onConfirm={handleClearHistory}
          onCancel={() => setShowClearDialog(false)}
        />
      )}
    </div>
  );
}
