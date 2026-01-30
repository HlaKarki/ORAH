'use client';

import { useEffect, useState } from 'react';
import { Play, Clock } from 'lucide-react';
import type { ExplanationResponse } from '@/types';
import { getHistory } from '@/services/history';

interface RecentExplanationsProps {
  onSelect: (explanation: ExplanationResponse) => void;
}

export default function RecentExplanations({ onSelect }: RecentExplanationsProps) {
  const [recentItems, setRecentItems] = useState<ExplanationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getHistory({ type: 'all' })
      .then((items) => {
        setRecentItems(items.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Recent Explanations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-[#1A1A1D] rounded w-3/4 mb-3" />
              <div className="h-3 bg-[#1A1A1D] rounded w-full mb-2" />
              <div className="h-3 bg-[#1A1A1D] rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recentItems.length === 0) {
    return null;
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Recent Explanations</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recentItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="card card-hover p-4 text-left transition-colors group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#FF5C00]/10 flex items-center justify-center group-hover:bg-[#FF5C00]/20 transition-colors">
                <Play size={14} className="text-[#FF5C00]" />
              </div>
              <span className="text-xs text-[#6B6B70]">
                {formatDate(item.createdAt)}
              </span>
            </div>
            
            <h3 className="text-sm font-medium text-white mb-2 line-clamp-1">
              {item.title}
            </h3>
            
            <p className="text-xs text-[#6B6B70] line-clamp-2 mb-3">
              {item.one_page_content.summary_1_sentence}
            </p>
            
            <div className="flex items-center gap-2 text-xs text-[#6B6B70]">
              <Clock size={12} />
              <span>{formatDuration(item.audioDuration)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
