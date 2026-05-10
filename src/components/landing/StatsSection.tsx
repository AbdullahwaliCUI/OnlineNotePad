'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';

const stats = [
  {
    id: 1,
    number: 15000,
    suffix: '+',
    label: 'Active Users',
    description: 'Professionals trust NotepadX',
    icon: '👥',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 2,
    number: 250000,
    suffix: '+',
    label: 'Notes Created',
    description: 'Ideas captured and organized',
    icon: '📝',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 3,
    number: 50000,
    suffix: '+',
    label: 'Voice Notes',
    description: 'Spoken words transformed',
    icon: '🎤',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 4,
    number: 98,
    suffix: '%',
    label: 'Satisfaction Rate',
    description: 'Users love our platform',
    icon: '⭐',
    color: 'from-orange-500 to-red-500'
  }
];

export default function StatsSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3
  });

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Join a growing community of professionals who have transformed their productivity with NotepadX
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 rounded-2xl group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className="text-4xl mb-4 text-center">
                  {stat.icon}
                </div>
                
                {/* Number */}
                <div className="text-center mb-4">
                  <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {inView && (
                      <CountUp
                        end={stat.number}
                        duration={2.5}
                        separator=","
                        suffix={stat.suffix}
                      />
                    )}
                  </div>
                </div>
                
                {/* Label */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {stat.label}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {stat.description}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Ready to join thousands of satisfied users?
          </p>
          <motion.a
            href="/auth/sign-up"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Get Started Free
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}