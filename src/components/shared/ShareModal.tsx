'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check, Twitter, Linkedin, MessageCircle } from 'lucide-react';

interface ShareModalProps {
  explanationId: string;
  onClose: () => void;
}

export default function ShareModal({ explanationId, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/results/${explanationId}`;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  };

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check out this explanation!`,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(`Check out this explanation: ${shareUrl}`)}`,
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-2xl p-6"
        style={{ 
          backgroundColor: '#141416',
          border: '1px solid #2A2A2D',
          boxShadow: '0 8px 60px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Share Explanation</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="text-sm text-gray-500 mb-2 block">Copy link</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 text-sm text-white rounded-lg"
              style={{ 
                backgroundColor: '#0C0C0E',
                border: '1px solid #1F1F22'
              }}
            />
            <button 
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ 
                background: 'linear-gradient(135deg, #FF5C00, #FF7A00)'
              }}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>
        
        <div>
          <label className="text-sm text-gray-500 mb-3 block">Share on</label>
          <div className="grid grid-cols-3 gap-3">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 rounded-xl transition-colors"
                style={{ backgroundColor: '#1A1A1D' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2A2A2D'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1A1A1D'}
              >
                <link.icon size={24} className="text-white" />
                <span className="text-xs text-gray-500">{link.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
