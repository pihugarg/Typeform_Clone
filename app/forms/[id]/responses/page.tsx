"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { FormStats, ResponseItem } from '@/types';
import { Download, ChevronLeft } from 'lucide-react';

export default function ResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const formId = Array.isArray(params?.id) ? params.id[0] : params?.id ?? '';

  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [stats, setStats] = useState<FormStats | null>(null);

  useEffect(() => {
    if (!formId) return;
    Promise.all([api.getResponses(formId), api.getStats(formId)]).then(([res, stat]) => {
      setResponses(res);
      setStats(stat);
    });
  }, [formId]);

  return (
    <main className="min-h-screen bg-[#f6f3ee] p-8 text-[#191919]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4">
          <button 
            onClick={() => router.push('/studio')}
            className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={16} /> Back to Studio
          </button>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-black tracking-[-0.06em]">Responses</h1>
          <a 
            href={api.getCsvExportUrl(formId)}
            download
            className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <Download size={16} /> Export to CSV
          </a>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#eae2d9]">
            <div className="text-sm text-[#6d655d]">Total responses</div>
            <div className="mt-2 text-3xl font-black">{stats?.total_responses ?? 0}</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#eae2d9]">
            <div className="text-sm text-[#6d655d]">Average time</div>
            <div className="mt-2 text-3xl font-black">{stats?.average_completion_time_seconds ?? 0}s</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#eae2d9]">
            <div className="text-sm text-[#6d655d]">Questions</div>
            <div className="mt-2 text-3xl font-black">{stats?.questions?.length ?? 0}</div>
          </div>
        </div>

        {stats && stats.questions && stats.questions.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-2xl font-bold tracking-tight">Question Summaries</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stats.questions.map((q) => (
                <div key={q.question_id} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-[#eae2d9] flex flex-col">
                  <h3 className="font-semibold text-[#191919] line-clamp-2">{q.title}</h3>
                  <div className="mt-1 text-xs text-[#6d655d]">{q.total_answers} answers</div>
                  
                  <div className="mt-4 flex-1">
                    {q.breakdown ? (
                      <div className="space-y-2">
                        {Object.entries(q.breakdown).map(([choice, count]) => (
                          <div key={choice}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="truncate pr-2">{choice}</span>
                              <span className="font-semibold">{count}</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f2ece6]">
                              <div 
                                className="h-full bg-[#ff6b4a]" 
                                style={{ width: `${(Number(count) / q.total_answers) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : q.average !== null && q.average !== undefined ? (
                      <div className="flex items-center justify-center h-full flex-col gap-1 rounded-lg bg-[#f9f7f5] py-4">
                        <span className="text-sm text-[#6d655d]">Average</span>
                        <span className="text-3xl font-black text-[#ff6b4a]">{q.average}</span>
                        {(q.min !== null || q.max !== null) && (
                          <span className="text-xs text-[#8a8580] mt-1">Range: {q.min} - {q.max}</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[#8a8580] italic">
                        Text responses (see table below)
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 rounded-[24px] bg-white p-5 ring-1 ring-[#eae2d9]">
          <h2 className="mb-4 text-xl font-bold px-2">Individual Responses</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#efe8e0] text-sm text-[#6d655d]">
                <th className="pb-3">#</th>
                <th className="pb-3">Submitted</th>
                <th className="pb-3">Answers</th>
              </tr>
            </thead>
            <tbody>
              {responses.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-[#6d655d]">No responses yet.</td>
                </tr>
              ) : (
                responses.map((response, index) => (
                  <tr key={response.id} className="border-b border-[#f2ece6] align-top">
                    <td className="py-4 font-semibold">{index + 1}</td>
                    <td className="py-4">{new Date(response.submitted_at).toLocaleString()}</td>
                    <td className="py-4">
                      <div className="space-y-1">
                        {response.answers.slice(0, 3).map((answer) => (
                          <div key={answer.question_id} className="text-sm text-[#2a2a2a]">
                            {answer.question_title}: {String(answer.value ?? '')}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
