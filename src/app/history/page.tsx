'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Play, Clock, Trash2, Calendar, Mic } from 'lucide-react';
import type { ExplanationResponse, HistoryFilter } from '@/types';
import { useApp } from '@/context/AppContext';
import { getHistory, deleteFromHistory, clearHistory, searchHistory } from '@/services/history';
import DeleteDialog from '@/components/shared/DeleteDialog';

type FilterTab = HistoryFilter['type'];

const filterTabs: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export default function HistoryPage() {
  const router = useRouter();
  const { addToast } = useApp();
  const [items, setItems] = useState<ExplanationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = searchQuery 
        ? await searchHistory(searchQuery)
        : await getHistory({ type: activeFilter });
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeFilter]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery) {
        void searchHistory(searchQuery).then(setItems);
      } else {
        void loadHistory();
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, loadHistory]);

  const handlePlay = (item: ExplanationResponse) => {
    router.push(`/results/${item.id}`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      if (deleteTarget === 'all') {
        await clearHistory();
        setItems([]);
        addToast('success', 'History cleared');
      } else {
        await deleteFromHistory(deleteTarget);
        setItems((prev) => prev.filter((i) => i.id !== deleteTarget));
        addToast('success', 'Item deleted');
      }
    } catch {
      addToast('error', 'Failed to delete');
    } finally {
      setDeleteTarget(null);
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">History</h1>
          <p className="text-[#6B6B70]">
            {items.length} explanation{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {items.length > 0 && (
          <button
            onClick={() => setDeleteTarget('all')}
            className="btn btn-ghost text-[#FF3B30] hover:bg-[#FF3B30]/10"
          >
            <Trash2 size={16} />
            <span>Clear All</span>
          </button>
        )}
      </div>
      
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B70]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history..."
            className="input pl-11"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === tab.value
                  ? 'bg-[#FF5C00] text-white'
                  : 'bg-[#1A1A1D] text-[#6B6B70] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-5 bg-[#1A1A1D] rounded w-1/3 mb-3" />
              <div className="h-4 bg-[#1A1A1D] rounded w-2/3 mb-2" />
              <div className="h-4 bg-[#1A1A1D] rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#1A1A1D] flex items-center justify-center">
            <Calendar size={32} className="text-[#6B6B70]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No history yet</h3>
          <p className="text-[#6B6B70]">
            {searchQuery ? 'No results found for your search' : 'Your explanations will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => handlePlay(item)}
              className="card card-hover p-4 flex items-center gap-4 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-[#FF5C00]/10 group-hover:bg-[#FF5C00]/20 flex items-center justify-center transition-colors">
                <Play size={18} className="text-[#FF5C00]" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white mb-1 truncate">
                  {item.title}
                </h3>
                <p className="text-xs text-[#6B6B70] truncate">
                  {item.one_page_content.summary_1_sentence}
                </p>
              </div>
              
              <div className="hidden sm:flex items-center gap-4 text-xs text-[#6B6B70]">
                {item.recordingData?.audioUrl && (
                  <div className="flex items-center gap-1 text-green-500" title="Voice recorded">
                    <Mic size={12} />
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{formatDuration(item.audioDuration)}</span>
                </div>
                <span>{formatDate(item.createdAt)}</span>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(item.id);
                }}
                className="btn-icon w-9 h-9 text-[#6B6B70] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {deleteTarget && (
        <DeleteDialog
          title={deleteTarget === 'all' ? 'Clear all history?' : 'Delete this item?'}
          description={
            deleteTarget === 'all'
              ? 'This will permanently delete all your explanation history.'
              : 'This will permanently delete this explanation from your history.'
          }
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
