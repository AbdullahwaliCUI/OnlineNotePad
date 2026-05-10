'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Note } from '@/types/database';

interface ShareModalProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ note, isOpen, onClose }: ShareModalProps) {
  const [copying, setCopying] = useState(false);

  if (!isOpen) return null;

  const noteUrl = `${window.location.origin}/notes/${note.id}`;
  const noteTitle = note.title || 'Untitled Note';
  const whatsappText = `Check out this note: ${noteTitle}\n${noteUrl}`;

  const handleCopyLink = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(noteUrl);
      toast.success('Link copied to clipboard!');
      onClose();
    } catch (err) {
      toast.error('Failed to copy link');
    } finally {
      setCopying(false);
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Share Note
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Share "{noteTitle}"
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-all">
            {noteUrl}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleWhatsAppShare}
            className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.785"/>
            </svg>
            Share on WhatsApp
          </button>

          <button
            onClick={handleCopyLink}
            disabled={copying}
            className="w-full flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg transition-colors text-sm sm:text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copying ? 'Copying...' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  );
}