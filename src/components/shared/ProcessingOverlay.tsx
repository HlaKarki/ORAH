'use client';

import { Brain, Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const steps = [
  { id: 1, label: 'Content received', completed: true },
  { id: 2, label: 'Generating explanation', completed: false },
  { id: 3, label: 'Creating audio', completed: false },
];

export default function ProcessingOverlay() {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(2), 800);
    const timer2 = setTimeout(() => setCurrentStep(3), 1800);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08080A]/90 backdrop-blur-sm p-4">
      <div className="card p-8 md:p-10 w-full max-w-sm min-w-[320px]">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-linear-to-br from-[#FF5C00] to-[#FF7A00] flex items-center justify-center">
          <Brain size={32} className="text-white animate-pulse" />
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-2 text-center">
          Generating your explanation
        </h2>
        <p className="text-[#6B6B70] mb-8 text-center">
          This usually takes a few seconds...
        </p>
        
        <div className="space-y-4">
          {steps.map((step) => {
            const isComplete = step.id < currentStep;
            const isActive = step.id === currentStep;
            
            return (
              <div 
                key={step.id} 
                className="flex items-center gap-3"
              >
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isComplete 
                      ? 'bg-[#22C55E]' 
                      : isActive 
                        ? 'bg-[#FF5C00]' 
                        : 'bg-[#2A2A2D]'
                  }`}
                >
                  {isComplete ? (
                    <Check size={14} className="text-white" />
                  ) : isActive ? (
                    <Loader2 size={14} className="text-white animate-spin" />
                  ) : (
                    <span className="text-xs text-[#6B6B70]">{step.id}</span>
                  )}
                </div>
                <span 
                  className={`text-sm ${
                    isComplete || isActive ? 'text-white' : 'text-[#6B6B70]'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
