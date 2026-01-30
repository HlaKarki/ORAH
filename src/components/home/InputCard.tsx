'use client';

import { useState, useEffect } from 'react';
import { Mic, Sparkles, ChevronDown } from 'lucide-react';
import type { AudienceLevel, OutputFormat } from '@/types';
import { AUDIENCE_OPTIONS, OUTPUT_OPTIONS } from '@/types';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import VoiceRecordingUI, { VoiceRecordingControls } from './VoiceRecordingUI';

interface InputCardProps {
  onSubmit: (topic: string, audience: AudienceLevel, output: OutputFormat) => void;
  isLoading?: boolean;
}

export default function InputCard({ onSubmit, isLoading = false }: InputCardProps) {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState<AudienceLevel>('5yo');
  const [output, setOutput] = useState<OutputFormat>('audio-pdf');
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showOutputDropdown, setShowOutputDropdown] = useState(false);
  
  const {
    isRecording,
    duration,
    transcript,
    error: recordingError,
    startRecording,
    stopRecording,
    clearTranscript,
  } = useVoiceRecording();

  useEffect(() => {
    if (transcript) {
      setTopic((prev) => {
        const newText = prev ? `${prev} ${transcript}` : transcript;
        return newText.slice(0, 2000);
      });
      clearTranscript();
    }
  }, [transcript, clearTranscript]);

  const handleMicClick = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleCancelRecording = () => {
    stopRecording();
    clearTranscript();
  };

  const handleDoneRecording = () => {
    stopRecording();
  };

  const handleSubmit = () => {
    if (topic.trim() && !isLoading) {
      onSubmit(topic.trim(), audience, output);
    }
  };

  const selectedAudience = AUDIENCE_OPTIONS.find((a) => a.value === audience);
  const selectedOutput = OUTPUT_OPTIONS.find((o) => o.value === output);

  return (
    <div className="card p-6 space-y-5">
      <div className="space-y-3">
        {isRecording ? (
          <VoiceRecordingUI
            duration={duration}
            isRecording={isRecording}
          />
        ) : (
          <div className="relative">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value.slice(0, 2000))}
              placeholder={"Type or paste anything here...\n\ne.g. \"What is quantum computing?\" or paste a Wikipedia article"}
              className="w-full h-36 p-4 bg-[#0C0C0E] border border-[#1F1F22] rounded-xl text-white placeholder-[#4A4A4F] text-[15px] leading-relaxed resize-none focus:outline-none focus:border-[#FF5C00] transition-colors"
              disabled={isLoading}
            />
          </div>
        )}
        <div className="flex justify-between text-xs">
          {recordingError ? (
            <span className="text-red-400">{recordingError}</span>
          ) : (
            <span />
          )}
          {!isRecording && (
            <span className="text-[#6B6B70]">{topic.length}/2000</span>
          )}
        </div>
      </div>

      {isRecording ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => {
                  setShowAudienceDropdown(!showAudienceDropdown);
                  setShowOutputDropdown(false);
                }}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-[#1A1A1D] rounded-lg text-sm text-white hover:bg-[#2A2A2D] transition-colors cursor-pointer"
              >
                <span>{selectedAudience?.label}</span>
                <ChevronDown size={14} className="text-[#6B6B70]" />
              </button>
              
              {showAudienceDropdown && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-[#111113] border border-[#1F1F22] rounded-xl p-2 z-20 shadow-lg">
                  {AUDIENCE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setAudience(option.value);
                        setShowAudienceDropdown(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors cursor-pointer ${
                        audience === option.value
                          ? 'bg-[#1A1A1D]'
                          : 'hover:bg-[#1A1A1D]'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{option.label}</p>
                        <p className="text-xs text-[#6B6B70]">{option.description}</p>
                      </div>
                      {audience === option.value && (
                        <div className="w-4 h-4 rounded-full bg-[#FF5C00] flex items-center justify-center">
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowOutputDropdown(!showOutputDropdown);
                  setShowAudienceDropdown(false);
                }}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-[#1A1A1D] rounded-lg text-sm text-white hover:bg-[#2A2A2D] transition-colors cursor-pointer"
              >
                <span>{selectedOutput?.label}</span>
                <ChevronDown size={14} className="text-[#6B6B70]" />
              </button>
              
              {showOutputDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#111113] border border-[#1F1F22] rounded-xl p-2 z-20 shadow-lg">
                  {OUTPUT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setOutput(option.value);
                        setShowOutputDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors cursor-pointer ${
                        output === option.value
                          ? 'bg-[#1A1A1D]'
                          : 'hover:bg-[#1A1A1D]'
                      }`}
                    >
                      <span className="text-sm text-white">{option.label}</span>
                      {output === option.value && (
                        <div className="w-4 h-4 rounded-full bg-[#FF5C00] flex items-center justify-center">
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <VoiceRecordingControls
            onCancel={handleCancelRecording}
            onDone={handleDoneRecording}
          />
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <button
              onClick={() => {
                setShowAudienceDropdown(!showAudienceDropdown);
                setShowOutputDropdown(false);
              }}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1D] rounded-lg text-sm text-white hover:bg-[#2A2A2D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{selectedAudience?.label}</span>
              <ChevronDown size={14} className="text-[#6B6B70]" />
            </button>
            
            {showAudienceDropdown && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-[#111113] border border-[#1F1F22] rounded-xl p-2 z-20 shadow-lg">
                {AUDIENCE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setAudience(option.value);
                      setShowAudienceDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors cursor-pointer ${
                      audience === option.value
                        ? 'bg-[#1A1A1D]'
                        : 'hover:bg-[#1A1A1D]'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{option.label}</p>
                      <p className="text-xs text-[#6B6B70]">{option.description}</p>
                    </div>
                    {audience === option.value && (
                      <div className="w-4 h-4 rounded-full bg-[#FF5C00] flex items-center justify-center">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowOutputDropdown(!showOutputDropdown);
                setShowAudienceDropdown(false);
              }}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1D] rounded-lg text-sm text-white hover:bg-[#2A2A2D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{selectedOutput?.label}</span>
              <ChevronDown size={14} className="text-[#6B6B70]" />
            </button>
            
            {showOutputDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-[#111113] border border-[#1F1F22] rounded-xl p-2 z-20 shadow-lg">
                {OUTPUT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setOutput(option.value);
                      setShowOutputDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors cursor-pointer ${
                      output === option.value
                        ? 'bg-[#1A1A1D]'
                        : 'hover:bg-[#1A1A1D]'
                    }`}
                  >
                    <span className="text-sm text-white">{option.label}</span>
                    {output === option.value && (
                      <div className="w-4 h-4 rounded-full bg-[#FF5C00] flex items-center justify-center">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1" />

          <button
            onClick={handleMicClick}
            className="btn-icon"
            disabled={isLoading}
            title="Voice input"
          >
            <Mic size={20} />
          </button>

          <button
            onClick={handleSubmit}
            disabled={!topic.trim() || isLoading}
            className="btn btn-primary"
          >
            <Sparkles size={18} />
            <span>{isLoading ? 'Generating...' : 'Explain It'}</span>
          </button>
        </div>
      )}

      {(showAudienceDropdown || showOutputDropdown) && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => {
            setShowAudienceDropdown(false);
            setShowOutputDropdown(false);
          }}
        />
      )}
    </div>
  );
}
