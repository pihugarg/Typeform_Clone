export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'multiple_choice'
  | 'dropdown'
  | 'email'
  | 'number'
  | 'yes_no'
  | 'rating';

export interface ChoiceObject {
  id?: string;
  label?: string;
  value?: string;
  text?: string;
}

export type ChoiceItem = string | ChoiceObject;

export function getChoiceLabel(choice: any): string {
  if (choice === null || choice === undefined) return '';
  if (typeof choice === 'string') return choice;
  if (typeof choice === 'object') {
    return choice.label || choice.text || choice.title || choice.value || choice.id || '';
  }
  return String(choice);
}

export interface QuestionProperties {
  placeholder?: string;
  choices?: ChoiceItem[];
  rating_scale?: number;
  max_rating?: number;
  min_rating?: number;
  rating_icon?: 'star' | 'number';
  min_value?: number;
  max_value?: number;
  [key: string]: any;
}

export interface Question {
  id: string;
  form_id: string;
  order_index: number;
  question_type: QuestionType;
  title: string;
  description?: string;
  is_required: boolean;
  properties: QuestionProperties;
}

export interface FormTheme {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
}

export interface FormSettings {
  showProgressBar?: boolean;
  submitButtonText?: string;
  thankYouTitle?: string;
  thankYouMessage?: string;
  redirectUrl?: string;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published';
  theme: FormTheme;
  settings: FormSettings;
  created_at: string;
  updated_at: string;
  questions: Question[];
  response_count: number;
}

export interface FormListItem {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  question_count: number;
  response_count: number;
}

export interface AnswerSubmit {
  question_id: string;
  value: any;
}

export interface ResponseSubmitRequest {
  answers: AnswerSubmit[];
  completion_time_seconds: number;
}

export interface ResponseItem {
  id: string;
  form_id: string;
  submitted_at: string;
  completion_time_seconds: number;
  answers: {
    question_id: string;
    question_title?: string;
    question_type: string;
    value: any;
  }[];
}

export interface QuestionStat {
  question_id: string;
  title: string;
  question_type: string;
  total_answers: number;
  breakdown?: Record<string, number> | null;
  average?: number | null;
  min?: number | null;
  max?: number | null;
}

export interface FormStats {
  form_id: string;
  total_responses: number;
  average_completion_time_seconds: number;
  questions: QuestionStat[];
}
