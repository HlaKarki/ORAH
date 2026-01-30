'use client';

import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface ErrorOverlayProps {
  onRetry: () => void;
  onGoBack: () => void;
}

export default function ErrorOverlay({ onRetry, onGoBack }: ErrorOverlayProps) {
  const { error } = useApp();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08080A]/90 backdrop-blur-sm">
      <div className="card p-8 md:p-10 w-full max-w-md mx-4 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#FF3B30]/20 flex items-center justify-center">
          <AlertTriangle size={32} className="text-[#FF3B30]" />
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-[#6B6B70] mb-2">
          We couldn&apos;t generate your explanation.
        </p>
        {error && (
          <p className="text-sm text-[#FF3B30] mb-8">
            {error}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onGoBack}
            className="btn btn-secondary flex-1"
          >
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </button>
          <button 
            onClick={onRetry}
            className="btn btn-primary flex-1"
          >
            <RefreshCw size={18} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
