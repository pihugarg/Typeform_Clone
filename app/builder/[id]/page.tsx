"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Form, Question, QuestionType } from '@/types';

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'short_text', label: 'Short text' },
  { value: 'long_text', label: 'Long text' },
  { value: 'multiple_choice', label: 'Multiple choice' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'yes_no', label: 'Yes / No' },
  { value: 'rating', label: 'Rating' },
  { value: 'file_upload', label: 'File Upload' },
];

function buildDefaultQuestion(type: QuestionType): Omit<Question, 'id' | 'form_id' | 'order_index' | 'created_at' | 'updated_at'> {
  const base = {
    question_type: type,
    title: `Question ${type.replace('_', ' ')}`,
    description: '',
    is_required: false,
    properties: {}
  };

  if (type === 'multiple_choice' || type === 'dropdown') {
    return {
      ...base,
      properties: { choices: ['Option 1', 'Option 2'] }
    };
  }

  if (type === 'rating') {
    return {
      ...base,
      properties: { rating_scale: 5 }
    };
  }

  return base;
}

export default function BuilderPage() {
  const params = useParams();
  const router = useRouter();
  const formId = Array.isArray(params?.id) ? params.id[0] : params?.id ?? '';

  const [form, setForm] = useState<Form | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  const loadForm = async () => {
    if (!formId) return;
    try {
      const data = await api.getForm(formId);
      setForm(data);
      setTitleDraft(data.title);
      if (!selectedId && data.questions[0]) {
        setSelectedId(data.questions[0].id);
      }
      if (selectedId && !data.questions.some((q) => q.id === selectedId)) {
        setSelectedId(data.questions[0]?.id ?? null);
      }
    } catch (error) {
      console.error(error);
      router.push('/studio');
    }
  };

  useEffect(() => {
    void loadForm();
  }, [formId]);

  const selectedQuestion = useMemo(
    () => form?.questions.find((q) => q.id === selectedId) ?? null,
    [form, selectedId]
  );

  const addQuestion = async (type: QuestionType) => {
    if (!form) return;
    const payload = buildDefaultQuestion(type);
    const created = await api.addQuestion(form.id, {
      question_type: payload.question_type,
      title: payload.title,
      description: payload.description,
      is_required: payload.is_required,
      properties: payload.properties,
    });
    await loadForm();
    setSelectedId(created.id);
    setShowAddModal(false);
  };

  const saveFormTitle = async () => {
    if (!form) return;
    const next = await api.updateForm(form.id, { title: titleDraft.trim() || 'Untitled Form' });
    setForm(next);
    setTitleDraft(next.title);
  };

  const saveSelectedQuestion = async (patch: Partial<Question>) => {
    if (!selectedQuestion) return;
    const nextProperties = {
      ...(selectedQuestion.properties ?? {}),
      ...(patch.properties ?? {})
    };

    const updated = await api.updateQuestion(selectedQuestion.id, {
      title: patch.title,
      description: patch.description,
      is_required: patch.is_required,
      properties: nextProperties,
      question_type: patch.question_type,
    });

    setForm((prev) =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map((q) => (q.id === updated.id ? updated : q)),
          }
        : prev
    );
    setSelectedId(updated.id);
  };

  const deleteQuestion = async (questionId: string) => {
    await api.deleteQuestion(questionId);
    const remaining = form?.questions.filter((q) => q.id !== questionId) ?? [];
    setForm((prev) => (prev ? { ...prev, questions: remaining } : prev));
    setSelectedId(remaining[0]?.id ?? null);
  };

  const moveQuestion = async (direction: 'up' | 'down') => {
    if (!form || !selectedQuestion) return;
    const index = form.questions.findIndex((q) => q.id === selectedQuestion.id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= form.questions.length) return;

    const reordered = [...form.questions];
    [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
    await api.reorderQuestions(
      form.id,
      reordered.map((question, orderIndex) => ({ question_id: question.id, order_index: orderIndex }))
    );
    await loadForm();
  };

  const togglePublish = async () => {
    if (!form) return;
    if (form.status === 'published') {
      await api.unpublishForm(form.id);
    } else {
      await api.publishForm(form.id);
    }
    await loadForm();
  };

  if (!form) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f5f1ec] text-[#171717]">Loading builder…</div>;
  }

  return (
    <main className="min-h-screen bg-[#f5f1eb] text-[#171717]">
      <header className="border-b border-[#e5ddd5] bg-[#f9f6f3]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <Link href="/studio" className="text-sm font-medium text-[#4a4c4d]">Studio</Link>
            <span className="text-[#8a8e8c]">/</span>
            <input
              value={titleDraft}
              onBlur={saveFormTitle}
              onChange={(event) => setTitleDraft(event.target.value)}
              className="w-[260px] border-none bg-transparent text-lg font-semibold text-[#1f1f1f] outline-none placeholder:text-[#8a8a8a]"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-full bg-[#181818] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Add content
            </button>
            <button
              onClick={() => alert('Advanced Logic Jumps & Branching (Coming Soon)')}
              className="rounded-full border border-[#d7d1ca] bg-white px-4 py-2.5 text-sm font-semibold text-[#181818]"
            >
              Logic
            </button>
            <button
              onClick={togglePublish}
              className="rounded-full border border-[#d7d1ca] bg-white px-4 py-2.5 text-sm font-semibold text-[#181818]"
            >
              {form.status === 'published' ? 'Unpublish' : 'Publish'}
            </button>
            <Link href={`/form/${form.id}`} className="rounded-full border border-[#d7d1ca] bg-white px-4 py-2.5 text-sm font-semibold text-[#181818]">
              Preview
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-5 px-5 py-5 lg:grid-cols-[300px_minmax(0,1fr)_360px]">
        <aside className="rounded-[28px] border border-[#e5ddd5] bg-[#fbf8f5] p-4 shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.2em] text-[#9a928b]">Questions</p>
            <button onClick={() => setShowAddModal(true)} className="text-xl text-[#171717]">＋</button>
          </div>

          <div className="mt-4 space-y-3">
            {form.questions.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-[#d9d0c8] bg-[#f6f2ef] p-4 text-sm text-[#5d5753]">
                No questions yet.
              </div>
            ) : (
              form.questions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => setSelectedId(question.id)}
                  className={`w-full rounded-[18px] border p-3 text-left transition ${
                    selectedId === question.id
                      ? 'border-[#ff7b62] bg-[#fff5f1] shadow-[0_10px_18px_rgba(255,107,74,0.10)]'
                      : 'border-[#ece3dc] bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#8b837d]">{question.question_type}</div>
                      <div className="mt-2 text-[1rem] font-semibold text-[#1d1d1d]">{question.title}</div>
                    </div>
                    {question.is_required ? <span className="text-[0.66rem] font-bold uppercase tracking-[0.12em] text-[#ff6b4a]">Required</span> : null}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="rounded-[28px] border border-[#e5ddd5] bg-[#fdfaf8] p-5 shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#9b9187]">
              <span>Editor</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => void moveQuestion('up')} className="rounded-full border border-[#d7d1ca] bg-white px-3 py-2 text-sm font-medium text-[#171717]">↑</button>
              <button onClick={() => void moveQuestion('down')} className="rounded-full border border-[#d7d1ca] bg-white px-3 py-2 text-sm font-medium text-[#171717]">↓</button>
            </div>
          </div>

          {selectedQuestion ? (
            <div className="space-y-5">
              <div className="rounded-[24px] bg-[#171717] p-6 text-white shadow-[0_20px_38px_rgba(15,23,42,0.2)]">
                <div className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-[#d7d7d7]">Preview</div>
                <h2 className="text-[2.3rem] font-black leading-[0.95] tracking-[-0.06em] text-white">
                  {selectedQuestion.title || 'Your question'}
                </h2>
                {selectedQuestion.description ? <p className="mt-3 text-[#d8d8d8]">{selectedQuestion.description}</p> : null}
                <div className="mt-6 rounded-[16px] border border-[#2a2d2f] bg-[#1a1d1d] p-4 text-[#b1b1b1]">
                  {selectedQuestion.question_type === 'multiple_choice' || selectedQuestion.question_type === 'dropdown' ? (
                    <div className="space-y-2">
                      {(selectedQuestion.properties?.choices ?? ['Option 1', 'Option 2']).map((choice, index) => (
                        <div key={`${choice}-${index}`} className="rounded-[12px] border border-[#2a2d2f] bg-[#141719] px-3 py-2 text-sm">
                          {typeof choice === 'string' ? choice : choice.label || 'Option'}
                        </div>
                      ))}
                    </div>
                  ) : selectedQuestion.question_type === 'yes_no' ? (
                    <div className="flex gap-3">
                      <div className="rounded-[12px] border border-[#2a2d2f] bg-[#141719] px-4 py-2 text-sm">Yes</div>
                      <div className="rounded-[12px] border border-[#2a2d2f] bg-[#141719] px-4 py-2 text-sm">No</div>
                    </div>
                  ) : selectedQuestion.question_type === 'file_upload' ? (
                    <div className="flex w-full flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[#2a2d2f] bg-[#141719] py-8 text-[#b7b7b7]">
                      <span className="mb-2 text-2xl">⬆️</span>
                      <span className="text-sm">File Upload Area</span>
                    </div>
                  ) : selectedQuestion.question_type === 'rating' ? (
                    <div className="flex gap-2 text-[1.8rem] text-[#ffca7a]">
                      {Array.from({ length: selectedQuestion.properties?.rating_scale ?? 5 }, (_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[12px] border border-[#2a2d2f] bg-[#141719] px-3 py-2 text-sm text-[#b7b7b7]">
                      Type your answer...
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 rounded-[20px] border border-[#eae0d9] bg-white p-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4d4d4d]">Question type</label>
                  <select
                    value={selectedQuestion.question_type}
                    onChange={(event) => {
                      const nextType = event.target.value as QuestionType;
                      void saveSelectedQuestion({
                        question_type: nextType,
                        properties: buildDefaultQuestion(nextType).properties,
                      });
                    }}
                    className="w-full rounded-[14px] border border-[#e3d9d3] bg-[#faf7f4] px-3 py-2 text-[#171717] outline-none"
                  >
                    {QUESTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4d4d4d]">Question title</label>
                  <input
                    value={selectedQuestion.title}
                    onChange={(event) => void saveSelectedQuestion({ title: event.target.value })}
                    className="w-full rounded-[14px] border border-[#e3d9d3] bg-[#faf7f4] px-3 py-2.5 text-[#171717] outline-none focus:border-[#ff7b62]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#4d4d4d]">Description</label>
                  <textarea
                    value={selectedQuestion.description || ''}
                    onChange={(event) => void saveSelectedQuestion({ description: event.target.value })}
                    className="min-h-[90px] w-full rounded-[14px] border border-[#e3d9d3] bg-[#faf7f4] px-3 py-2.5 text-[#171717] outline-none focus:border-[#ff7b62]"
                  />
                </div>

                <label className="flex items-center justify-between rounded-[16px] border border-[#ece3dc] bg-[#faf7f4] px-3 py-3 text-sm font-medium text-[#202020]">
                  <span>Required</span>
                  <input
                    type="checkbox"
                    checked={selectedQuestion.is_required}
                    onChange={(event) => void saveSelectedQuestion({ is_required: event.target.checked })}
                    className="h-4 w-4 accent-[#ff6b4a]"
                  />
                </label>

                {(selectedQuestion.question_type === 'multiple_choice' || selectedQuestion.question_type === 'dropdown') && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#4d4d4d]">Choices</label>
                    <div className="space-y-2">
                      {(selectedQuestion.properties?.choices ?? ['Option 1', 'Option 2']).map((choice, index) => (
                        <input
                          key={`${selectedQuestion.id}-${index}`}
                          value={typeof choice === 'string' ? choice : choice.label || ''}
                          onChange={(event) => {
                            const updatedChoices = [...(selectedQuestion.properties?.choices ?? ['Option 1', 'Option 2'])];
                            updatedChoices[index] = event.target.value;
                            void saveSelectedQuestion({ properties: { ...selectedQuestion.properties, choices: updatedChoices } });
                          }}
                          className="w-full rounded-[14px] border border-[#e3d9d3] bg-[#faf7f4] px-3 py-2.5 text-[#171717] outline-none focus:border-[#ff7b62]"
                        />
                      ))}
                      <button
                        onClick={() => {
                          const choices = [...(selectedQuestion.properties?.choices ?? ['Option 1', 'Option 2']), 'New option'];
                          void saveSelectedQuestion({ properties: { ...selectedQuestion.properties, choices } });
                        }}
                        className="rounded-full border border-[#d7d1ca] bg-white px-3 py-2 text-sm font-medium text-[#171717]"
                      >
                        Add option
                      </button>
                    </div>
                  </div>
                )}

                {selectedQuestion.question_type === 'rating' && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#4d4d4d]">Scale</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={selectedQuestion.properties?.rating_scale ?? 5}
                      onChange={(event) => {
                        const value = Number(event.target.value) || 5;
                        void saveSelectedQuestion({ properties: { ...selectedQuestion.properties, rating_scale: value } });
                      }}
                      className="w-full rounded-[14px] border border-[#e3d9d3] bg-[#faf7f4] px-3 py-2.5 text-[#171717] outline-none focus:border-[#ff7b62]"
                    />
                  </div>
                )}

                <button
                  onClick={() => void deleteQuestion(selectedQuestion.id)}
                  className="rounded-full border border-[#f4d5d0] bg-[#fff6f4] px-4 py-2.5 text-sm font-semibold text-[#ab5042]"
                >
                  Delete question
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center rounded-[24px] border border-dashed border-[#d8cec7] bg-[#f8f4f1] text-[#5d5753]">
              Select or add a question to begin editing.
            </div>
          )}
        </section>

        <aside className="rounded-[28px] border border-[#e5ddd5] bg-[#fbf8f5] p-4 shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.2em] text-[#9a928b]">Form settings</p>
          <div className="mt-4 space-y-4">
            <div className="rounded-[18px] border border-[#eae0d9] bg-white p-3">
              <div className="text-xs font-medium uppercase tracking-[0.14em] text-[#877f78]">Status</div>
              <div className="mt-2 text-lg font-bold text-[#171717]">{form.status}</div>
            </div>
            <div className="rounded-[18px] border border-[#eae0d9] bg-white p-3">
              <div className="text-xs font-medium uppercase tracking-[0.14em] text-[#877f78]">Responses</div>
              <div className="mt-2 text-lg font-bold text-[#171717]">{form.response_count}</div>
            </div>
            <div className="rounded-[18px] border border-[#eae0d9] bg-white p-3">
              <div className="text-xs font-medium uppercase tracking-[0.14em] text-[#877f78]">Share URL</div>
              <div className="mt-2 text-sm font-medium break-all text-[#171717]">/form/{form.id}</div>
            </div>
          </div>
        </aside>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/35 p-5 backdrop-blur-[2px]">
          <div className="w-full max-w-[900px] rounded-[28px] border border-[#e5ddd5] bg-[#f9f6f4] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.2)]">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-[-0.06em] text-[#171717]">Add question</h3>
              <button onClick={() => setShowAddModal(false)} className="text-3xl text-[#333]">×</button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {QUESTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => void addQuestion(type.value)}
                  className="rounded-[20px] border border-[#ebdfd8] bg-white px-4 py-4 text-left transition hover:border-[#ff7b62] hover:bg-[#fff8f5]"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#fff1eb] text-base font-black text-[#ff6b4a]">
                    +
                  </div>
                  <div className="text-base font-bold text-[#171717]">{type.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
