'use client'

import { useState } from 'react'

interface InputScreenProps {
  onSubmit: (topic: string) => void
}

const EXAMPLE_TOPICS = [
  'How do transformers work in AI?',
  'What is quantum entanglement?',
  'How does the TCP/IP protocol work?',
  'Explain recursion in programming',
  'How do vaccines train the immune system?',
  'What is the blockchain?'
]

export default function InputScreen({ onSubmit }: InputScreenProps) {
  const [topic, setTopic] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (topic.trim()) {
      onSubmit(topic.trim())
    }
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-10 border border-gray-700">
      <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-center">
        What do you want to master?
      </h2>
      <p className="text-gray-400 text-center mb-8">
        Enter a topic and we&apos;ll teach you, then test your understanding
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., How do neural networks learn?"
            className="w-full bg-gray-900/50 border border-gray-600 rounded-xl p-4 text-lg
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                     focus:outline-none transition-all resize-none h-32"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={!topic.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600
                   hover:from-purple-500 hover:to-pink-500
                   disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed
                   text-white font-semibold py-4 px-6 rounded-xl text-lg
                   transition-all duration-200 transform hover:scale-[1.02]"
        >
          Start Learning
        </button>
      </form>

      <div className="mt-10">
        <p className="text-sm text-gray-500 mb-4 text-center">Try one of these:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {EXAMPLE_TOPICS.map((example) => (
            <button
              key={example}
              onClick={() => setTopic(example)}
              className="bg-gray-700/50 hover:bg-gray-700 text-gray-300 text-sm
                       px-3 py-2 rounded-lg transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
