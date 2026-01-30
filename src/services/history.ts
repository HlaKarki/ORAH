import type { ExplanationResponse, HistoryFilter } from '@/types';
import { getStorageItem, setStorageItem, simulateAPICall } from './api';

const HISTORY_KEY = 'explainit_history';

const MOCK_HISTORY: ExplanationResponse[] = [
  {
    id: 'exp_mock_001',
    title: 'The Economic Moat',
    script_for_audio: `An economic moat is a company's ability to maintain competitive advantages over its rivals to protect its long-term profits and market share. Like a medieval castle's moat, it keeps the competition at bay. Think of your favorite pizza place. If they're the only ones in town with a secret sauce recipe, that's their moat! There are several types of moats. Brand Power is when people love and trust a company so much they won't buy from anyone else. Network effects occur when a product becomes more valuable as more people use it. Think about how useful your phone would be if you were the only person who had one. Cost advantages happen when a company can produce things cheaper than competitors. Understanding moats helps you identify strong investments and businesses that will thrive long-term.`,
    audioDuration: 150,
    createdAt: new Date().toISOString(),
    audience: '5yo',
    isSaved: false,
    one_page_content: {
      summary_1_sentence: "An economic moat is a company's ability to maintain competitive advantages over its rivals to protect its long-term profits and market share.",
      analogy: "Think of your favorite pizza place. If they're the only ones in town with a secret sauce recipe, that's their moat!",
      key_points: ['Brand Power - Customer loyalty that keeps them coming back', 'Network Effects - More users = more value for everyone', 'Cost Advantages - Producing cheaper than competitors'],
      key_terms: [
        { term: 'Economic Moat', definition: 'Sustainable competitive advantage' },
        { term: 'Network Effect', definition: 'Value increases with more users' },
        { term: 'Switching Costs', definition: 'Barriers to change products' },
      ],
      why_it_matters: 'Understanding moats helps identify strong long-term investments.',
      related_topics: ['Competitive Advantages', 'Market Dominance', 'Barriers to Entry'],
    },
  },
  {
    id: 'exp_mock_002',
    title: 'Quantum Computing Basics',
    script_for_audio: `Quantum computing uses quantum bits or qubits that can exist in multiple states simultaneously, unlike regular bits that are either 0 or 1. This is called superposition. Imagine a coin spinning in the air - it's both heads and tails until it lands. That's like a qubit! Quantum computers can solve certain problems much faster than regular computers by trying many solutions at once. They're especially good at cryptography, drug discovery, and optimization problems. However, they need to be kept extremely cold and are very sensitive to interference. This makes them challenging to build and maintain.`,
    audioDuration: 120,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    audience: 'college',
    isSaved: true,
    one_page_content: {
      summary_1_sentence: 'Quantum computing uses qubits that can exist in multiple states simultaneously, enabling faster problem-solving for specific applications.',
      analogy: "Imagine a coin spinning in the air - it's both heads and tails until it lands. That's like a qubit!",
      key_points: ['Qubits can be 0 and 1 at the same time (superposition)', 'Quantum entanglement links qubits together', 'Best for cryptography, simulation, and optimization'],
      key_terms: [
        { term: 'Qubit', definition: 'Quantum bit - basic unit of quantum information' },
        { term: 'Superposition', definition: 'Existing in multiple states at once' },
        { term: 'Entanglement', definition: 'Quantum correlation between particles' },
      ],
      why_it_matters: 'Quantum computers will revolutionize medicine, cryptography, and AI.',
      related_topics: ['Classical Computing', 'Cryptography', 'Physics'],
    },
  },
  {
    id: 'exp_mock_003',
    title: 'Machine Learning 101',
    script_for_audio: `Machine learning is a type of artificial intelligence that allows computers to learn from data without being explicitly programmed. Instead of writing rules, you show the computer lots of examples. Think of teaching a child to recognize cats - you show them many pictures of cats until they can identify new ones. There are three main types of machine learning. Supervised learning is where you provide labeled examples. Unsupervised learning is where the computer finds patterns on its own. And reinforcement learning is where the computer learns through trial and error, like playing a video game. Machine learning powers many things we use every day, from Netflix recommendations to voice assistants.`,
    audioDuration: 110,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    audience: 'highschool',
    isSaved: false,
    one_page_content: {
      summary_1_sentence: 'Machine learning enables computers to learn patterns from data and make predictions without explicit programming.',
      analogy: 'Teaching a child to recognize cats by showing many pictures until they can identify new ones.',
      key_points: ['Supervised learning uses labeled training data', 'Unsupervised learning discovers hidden patterns', 'Reinforcement learning uses rewards and penalties'],
      key_terms: [
        { term: 'Training Data', definition: 'Examples used to teach the model' },
        { term: 'Model', definition: 'The learned pattern or algorithm' },
        { term: 'Inference', definition: 'Making predictions on new data' },
      ],
      why_it_matters: 'ML powers recommendations, voice assistants, and autonomous vehicles.',
      related_topics: ['Deep Learning', 'Neural Networks', 'Data Science'],
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
