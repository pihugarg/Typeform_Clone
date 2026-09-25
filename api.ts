import {
  Form,
  FormListItem,
  Question,
  QuestionType,
  QuestionProperties,
  FormStats,
  ResponseItem,
  ResponseSubmitRequest
} from './src/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    let errorDetail = 'Request failed';
    try {
      const errorJson = await res.json();
      errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
    } catch {
      errorDetail = await res.text();
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  baseUrl: API_BASE_URL,

  // Health
  checkHealth: () => fetchJson<{ status: string }>('/api/health'),

  // Forms
  getForms: () => fetchJson<FormListItem[]>('/api/forms'),

  getForm: (id: string) => fetchJson<Form>(`/api/forms/${id}`),

  createForm: (data: { title: string; description?: string; status?: 'draft' | 'published' }) =>
    fetchJson<Form>('/api/forms', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateForm: (
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: 'draft' | 'published';
      theme?: Record<string, any>;
      settings?: Record<string, any>;
    }
  ) =>
    fetchJson<Form>(`/api/forms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  deleteForm: (id: string) =>
    fetchJson<{ success: boolean; message: string }>(`/api/forms/${id}`, {
      method: 'DELETE'
    }),

  duplicateForm: (id: string) =>
    fetchJson<Form>(`/api/forms/${id}/duplicate`, {
      method: 'POST'
    }),

  publishForm: (id: string) =>
    fetchJson<{ status: string; form_id: string; share_url: string }>(`/api/forms/${id}/publish`, {
      method: 'POST'
    }),

  unpublishForm: (id: string) =>
    fetchJson<{ status: string; form_id: string }>(`/api/forms/${id}/unpublish`, {
      method: 'POST'
    }),

  // Questions
  addQuestion: (
    formId: string,
    data: {
      question_type: QuestionType;
      title: string;
      description?: string;
      is_required?: boolean;
      properties?: QuestionProperties;
    }
  ) =>
    fetchJson<Question>(`/api/forms/${formId}/questions`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateQuestion: (
    id: string,
    data: {
      title?: string;
      description?: string;
      is_required?: boolean;
      properties?: QuestionProperties;
    }
  ) =>
    fetchJson<Question>(`/api/questions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  deleteQuestion: (id: string) =>
    fetchJson<{ success: boolean; message: string }>(`/api/questions/${id}`, {
      method: 'DELETE'
    }),

  reorderQuestions: (formId: string, orders: { question_id: string; order_index: number }[]) =>
    fetchJson<Question[]>(`/api/forms/${formId}/questions/reorder`, {
      method: 'POST',
      body: JSON.stringify({ orders: orders.map(({ question_id, order_index }) => ({ id: question_id, order_index })) })
    }),

  // Public Flow
  getPublicForm: (formId: string) =>
    fetchJson<Form>(`/api/public/forms/${formId}`),

  getPreviewForm: (formId: string) =>
    fetchJson<Form>(`/api/forms/${formId}/preview`),

  submitResponse: (formId: string, data: ResponseSubmitRequest) =>
    fetchJson<{ success: boolean; submission_id: string; submitted_at: string }>(
      `/api/public/forms/${formId}/submit`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    ),

  // Analytics & Results
  getResponses: (formId: string) =>
    fetchJson<ResponseItem[]>(`/api/forms/${formId}/responses`),

  getResponse: (formId: string, responseId: string) =>
    fetchJson<ResponseItem>(`/api/forms/${formId}/responses/${responseId}`),

  getStats: (formId: string) =>
    fetchJson<FormStats>(`/api/forms/${formId}/stats`),

  getCsvExportUrl: (formId: string) =>
    `${API_BASE_URL}/api/forms/${formId}/export/csv`
};
