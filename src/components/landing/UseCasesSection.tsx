'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const useCases = [
  {
    id: 1,
    title: 'Professional Documents',
    description: 'Create formatted meeting minutes, agendas, and business reports using the advanced MS Word-like editor.',
    icon: '📄',
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-900/20',
    textColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 2,
    title: 'Academic Research',
    description: 'Map out literature, track experiments, and write research papers in our dedicated Research Workspace.',
    icon: '🔬',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-900/20',
    textColor: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    id: 3,
    title: 'Voice Transcripts',
    description: 'Speak in Urdu and automatically generate perfectly translated English transcripts and notes.',
    icon: '🎙️',
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-900/20',
    textColor: 'text-purple-600 dark:text-purple-400'
  },
  {
    id: 4,
    title: 'Private Journals',
    description: 'Keep your personal thoughts, diaries, and sensitive information secure inside your Personal Vault.',
    icon: '🔒',
    bgLight: 'bg-pink-50',
    bgDark: 'dark:bg-pink-900/20',
    textColor: 'text-pink-600 dark:text-pink-400'
  },
  {
    id: 5,
    title: 'Quick Ideas',
    description: 'Capture fleeting thoughts, to-do lists, and brainstorms instantly with our fast, distraction-free UI.',
    icon: '💡',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-900/20',
    textColor: 'text-amber-600 dark:text-amber-400'
  },
  {
    id: 6,
    title: 'Team Workspaces',
    description: 'Collaborate on shared projects, task lists, and team wikis with real-time syncing and sharing.',
    icon: '🤝',
    bgLight: 'bg-indigo-50',
    bgDark: 'dark:bg-indigo-900/20',
    textColor: 'text-indigo-600 dark:text-indigo-400'
  }
];

export default function UseCasesSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section id="use-cases" className="py-20 bg-gray-50 dark:bg-gray-800/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Everything You Can Create
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            From quick thoughts to comprehensive research, here's what you can build in your digital workspace.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
            >
              <div className={`w-16 h-16 rounded-2xl ${useCase.bgLight} ${useCase.bgDark} flex items-center justify-center mb-6`}>
                <span className="text-3xl">{useCase.icon}</span>
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${useCase.textColor}`}>
                {useCase.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {useCase.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
