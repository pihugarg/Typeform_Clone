"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  HelpCircle, 
  Mic,
  Plus,
  MoreHorizontal,
  Send,
  LayoutGrid
} from 'lucide-react';

export default function NewBuilderPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');

  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#191919] font-sans flex flex-col">
      {/* Header */}
      <header className="flex h-14 items-center justify-between px-6 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <LayoutGrid size={16} className="text-gray-400" />
          <Link href="/studio" className="hover:text-gray-900 transition-colors">Forms</Link>
          <span className="text-gray-400">&gt;</span>
          <span className="text-gray-900">New form</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="text-gray-500 hover:text-gray-700">
            <HelpCircle size={20} />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1b4b43] text-xs font-bold text-white">
            PG
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[600px] flex flex-col items-center">
          <div className="text-xs font-semibold text-gray-500 mb-2">Typeform AI</div>
          <h1 className="text-[28px] font-normal text-gray-900 mb-8">What would you like to create?</h1>
          
          <div className="w-full relative rounded-xl border border-[#d946ef]/30 bg-white shadow-[0_0_15px_rgba(217,70,239,0.05)] transition-all focus-within:border-[#d946ef] focus-within:shadow-[0_0_20px_rgba(217,70,239,0.15)] p-1">
            <div className="rounded-lg border border-[#e5e7eb] focus-within:border-transparent transition-colors p-4 min-h-[160px] flex flex-col">
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Explain the goal"
                className="w-full flex-1 resize-none bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
              />
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><Mic size={18} /></button>
                  <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><Plus size={18} /></button>
                  <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><MoreHorizontal size={18} /></button>
                </div>
                
                <button 
                  className={`p-2 rounded-md transition-colors ${prompt.trim() ? 'bg-black text-white hover:bg-gray-800' : 'bg-transparent text-gray-300'}`}
                  disabled={!prompt.trim()}
                  onClick={() => router.push('/onboarding')}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-8">
            <button 
              onClick={async () => {
                const { api } = await import('@/lib/api');
                const form = await api.createForm({ title: 'Untitled Form', status: 'draft' });
                router.push(`/builder/${form.id}`);
              }}
              className="px-6 py-2.5 bg-[#f3f4f6] hover:bg-[#e5e7eb] text-gray-700 text-sm font-semibold rounded-lg transition-colors"
            >
              Start from scratch
            </button>
            <button 
              onClick={() => alert('CRM Sync (Coming Soon)')}
              className="px-6 py-2.5 bg-[#f3f4f6] hover:bg-[#e5e7eb] text-gray-700 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              Sync to CRM
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-[#ff7a59] flex items-center justify-center text-white text-[8px] font-bold">hub</div>
                <div className="w-5 h-5 rounded-full bg-[#00a1e0] flex items-center justify-center text-white text-[8px] font-bold">sf</div>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
