'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check, Twitter, Linkedin, MessageCircle } from 'lucide-react';

interface ShareModalProps {
  explanationId: string;
  onClose: () => void;
}

export default function ShareModal({ explanationId, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/results/${explanationId}`;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
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

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div 
        style={{ 
          width: '100%',
          maxWidth: '400px',
          padding: '24px',
          backgroundColor: '#141416',
          border: '1px solid #2A2A2D',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>Share Explanation</h2>
          <button 
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={18} color="#9CA3AF" />
          </button>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Copy link</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={shareUrl}
              readOnly
              style={{ 
                flex: 1,
                minWidth: 0,
                padding: '10px 12px',
                fontSize: '14px',
                color: '#FFFFFF',
                backgroundColor: '#0C0C0E',
                border: '1px solid #1F1F22',
                borderRadius: '8px',
                outline: 'none',
              }}
            />
            <button 
              onClick={handleCopy}
              style={{ 
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #FF5C00, #FF7A00)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {copied ? <Check size={18} color="#FFFFFF" /> : <Copy size={18} color="#FFFFFF" />}
            </button>
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '14px', color: '#6B7280', marginBottom: '12px' }}>Share on</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px',
                  backgroundColor: '#1A1A1D',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2A2A2D'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1A1A1D'}
              >
                <link.icon size={24} color="#FFFFFF" />
                <span style={{ fontSize: '12px', color: '#6B7280' }}>{link.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
