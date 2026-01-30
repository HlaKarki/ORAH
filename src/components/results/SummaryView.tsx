'use client';

import { Lightbulb, CheckCircle2 } from 'lucide-react';
import type { OnePageContent } from '@/types';

interface SummaryViewProps {
  content: OnePageContent;
}

export default function SummaryView({ content }: SummaryViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Summary</h2>
        <p className="text-[#8B8B90] leading-relaxed">
          {content.summary_1_sentence}
        </p>
      </div>
      
      <div className="p-4 rounded-xl border border-[#FF5C00]/30 bg-[#FF5C00]/5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FF5C00]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lightbulb size={16} className="text-[#FF5C00]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Analogy</h3>
            <p className="text-sm text-[#8B8B90] leading-relaxed">
              {content.analogy}
            </p>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Key Points</h2>
        <div className="space-y-3">
          {content.key_points.map((point, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-[#FF5C00] flex-shrink-0 mt-0.5" />
              <p className="text-[#8B8B90] leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Why It Matters</h2>
        <p className="text-[#8B8B90] leading-relaxed">
          {content.why_it_matters}
        </p>
      </div>
    </div>
  );
}
