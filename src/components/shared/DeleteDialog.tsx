'use client';

import { AlertTriangle } from 'lucide-react';

interface DeleteDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteDialog({ title, description, onConfirm, onCancel }: DeleteDialogProps) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div 
        className="card w-full max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#FF3B30]/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-[#FF3B30]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">{title}</h2>
            <p className="text-sm text-[#6B6B70]">{description}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn flex-1 bg-[#FF3B30] hover:bg-[#FF3B30]/80 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
