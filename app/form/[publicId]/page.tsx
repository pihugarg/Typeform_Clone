"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Form } from '@/types';

export default function PublicFormPage() {
  const params = useParams();
  const router = useRouter();
  const publicId = Array.isArray(params?.publicId) ? params.publicId[0] : params?.publicId ?? '';

  const [form, setForm] = useState<Form | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!publicId) return;
    api.getPublicForm(publicId)
      .then((data) => setForm(data))
      .catch(() => router.push('/'));
  }, [publicId, router]);

  const question = form?.questions[index] ?? null;
  const progress = useMemo(() => {
    if (!form || form.questions.length === 0) return 0;
    return Math.round(((index + 1) / form.questions.length) * 100);
  }, [form, index]);

  const handleAnswerChange = (value: any) => {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    setError('');
  };

  const validateCurrentQuestion = () => {
    if (!question) return true;
    const answer = answers[question.id];

    if (question.is_required && (answer === undefined || answer === '' || answer === null)) {
      setError('This question is required.');
      return false;
    }

    if (question.question_type === 'email' && typeof answer === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (question.question_type === 'number' && (answer === '' || Number.isNaN(Number(answer)))) {
      setError('Please enter a valid number.');
      return false;
    }

    return true;
  };

  const nextQuestion = () => {
    if (!question || !form) return;
    if (!validateCurrentQuestion()) return;

    if (index < form.questions.length - 1) {
      setIndex((prev) => prev + 1);
      return;
    }

    void submitForm();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If pressing Enter and not in a textarea, try to advance
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement;
        if (target.tagName.toLowerCase() !== 'textarea') {
          e.preventDefault();
          nextQuestion();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index, form, question, answers]); // Depend on state used in nextQuestion

  const submitForm = async () => {
    if (!form) return;
    const payload = {
      answers: form.questions.map((q) => ({ question_id: q.id, value: answers[q.id] ?? '' })),
      completion_time_seconds: 30,
      started_at: new Date().toISOString(),
    };

    await api.submitResponse(form.id, payload as any);
    setSubmitted(true);
  };

  if (!form) return <div className="flex min-h-screen items-center justify-center bg-[#f6f3ee] text-[#171717]">Loading form...</div>;

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f3ee] p-8">
        <div className="rounded-[30px] bg-[#1a1a1a] p-12 text-center text-white shadow-[0_30px_50px_rgba(0,0,0,0.2)]">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#ff6b4a] text-3xl">✓</div>
          <h1 className="text-4xl font-black tracking-[-0.06em]">Thank you!</h1>
          <p className="mt-4 text-lg text-[#d5d5d5]">Your response has been successfully submitted.</p>
        </div>
      </main>
    );
  }

  if (!question) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f3ee] p-8">
        <div className="rounded-[30px] bg-white p-8 text-center shadow-[0_20px_40px_rgba(17,17,17,0.08)]">
          <h1 className="text-3xl font-black tracking-[-0.06em] text-[#171717]">No questions yet</h1>
          <p className="mt-2 text-[#615d5a]">This form has not been filled out by the creator.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f3ee] p-6">
      <div className="w-full max-w-5xl rounded-[32px] bg-[#f4f0ea] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] ring-1 ring-[#e4ddd5]">
        <div className="mb-7 flex items-center justify-between text-sm text-[#4c4944]">
          <div className="flex items-center gap-3">
            <button onClick={() => index > 0 && setIndex((prev) => prev - 1)} className="text-xl font-bold">←</button>
            <span>{index + 1} of {form.questions.length}</span>
          </div>
          <span className="font-semibold text-[#171717]">{progress}%</span>
        </div>

        <div className="mb-8 h-2.5 w-full overflow-hidden rounded-full bg-[#e8e0d8]">
          <div className="h-full rounded-full bg-[#ff6b4a] transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="rounded-[26px] bg-[#151819] p-6 text-white shadow-[0_18px_40px_rgba(0,0,0,0.15)] md:p-8">
          <div className="mb-6 text-xs uppercase tracking-[0.2em] text-[#d2d2d2]">{form.title}</div>
          <h2 className="max-w-[620px] text-[2.7rem] font-black leading-[0.95] tracking-[-0.07em] text-white md:text-[4.1rem]">
            {question.title}
          </h2>

          {question.description && <p className="mt-4 text-[#d5d5d5]">{question.description}</p>}

          <div className="mt-8">
            {question.question_type === 'multiple_choice' ? (
              <div className="space-y-3">
                {(question.properties?.choices ?? ['Option 1', 'Option 2']).map((choice: any, idx: number) => {
                  const value = typeof choice === 'string' ? choice : choice.label ?? 'Option';
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerChange(value)}
                      className={`block w-full rounded-2xl border px-4 py-3 text-left text-base ${
                        answers[question.id] === value ? 'border-[#ff6b4a] bg-[#2a1b17]' : 'border-[#2d2f31] bg-[#1a1d1d]'
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            ) : question.question_type === 'yes_no' ? (
              <div className="flex gap-3">
                {['Yes', 'No'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswerChange(option)}
                    className={`rounded-2xl border px-5 py-3 text-base font-medium ${
                      answers[question.id] === option ? 'border-[#ff6b4a] bg-[#2a1b17]' : 'border-[#2d2f31] bg-[#1a1d1d]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : question.question_type === 'file_upload' ? (
              <div className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#2d2f31] bg-[#1a1d1d] py-10">
                <input
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) handleAnswerChange(file.name);
                  }}
                  className="w-full max-w-xs text-sm text-[#7f7f7f] file:mr-4 file:rounded-full file:border-0 file:bg-[#ff6b4a] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#e5593c]"
                />
                <p className="mt-2 text-xs text-[#7f7f7f]">Click to upload a file</p>
                {answers[question.id] && <p className="mt-2 text-sm text-[#ffde59]">Selected: {answers[question.id]}</p>}
              </div>
            ) : question.question_type === 'rating' ? (
              <div className="flex gap-3 text-3xl">
                {Array.from({ length: Number(question.properties?.rating_scale ?? 5) }, (_, i) => i + 1).map((value) => (
                  <button
                    key={value}
                    onClick={() => handleAnswerChange(value)}
                    className={`transition ${answers[question.id] === value ? 'scale-110 text-[#ffde59]' : 'text-[#8a8a8a]'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            ) : (
              <input
                type={question.question_type === 'email' ? 'email' : question.question_type === 'number' ? 'number' : 'text'}
                value={answers[question.id] ?? ''}
                onChange={(event) => handleAnswerChange(event.target.value)}
                placeholder="Type your answer..."
                className="w-full rounded-2xl border border-[#2d2f31] bg-[#1a1d1d] px-4 py-3 text-lg text-white placeholder:text-[#7f7f7f] outline-none focus:border-[#ff6b4a]"
              />
            )}

            {error ? <p className="mt-4 text-sm font-medium text-[#ff9a87]">{error}</p> : null}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => index > 0 && setIndex((prev) => prev - 1)}
              className="rounded-full border border-[#2d2f31] bg-transparent px-5 py-3 text-sm font-medium text-[#f3f3f3]"
            >
              Previous
            </button>
            <button
              onClick={nextQuestion}
              className="rounded-full bg-[#ff6b4a] px-6 py-3 font-semibold text-white shadow-[0_12px_20px_rgba(255,107,74,0.28)]"
            >
              {index === form.questions.length - 1 ? 'Submit' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
