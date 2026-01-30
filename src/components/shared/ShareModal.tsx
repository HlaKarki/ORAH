'use client';

import { useState } from 'react';
import { X, Copy, Check, Twitter, Linkedin, MessageCircle } from 'lucide-react';

interface ShareModalProps {
  explanationId: string;
  onClose: () => void;
}

export default function ShareModal({ explanationId, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/results/${explanationId}`;

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="card w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Share Explanation</h2>
          <button 
            onClick={onClose}
            className="btn-icon w-8 h-8"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-[#6B6B70] mb-2 block">Copy link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="input flex-1 text-sm"
              />
              <button 
                onClick={handleCopy}
                className="btn btn-primary px-4"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="text-sm text-[#6B6B70] mb-3 block">Share on</label>
            <div className="flex gap-3">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex flex-col items-center gap-2 p-4 bg-[#1A1A1D] hover:bg-[#2A2A2D] rounded-xl transition-colors cursor-pointer"
                >
                  <link.icon size={24} className="text-white" />
                  <span className="text-xs text-[#6B6B70]">{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
