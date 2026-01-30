'use client';

import type { KeyTerm } from '@/types';
import { Hash, ArrowUpRight } from 'lucide-react';

interface KeyTermsCardProps {
  terms: KeyTerm[];
  relatedTopics: string[];
}

export default function KeyTermsCard({ terms, relatedTopics }: KeyTermsCardProps) {
  return (
    <div className="card p-5 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Hash size={14} className="text-[#FF5C00]" />
          Key Terms
        </h3>
        <div className="space-y-3">
          {terms.map((term, index) => (
            <div key={index} className="p-3 bg-[#0C0C0E] rounded-lg">
              <p className="text-sm font-medium text-white mb-1">{term.term}</p>
              <p className="text-xs text-[#6B6B70]">{term.definition}</p>
            </div>
          ))}
        </div>
      </div>
      
      {relatedTopics.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Related Topics</h3>
          <div className="flex flex-wrap gap-2">
            {relatedTopics.map((topic, index) => (
              <button
                key={index}
                className="px-3 py-1.5 bg-[#1A1A1D] hover:bg-[#2A2A2D] rounded-lg text-xs text-[#8B8B90] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                {topic}
                <ArrowUpRight size={10} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
