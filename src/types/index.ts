export interface KeyTerm {
  term: string;
  definition: string;
}

export interface OnePageContent {
  summary_1_sentence: string;
  analogy: string;
  key_points: string[];
  key_terms: KeyTerm[];
  why_it_matters: string;
  related_topics: string[];
}

export interface ExplanationResponse {
  id: string;
  title: string;
  script_for_audio: string;
  audioDuration: number;
  createdAt: string;
  audience: AudienceLevel;
  isSaved: boolean;
  one_page_content: OnePageContent;
}

export type AppState = 'idle' | 'processing' | 'results' | 'error';

export type AudienceLevel = '5yo' | 'highschool' | 'college' | 'professional' | 'expert';

export type OutputFormat = 'audio-pdf' | 'audio-only' | 'pdf-only';

export interface AppSettings {
  voice: string;
  speed: number;
  theme: 'dark' | 'light' | 'system';
  autoPlay: boolean;
  showTranscript: boolean;
}

export interface HistoryFilter {
  type: 'all' | 'today' | 'week' | 'month';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export const AUDIENCE_OPTIONS: { value: AudienceLevel; label: string; description: string }[] = [
  { value: '5yo', label: '5-Year Old', description: 'Simple words and fun analogies' },
  { value: 'highschool', label: 'High Schooler', description: 'Basic concepts with examples' },
  { value: 'college', label: 'College Student', description: 'Technical details with context' },
  { value: 'professional', label: 'Professional', description: 'In-depth analysis with terminology' },
  { value: 'expert', label: 'Expert', description: 'Advanced concepts and nuances' },
];

export const OUTPUT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: 'audio-pdf', label: 'Audio + PDF' },
  { value: 'audio-only', label: 'Audio Only' },
  { value: 'pdf-only', label: 'PDF Only' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  voice: 'default',
  speed: 1.0,
  theme: 'dark',
  autoPlay: true,
  showTranscript: false,
};
