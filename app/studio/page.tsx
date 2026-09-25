"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { FormListItem } from '@/types';
import {
  Search,
  Plus,
  LayoutGrid,
  List as ListIcon,
  ChevronDown,
  MoreHorizontal,
  Mail,
  Zap,
  BarChart2,
  Users,
  LayoutTemplate,
  HelpCircle,
  Gem,
  X,
  Sparkles,
  SearchCode,
  LayoutList,
  CheckCircle2
} from 'lucide-react';

export default function StudioPage() {
  const router = useRouter();
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('forms');
  const [showPromo, setShowPromo] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const loadForms = async () => {
    try {
      const data = await api.getForms();
      setForms(data);
    } catch (error) {
      console.error(error);
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadForms();
  }, []);

  const handleCreate = () => {
    router.push('/builder/new');
  };

  const duplicate = async (id: string) => {
    try {
      await api.duplicateForm(id);
      await loadForms();
      setOpenMenuId(null);
    } catch (error) {
      console.error(error);
      alert('Unable to duplicate the form.');
    }
  };

  const remove = async (id: string) => {
    try {
      await api.deleteForm(id);
      await loadForms();
      setOpenMenuId(null);
    } catch (error) {
      console.error(error);
      alert('Unable to delete the form.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#191919] font-sans flex flex-col">
      {/* Top Banner */}
      {showPromo && (
        <div className="flex items-center justify-center bg-[#fdfdfd] border-b border-[#e5e7eb] px-4 py-2.5 text-sm text-[#111827]">
          <div className="flex items-center gap-2">
            <Gem size={16} className="text-[#10b981]" />
            <span>You can collect <strong>10 form responses</strong> this month for free.</span>
            <button className="ml-2 bg-[#1b4b43] hover:bg-[#153a33] text-white px-3 py-1 rounded text-xs font-semibold">
              Get more responses
            </button>
          </div>
          <button onClick={() => setShowPromo(false)} className="absolute right-4 text-gray-500 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="flex h-[60px] items-center justify-between border-b border-gray-200 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#1b4b43] text-sm font-bold text-white">
            P
          </div>
          <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-black">
            Pihu Gupta
            <ChevronDown size={14} className="text-gray-400" />
          </button>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <LayoutGrid size={16} />
            Integrations
          </button>
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <LayoutTemplate size={16} />
            Brand kit
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            <HelpCircle size={20} />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1b4b43] text-xs font-bold text-white">
            PG
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 px-6 mt-2">
        <button 
          onClick={() => setActiveTab('forms')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'forms' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <LayoutList size={16} />
          Forms
        </button>
        <button 
          onClick={() => setActiveTab('contacts')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'contacts' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Users size={16} />
          Contacts
        </button>
        <button 
          onClick={() => setActiveTab('automations')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'automations' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Zap size={16} />
          Automations
        </button>
        <button 
          onClick={() => setActiveTab('insights')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'insights' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <BarChart2 size={16} />
          Insights
          <Gem size={14} className="text-[#10b981]" />
        </button>
        <div className="ml-2 pl-4 border-l border-gray-200">
          <button 
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <SearchCode size={16} />
            Research Flow
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden bg-[#f9fafb]">
        {/* Sidebar */}
        <aside className="w-[260px] border-r border-gray-200 bg-white p-5 flex flex-col justify-between">
          <div>
            <button 
              onClick={handleCreate}
              className="w-full flex items-center justify-center gap-2 bg-[#36323a] hover:bg-[#2b2730] text-white py-2 px-4 rounded-md text-sm font-semibold mb-6 transition-colors"
            >
              <Plus size={16} />
              Create form
            </button>
            
            <div className="relative mb-6">
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full pl-9 pr-3 py-2 bg-white text-sm outline-none placeholder-gray-500 text-gray-900 border-none"
              />
            </div>

            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-gray-900">
              <div className="flex items-center gap-2">
                <LayoutGrid size={16} className="text-gray-400" />
                Workspaces
              </div>
              <button className="text-gray-400 hover:text-gray-700 border border-gray-200 rounded p-0.5">
                <Plus size={14} />
              </button>
            </div>
            
            <div className="mt-4 space-y-1">
              <button className="w-full flex items-center justify-between text-sm text-gray-700 font-medium py-1.5 px-2 hover:bg-gray-50 rounded">
                Private
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between text-sm text-gray-900 font-medium py-2 px-3 bg-[#f3f4f6] rounded-md">
                My workspace
                <span className="text-xs text-gray-500 font-normal">1</span>
              </button>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2 font-medium">Responses collected</p>
            <p className="text-sm font-semibold text-gray-900 mb-3">0 / 10</p>
            <div className="h-1.5 w-full bg-gray-200 rounded-full mb-3">
              <div className="h-full w-[5%] bg-[#1b4b43] rounded-full"></div>
            </div>
            <button className="text-xs font-semibold text-gray-700 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50">
              Increase response limit
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-auto p-8">
          {activeTab === 'forms' && (
            <div className="max-w-[1000px]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-normal text-gray-900">My workspace</h1>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={20} />
                  </button>
                  <button 
                    onClick={() => alert('Team Collaboration & Sharing (Coming Soon)')}
                    className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    <Users size={16} />
                    Invite
                  </button>
                  <Gem size={16} className="text-[#10b981]" />
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-md px-3 py-1.5 hover:bg-gray-50">
                    <CheckCircle2 size={16} />
                    Date created
                    <ChevronDown size={14} />
                  </button>
                  <div className="flex bg-white border border-gray-200 rounded-md p-0.5">
                    <button className="p-1 rounded bg-gray-100 text-gray-900">
                      <ListIcon size={16} />
                    </button>
                    <button className="p-1 rounded text-gray-400 hover:text-gray-900">
                      <LayoutGrid size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative">
                  <button className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"><X size={16} /></button>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded bg-[#fdf4ff] flex items-center justify-center text-[#d946ef]">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 mb-4 pr-6">Obtain user feedback on product features and ease of use for development guidance.</p>
                      <button className="text-xs font-semibold text-gray-700 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50">Create form</button>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative">
                  <button className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"><X size={16} /></button>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded bg-[#fdf4ff] flex items-center justify-center text-[#d946ef]">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 mb-4 pr-6">Collect attendees' opinions and suggestions to enhance future event planning.</p>
                      <button className="text-xs font-semibold text-gray-700 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50">Create form</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-[1fr_120px_120px_120px_120px_40px] gap-4 px-4 py-2 text-xs text-gray-500 font-medium">
                <div></div>
                <div>Responses</div>
                <div>Completed</div>
                <div>Updated</div>
                <div>Integrations</div>
                <div></div>
              </div>
              
              {/* List */}
              <div className="space-y-2">
                {loading ? (
                  <div className="p-4 text-center text-sm text-gray-500">Loading forms...</div>
                ) : forms.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">No forms found. Create one to get started!</div>
                ) : (
                  forms.map((form) => (
                    <div key={form.id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center hover:shadow-sm transition-shadow">
                      <div className="flex-1 flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#477a66] rounded-lg flex items-center justify-center text-white font-bold">
                          {form.title ? form.title.charAt(0).toUpperCase() : 'F'}
                        </div>
                        <span className="font-semibold text-sm text-gray-900">{form.title || 'Untitled Form'}</span>
                      </div>
                      <div className="w-[120px] text-sm text-gray-500">{form.response_count || '-'}</div>
                      <div className="w-[120px] text-sm text-gray-500">-</div>
                      <div className="w-[120px] text-sm text-gray-500">
                        {new Date(form.updated_at || form.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="w-[120px] text-gray-400">
                        <button 
                          onClick={() => alert('Integrations / Webhooks (Coming Soon)')}
                          className="hover:text-gray-700"
                        >
                          <LayoutGrid size={16} />
                        </button>
                      </div>
                      <div className="w-[40px] flex justify-end relative">
                        <button 
                          className="text-gray-400 hover:text-gray-700 p-1"
                          onClick={() => setOpenMenuId(openMenuId === form.id ? null : form.id)}
                        >
                          <MoreHorizontal size={20} />
                        </button>
                        {openMenuId === form.id && (
                          <div className="absolute right-0 top-8 z-10 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 text-sm text-gray-700">
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => router.push(`/builder/${form.id}`)}>Edit</button>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => router.push(`/forms/${form.id}/responses`)}>View Responses</button>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/form/${form.id}`);
                              alert('Link copied to clipboard!');
                              setOpenMenuId(null);
                            }}>Share</button>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => duplicate(form.id)}>Duplicate</button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600" onClick={() => remove(form.id)}>Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'contacts' && (
            <div className="max-w-[1000px] h-full flex flex-col items-center justify-center pt-20">
              <h2 className="text-2xl font-normal text-gray-900 mb-4">Ready to build your contact list?</h2>
              <p className="text-sm text-gray-600 mb-8 text-center max-w-[400px]">
                Create contacts automatically from forms with email questions.
              </p>
              
              <div className="space-y-3 mb-10 text-sm text-gray-700">
                <p>1. <span className="underline cursor-pointer">Add an email question</span> to a form</p>
                <p>2. Publish your form</p>
                <p>3. Click "Auto-add from forms" below</p>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-md text-sm font-semibold" disabled>
                  <Sparkles size={16} />
                  Auto-add from forms
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-50">
                  Import contacts
                </button>
              </div>
              <p className="text-sm text-gray-600">Or, <span className="underline cursor-pointer text-gray-900">add individually.</span></p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
