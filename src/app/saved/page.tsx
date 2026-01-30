'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Clock, Bookmark, BookmarkX } from 'lucide-react';
import type { ExplanationResponse } from '@/types';
import { useApp } from '@/context/AppContext';
import { getSaved, unsaveExplanation } from '@/services/saved';

export default function SavedPage() {
  const router = useRouter();
  const { addToast } = useApp();
  const [items, setItems] = useState<ExplanationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getSaved()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const handlePlay = (item: ExplanationResponse) => {
    router.push(`/results/${item.id}`);
  };

  const handleUnsave = async (id: string) => {
    try {
      await unsaveExplanation(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      addToast('success', 'Removed from saved');
    } catch {
      addToast('error', 'Failed to remove');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Saved</h1>
        <p className="text-[#6B6B70]">
          {items.length} saved explanation{items.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-5 bg-[#1A1A1D] rounded w-1/2 mb-3" />
              <div className="h-4 bg-[#1A1A1D] rounded w-full mb-2" />
              <div className="h-4 bg-[#1A1A1D] rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#1A1A1D] flex items-center justify-center">
            <Bookmark size={32} className="text-[#6B6B70]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No saved items</h3>
          <p className="text-[#6B6B70]">
            Save explanations to access them quickly later
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="card card-hover p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <button
                  onClick={() => handlePlay(item)}
                  className="w-10 h-10 rounded-lg bg-[#FF5C00]/10 hover:bg-[#FF5C00]/20 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Play size={18} className="text-[#FF5C00]" />
                </button>
                
                <button
                  onClick={() => handleUnsave(item.id)}
                  className="btn-icon w-9 h-9 text-[#FF5C00] hover:bg-[#FF5C00]/10"
                  title="Remove from saved"
                >
                  <BookmarkX size={18} />
                </button>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-white mb-1 line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-[#6B6B70] line-clamp-2">
                  {item.one_page_content.summary_1_sentence}
                </p>
              </div>
              
              <div className="flex items-center gap-3 text-xs text-[#6B6B70]">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{formatDuration(item.audioDuration)}</span>
                </div>
                <span>•</span>
                <span>{formatDate(item.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
