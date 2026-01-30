import type { ExplanationResponse, AudienceLevel } from '@/types';
import { simulateAPICall, generateId } from './api';

const MOCK_EXPLANATIONS: Record<string, Partial<ExplanationResponse>> = {
  default: {
    title: 'The Economic Moat',
    script_for_audio: `An economic moat is a company's ability to maintain competitive advantages over its rivals to protect its long-term profits and market share. Like a medieval castle's moat, it keeps the competition at bay. Think of your favorite pizza place. If they're the only ones in town with a secret sauce recipe, that's their moat! There are several types of moats. Brand Power is when people love and trust a company so much they won't buy from anyone else. Network effects occur when a product becomes more valuable as more people use it. Think about how useful your phone would be if you were the only person who had one. Cost advantages happen when a company can produce things cheaper than competitors. Understanding moats helps you identify strong investments and businesses that will thrive long-term.`,
    audioDuration: 150,
    one_page_content: {
      summary_1_sentence: "An economic moat is a company's ability to maintain competitive advantages over its rivals to protect its long-term profits and market share.",
      analogy: "Think of your favorite pizza place. If they're the only ones in town with a secret sauce recipe, that's their moat!",
      key_points: [
        'Brand Power - Customer loyalty that keeps them coming back',
        'Network Effects - More users = more value for everyone',
        'Cost Advantages - Producing cheaper than competitors',
      ],
      key_terms: [
        { term: 'Economic Moat', definition: 'Sustainable competitive advantage' },
        { term: 'Network Effect', definition: 'Value increases with more users' },
        { term: 'Switching Costs', definition: 'Barriers to change products' },
      ],
      why_it_matters: 'Understanding moats helps identify strong long-term investments.',
      related_topics: ['Competitive Advantages', 'Market Dominance', 'Barriers to Entry'],
    },
  },
  quantum: {
    title: 'Quantum Computing Basics',
    script_for_audio: `Quantum computing uses quantum bits or qubits that can exist in multiple states simultaneously, unlike regular bits that are either 0 or 1. This is called superposition. Imagine a coin spinning in the air - it's both heads and tails until it lands. That's like a qubit! Quantum computers can solve certain problems much faster than regular computers by trying many solutions at once. They're especially good at cryptography, drug discovery, and optimization problems. However, they need to be kept extremely cold and are very sensitive to interference.`,
    audioDuration: 120,
    one_page_content: {
      summary_1_sentence: 'Quantum computing uses qubits that can exist in multiple states simultaneously, enabling faster problem-solving for specific applications.',
      analogy: "Imagine a coin spinning in the air - it's both heads and tails until it lands. That's like a qubit!",
      key_points: [
        'Qubits can be 0 and 1 at the same time (superposition)',
        'Quantum entanglement links qubits together',
        'Best for cryptography, simulation, and optimization',
      ],
      key_terms: [
        { term: 'Qubit', definition: 'Quantum bit - basic unit of quantum information' },
        { term: 'Superposition', definition: 'Existing in multiple states at once' },
        { term: 'Entanglement', definition: 'Quantum correlation between particles' },
      ],
      why_it_matters: 'Quantum computers will revolutionize medicine, cryptography, and AI.',
      related_topics: ['Classical Computing', 'Cryptography', 'Physics'],
    },
  },
  ml: {
    title: 'Machine Learning 101',
    script_for_audio: `Machine learning is a type of artificial intelligence that allows computers to learn from data without being explicitly programmed. Instead of writing rules, you show the computer lots of examples. Think of teaching a child to recognize cats - you show them many pictures of cats until they can identify new ones. There are three main types: supervised learning where you provide labeled examples, unsupervised learning where the computer finds patterns on its own, and reinforcement learning where the computer learns through trial and error like playing a video game.`,
    audioDuration: 110,
    one_page_content: {
      summary_1_sentence: 'Machine learning enables computers to learn patterns from data and make predictions without explicit programming.',
      analogy: 'Teaching a child to recognize cats by showing many pictures until they can identify new ones.',
      key_points: [
        'Supervised learning uses labeled training data',
        'Unsupervised learning discovers hidden patterns',
        'Reinforcement learning uses rewards and penalties',
      ],
      key_terms: [
        { term: 'Training Data', definition: 'Examples used to teach the model' },
        { term: 'Model', definition: 'The learned pattern or algorithm' },
        { term: 'Inference', definition: 'Making predictions on new data' },
      ],
      why_it_matters: 'ML powers recommendations, voice assistants, and autonomous vehicles.',
      related_topics: ['Deep Learning', 'Neural Networks', 'Data Science'],
    },
  },
};

function getMockExplanation(topic: string): Partial<ExplanationResponse> {
  const lowerTopic = topic.toLowerCase();
  
  if (lowerTopic.includes('quantum')) {
    return MOCK_EXPLANATIONS.quantum!;
  }
  if (lowerTopic.includes('machine learning') || lowerTopic.includes('ml') || lowerTopic.includes('ai')) {
    return MOCK_EXPLANATIONS.ml!;
  }
  
  return {
    ...MOCK_EXPLANATIONS.default!,
    title: topic.length > 50 ? topic.substring(0, 50) + '...' : topic || 'The Economic Moat',
  };
}

export async function generateExplanation(
  topic: string,
  audience: AudienceLevel = '5yo'
): Promise<ExplanationResponse> {
  return simulateAPICall(
    () => {
      const mockData = getMockExplanation(topic);
      
      const explanation: ExplanationResponse = {
        id: generateId(),
        title: mockData.title ?? topic,
        script_for_audio: mockData.script_for_audio ?? '',
        audioDuration: mockData.audioDuration ?? 120,
        createdAt: new Date().toISOString(),
        audience,
        isSaved: false,
        one_page_content: mockData.one_page_content ?? {
          summary_1_sentence: '',
          analogy: '',
          key_points: [],
          key_terms: [],
          why_it_matters: '',
          related_topics: [],
        },
      };
      
      return explanation;
    },
    2500,
    0
  );
}

export async function regenerateExplanation(
  id: string,
  audience: AudienceLevel
): Promise<ExplanationResponse> {
  return simulateAPICall(
    () => {
      const mockData = MOCK_EXPLANATIONS.default!;
      
      return {
        id,
        title: mockData.title ?? 'Regenerated Explanation',
        script_for_audio: mockData.script_for_audio ?? '',
        audioDuration: mockData.audioDuration ?? 120,
        createdAt: new Date().toISOString(),
        audience,
        isSaved: false,
        one_page_content: mockData.one_page_content!,
      };
    },
    1500,
    0
  );
}
