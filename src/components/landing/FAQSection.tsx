'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'Is NotepadX completely free to use?',
    answer: 'Yes! NotepadX is completely free for individual users. You can create unlimited notes, use voice typing, and organize your thoughts without any hidden charges.'
  },
  {
    question: 'Which languages are supported for voice typing?',
    answer: 'We support over 50+ languages! This includes English, Urdu, Roman Urdu, Hindi, Spanish, French, and many more. Our AI-powered voice recognition adapts to your accent for high accuracy.'
  },
  {
    question: 'Can I share my notes with other people?',
    answer: 'Absolutely. You can generate a secure, unique link for any note and share it via WhatsApp, email, or direct link. You control who sees your notes.'
  },
  {
    question: 'Is my data private and secure?',
    answer: 'Security is our top priority. Your notes are stored securely using enterprise-grade database encryption (Supabase). Thanks to Row Level Security (RLS), nobody else can access your private notes.'
  },
  {
    question: 'Do I need an active internet connection to write notes?',
    answer: 'While voice typing and real-time syncing require an internet connection, you can still type and edit your notes normally. They will automatically sync to the cloud once your connection is restored.'
  }
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="container-custom max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about the product and how it works.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border border-gray-200 rounded-2xl bg-white overflow-hidden transition-all duration-300 ${
                activeIndex === index ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
              }`}
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full text-left px-6 py-5 focus:outline-none flex justify-between items-center"
              >
                <span className={`font-semibold text-lg ${activeIndex === index ? 'text-blue-600' : 'text-gray-900'}`}>
                  {faq.question}
                </span>
                <span className={`ml-6 flex-shrink-0 transition-transform duration-300 ${activeIndex === index ? 'rotate-180' : ''}`}>
                  <svg 
                    className={`w-6 h-6 ${activeIndex === index ? 'text-blue-600' : 'text-gray-400'}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
