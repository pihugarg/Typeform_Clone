"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

import { api } from '@/lib/api';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mainUse, setMainUse] = useState('');
  const [helpWith, setHelpWith] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      try {
        await api.createForm({
          title: `${firstName}'s ${mainUse} Form`,
          description: `Created for: ${helpWith}`,
          status: 'draft'
        });
        router.push('/studio');
      } catch (err) {
        console.error("Failed to create form", err);
        alert("Failed to connect to the backend. Is the Python server running on port 8000?");
        setIsSubmitting(false);
      }
    }
  };

  const OptionButton = ({ 
    letter, 
    text, 
    selected, 
    onClick 
  }: { 
    letter: string, 
    text: string, 
    selected: boolean, 
    onClick: () => void 
  }) => (
    <button
      onClick={onClick}
      className={`w-full max-w-md flex items-center gap-4 px-3 py-3 mb-2 rounded border transition-all ${
        selected 
          ? 'bg-[#e5dbf8]/30 border-[#b599e6] shadow-[inset_0_0_0_1px_rgba(181,153,230,0.5)]' 
          : 'bg-[#e9e9ea]/50 border-transparent hover:bg-[#e9e9ea]'
      }`}
    >
      <div className={`w-6 h-6 flex items-center justify-center rounded-[4px] border text-xs font-semibold ${
        selected 
          ? 'border-[#b599e6] bg-white text-[#5c3e99]' 
          : 'border-gray-300 bg-white text-gray-500'
      }`}>
        {letter}
      </div>
      <span className="text-[#3c3b3d] text-[15px] font-medium">{text}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f3f3f4] font-sans flex flex-col">
      {/* Top progress bar */}
      <header className="flex h-14 items-center justify-center gap-4 bg-white border-b border-gray-200 px-6">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#49454f] flex items-center justify-center text-white">
            <Check size={12} />
          </div>
          <span className="text-sm font-semibold text-[#1e1e1e]">Create your account</span>
        </div>
        <div className="w-12 h-[1px] bg-[#49454f]"></div>
        
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
            step >= 1 ? 'bg-[#49454f] text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            2
          </div>
          <span className={`text-sm font-semibold ${step >= 1 ? 'text-[#1e1e1e]' : 'text-gray-400'}`}>Customize your experience</span>
        </div>
        <div className="w-12 h-[1px] bg-gray-300 border-t border-dotted border-gray-400"></div>
        
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
            3
          </div>
          <span className="text-sm font-semibold text-gray-400">Create your first form</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-20 px-10 max-w-3xl mx-auto w-full">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-[26px] font-medium text-[#3c3b3d] mb-10 flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#49454f] text-[11px] font-bold text-white">
                1
              </span>
              Hello! What should we call you?*
            </h1>
            
            <div className="space-y-8 max-w-md ml-8">
              <div>
                <label className="block text-sm font-medium text-[#6a696a] mb-2">First name*</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                  className="w-full bg-transparent border-b border-gray-400 py-2 text-[19px] text-[#3c3b3d] outline-none focus:border-[#49454f] transition-colors placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#6a696a] mb-2">Last name*</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Smith"
                  className="w-full bg-transparent border-b border-gray-400 py-2 text-[19px] text-[#3c3b3d] outline-none focus:border-[#49454f] transition-colors placeholder:text-gray-400"
                />
              </div>
              
              <button 
                onClick={handleNext}
                disabled={!firstName || !lastName}
                className="mt-6 bg-[#3d3844] hover:bg-[#2e2a33] text-white px-6 py-2.5 rounded text-[15px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-[26px] font-normal text-[#3c3b3d] mb-8 flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#49454f] text-[11px] font-bold text-white">
                2
              </span>
              <span>{firstName || 'there'}, what's <strong>the main thing</strong> you'll be using Typeform for?*</span>
            </h1>
            
            <div className="ml-8">
              <OptionButton 
                letter="A" 
                text="Personal" 
                selected={mainUse === 'Personal'} 
                onClick={() => setMainUse('Personal')} 
              />
              <OptionButton 
                letter="B" 
                text="School" 
                selected={mainUse === 'School'} 
                onClick={() => setMainUse('School')} 
              />
              <OptionButton 
                letter="C" 
                text="Work" 
                selected={mainUse === 'Work'} 
                onClick={() => setMainUse('Work')} 
              />
              
              <button 
                onClick={handleNext}
                disabled={!mainUse}
                className="mt-6 bg-[#3d3844] hover:bg-[#2e2a33] text-white px-6 py-2.5 rounded text-[15px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-[26px] font-normal text-[#3c3b3d] mb-8 flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#49454f] text-[11px] font-bold text-white">
                3
              </span>
              What do you want Typeform to help with?*
            </h1>
            
            <div className="ml-8">
              <OptionButton 
                letter="A" 
                text="Conduct research" 
                selected={helpWith === 'Conduct research'} 
                onClick={() => setHelpWith('Conduct research')} 
              />
              <OptionButton 
                letter="B" 
                text="Get more customers and sales" 
                selected={helpWith === 'Get more customers and sales'} 
                onClick={() => setHelpWith('Get more customers and sales')} 
              />
              <OptionButton 
                letter="C" 
                text="Recruit talent" 
                selected={helpWith === 'Recruit talent'} 
                onClick={() => setHelpWith('Recruit talent')} 
              />
              <OptionButton 
                letter="D" 
                text="Engage or educate my audience" 
                selected={helpWith === 'Engage or educate my audience'} 
                onClick={() => setHelpWith('Engage or educate my audience')} 
              />
              <OptionButton 
                letter="E" 
                text="Manage events, projects or requests" 
                selected={helpWith === 'Manage events, projects or requests'} 
                onClick={() => setHelpWith('Manage events, projects or requests')} 
              />
              <OptionButton 
                letter="F" 
                text="Get feedback" 
                selected={helpWith === 'Get feedback'} 
                onClick={() => setHelpWith('Get feedback')} 
              />
              
              <button 
                onClick={handleNext}
                disabled={!helpWith || isSubmitting}
                className="mt-6 bg-[#3d3844] hover:bg-[#2e2a33] text-white px-6 py-2.5 rounded text-[15px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
              >
                {isSubmitting ? 'Creating...' : 'Continue'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
