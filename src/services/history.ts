import type { ExplanationResponse, HistoryFilter } from '@/types';
import { getStorageItem, setStorageItem, simulateAPICall } from './api';

const HISTORY_KEY = 'explainit_history';

const MOCK_HISTORY: ExplanationResponse[] = [
  {
    id: 'exp_mock_001',
    title: 'The Economic Moat',
    script_for_audio: "An economic moat is a company's ability to maintain competitive advantages...",
    audioDuration: 150,
    createdAt: new Date().toISOString(),
    audience: '5yo',
    isSaved: false,
    one_page_content: {
      summary_1_sentence: "An economic moat is a company's ability to maintain competitive advantages.",
      analogy: 'Like a castle moat protects from invaders.',
      key_points: ['Brand Power', 'Network Effects', 'Cost Advantages'],
      key_terms: [{ term: 'Economic Moat', definition: 'Sustainable competitive advantage' }],
      why_it_matters: 'Helps identify strong investments.',
      related_topics: ['Competitive Advantages', 'Market Dominance'],
    },
  },
  {
    id: 'exp_mock_002',
    title: 'Quantum Computing Basics',
    script_for_audio: 'Quantum computing uses quantum bits or qubits...',
    audioDuration: 120,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    audience: 'college',
    isSaved: true,
    one_page_content: {
      summary_1_sentence: 'Quantum computing uses qubits that can exist in multiple states.',
      analogy: 'Like a coin spinning in the air.',
      key_points: ['Superposition', 'Entanglement', 'Quantum Gates'],
      key_terms: [{ term: 'Qubit', definition: 'Quantum bit' }],
      why_it_matters: 'Will revolutionize computing.',
      related_topics: ['Classical Computing', 'Cryptography'],
    },
  },
  {
    id: 'exp_mock_003',
    title: 'Machine Learning 101',
    script_for_audio: 'Machine learning is a type of artificial intelligence...',
    audioDuration: 110,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    audience: 'highschool',
    isSaved: false,
    one_page_content: {
      summary_1_sentence: 'Machine learning enables computers to learn from data.',
      analogy: 'Teaching a child to recognize cats.',
      key_points: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning'],
      key_terms: [{ term: 'Training Data', definition: 'Examples to learn from' }],
      why_it_matters: 'Powers modern AI applications.',
      related_topics: ['Deep Learning', 'Neural Networks'],
    },
  },
];

function initializeHistory(): ExplanationResponse[] {
  const stored = getStorageItem<ExplanationResponse[]>(HISTORY_KEY, []);
  if (stored.length === 0) {
    setStorageItem(HISTORY_KEY, MOCK_HISTORY);
    return MOCK_HISTORY;
  }
  return stored;
}

export async function getHistory(filter: HistoryFilter = { type: 'all' }): Promise<ExplanationResponse[]> {
  return simulateAPICall(
    () => {
      const history = initializeHistory();
      const now = new Date();
      
      switch (filter.type) {
        case 'today': {
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          return history.filter((item) => new Date(item.createdAt) >= startOfDay);
        }
        case 'week': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return history.filter((item) => new Date(item.createdAt) >= weekAgo);
        }
        case 'month': {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return history.filter((item) => new Date(item.createdAt) >= monthAgo);
        }
        default:
          return history;
      }
    },
    300,
    0
  );
}

export async function addToHistory(explanation: ExplanationResponse): Promise<void> {
  return simulateAPICall(
    () => {
      const history = getStorageItem<ExplanationResponse[]>(HISTORY_KEY, []);
      const updated = [explanation, ...history.filter((h) => h.id !== explanation.id)];
      setStorageItem(HISTORY_KEY, updated);
    },
    100,
    0
  );
}

export async function deleteFromHistory(id: string): Promise<void> {
  return simulateAPICall(
    () => {
      const history = getStorageItem<ExplanationResponse[]>(HISTORY_KEY, []);
      const updated = history.filter((item) => item.id !== id);
      setStorageItem(HISTORY_KEY, updated);
    },
    200,
    0
  );
}

export async function clearHistory(): Promise<void> {
  return simulateAPICall(
    () => {
      setStorageItem(HISTORY_KEY, []);
    },
    300,
    0
  );
}

export async function getExplanationById(id: string): Promise<ExplanationResponse | null> {
  return simulateAPICall(
    () => {
      const history = getStorageItem<ExplanationResponse[]>(HISTORY_KEY, []);
      return history.find((item) => item.id === id) ?? null;
    },
    100,
    0
  );
}

export async function searchHistory(query: string): Promise<ExplanationResponse[]> {
  return simulateAPICall(
    () => {
      const history = getStorageItem<ExplanationResponse[]>(HISTORY_KEY, []);
      const lowerQuery = query.toLowerCase();
      return history.filter(
        (item) =>
          item.title.toLowerCase().includes(lowerQuery) ||
          item.one_page_content.summary_1_sentence.toLowerCase().includes(lowerQuery)
      );
    },
    200,
    0
  );
}
