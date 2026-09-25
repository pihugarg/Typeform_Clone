'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart3, FileText, Plus, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { FormListItem } from '@/types';

export default function StudioPage() {
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [query, setQuery] = useState('');
  useEffect(() => { api.getForms().then(setForms).catch(() => setForms([])); }, []);
  const filtered = forms.filter((form) => form.title.toLowerCase().includes(query.toLowerCase()));
  return <main className="min-h-screen bg-[#f7f7f2] text-[#171717]">
    <header className="border-b border-[#deded7] bg-[#f7f7f2]"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10"><div className="flex items-center gap-4"><Link href="/" aria-label="Back home" className="text-[#686862] hover:text-[#171717]"><ArrowLeft className="h-4 w-4" /></Link><Link href="/" className="text-lg font-bold">typeform<span className="text-[#ff5c35]">.</span> <span className="text-sm font-medium text-[#686862]">Studio</span></Link></div><Link href="/builder/new" className="flex items-center gap-2 rounded-full bg-[#171717] px-5 py-2.5 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Create form</Link></div></header>
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#ff5c35]">Creator workspace</p><h1 className="mt-4 text-5xl font-bold tracking-[-0.06em]">Your forms</h1><p className="mt-3 text-[#686862]">Build, publish, and learn from every response.</p></div><div className="relative w-full md:w-72"><Search className="absolute left-4 top-3.5 h-4 w-4 text-[#888880]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search forms" className="w-full rounded-full border border-[#c9c9c2] bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#ff5c35]" /></div></div><div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filtered.map((form) => <article key={form.id} className="flex min-h-64 flex-col justify-between rounded-2xl border border-[#deded7] bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl"><div><div className="flex items-center justify-between"><span className={`rounded-full px-3 py-1 text-xs font-bold ${form.status === 'published' ? 'bg-[#d8e7df] text-[#215b43]' : 'bg-[#fff1c2] text-[#725b00]'}`}>{form.status}</span><span className="text-xs text-[#888880]">{form.question_count} questions</span></div><Link href={`/builder/${form.id}`}><h2 className="mt-8 text-2xl font-bold tracking-[-0.04em] hover:text-[#ff5c35]">{form.title}</h2></Link><p className="mt-2 line-clamp-2 text-sm leading-6 text-[#686862]">{form.description || 'No description provided'}</p></div><div className="mt-8 flex items-center justify-between border-t border-[#ededE7] pt-4 text-sm"><span className="flex items-center gap-2 text-[#686862]"><BarChart3 className="h-4 w-4" /> {form.response_count} responses</span><Link href={`/forms/${form.id}/responses`} className="font-bold text-[#ff5c35]">View results ↗</Link></div></article>)}</div>{filtered.length === 0 && <div className="mt-8 rounded-2xl border border-dashed border-[#c9c9c2] p-16 text-center text-[#686862]"><FileText className="mx-auto mb-4 h-8 w-8" />No forms found.</div>}</section>
  </main>;
}
