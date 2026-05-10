'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import type { Note } from '@/types/database';
import { formatDateTime } from '@/lib/utils';

export default function PublicNoteViewer() {
    const params = useParams();
    const shareId = params.shareId as string;

    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (shareId) {
            loadPublicNote();
        }
    }, [shareId]);

    const loadPublicNote = async () => {
        setLoading(true);
        setError(null);

        try {
            // Use RLS - only returns notes where is_shared = true
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('share_id', shareId)
                .eq('is_shared', true)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No rows returned - note not found or not shared
                    setError('Note not found or not publicly shared');
                } else {
                    console.error('Error loading public note:', error);
                    setError('Failed to load note');
                }
                return;
            }

            if (data) {
                setNote(data);
                // Note: document.title updates are side effects, usually okay in useEffect/callback
                document.title = `${data.title} - NotepadX`;
            } else {
                setError('Note not found or not publicly shared');
            }
        } catch (error) {
            console.error('Error loading public note:', error);
            setError('Failed to load note');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading shared note...</p>
                </div>
            </div>
        );
    }

    if (error || !note) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Simple Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="container-custom">
                        <div className="flex justify-between items-center h-16">
                            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                                NotepadX
                            </Link>
                        </div>
                    </div>
                </header>

                {/* 404 Content */}
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                    <div className="text-center max-w-md mx-auto px-4">
                        <div className="mb-8">
                            <div className="text-6xl mb-4">📄</div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                Note Not Found
                            </h1>
                            <p className="text-gray-600 mb-6">
                                {error === 'Note not found or not publicly shared'
                                    ? 'This note may have been deleted, made private, or never existed.'
                                    : 'Something went wrong while loading this note.'
                                }
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Link href="/" className="btn-primary inline-block">
                                Go to NotepadX
                            </Link>
                            <div>
                                <Link href="/auth/sign-up" className="text-blue-600 hover:text-blue-700 text-sm">
                                    Create your own notes →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container-custom">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                            NotepadX
                        </Link>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">Shared Note</span>
                            <Link href="/auth/sign-up" className="btn-primary text-sm">
                                Create Account
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="container-custom py-8">
                {/* Note Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                        {note.title || 'Untitled Note'}
                    </h1>
                    <div className="flex items-center text-sm text-gray-500 space-x-6">
                        <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Shared {formatDateTime(note.updated_at)}
                        </div>
                        {note.word_count > 0 && (
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {note.word_count} words
                            </div>
                        )}
                        {note.reading_time > 0 && (
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {note.reading_time} min read
                            </div>
                        )}
                    </div>
                </div>

                {/* Note Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-8 lg:p-12">
                        {note.content_html ? (
                            <div
                                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-em:text-gray-700"
                                dangerouslySetInnerHTML={{ __html: note.content_html }}
                            />
                        ) : note.content ? (
                            <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700">
                                <p className="whitespace-pre-wrap">{note.content}</p>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-6xl mb-4">📝</div>
                                <p className="text-gray-500 italic">This note appears to be empty.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Call to Action */}
                <div className="mt-12 text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Create Your Own Notes
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Join NotepadX to create, organize, and share your own notes with rich formatting and powerful features.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link href="/auth/sign-up" className="btn-primary">
                            Get Started Free
                        </Link>
                        <Link href="/" className="btn-secondary">
                            Learn More
                        </Link>
                    </div>
                </div>

                {/* Share Actions */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 mb-4">Share this note</p>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: note.title,
                                        url: window.location.href,
                                    });
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Link copied to clipboard!');
                                }
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                            📱 Share
                        </button>
                        <button
                            onClick={() => {
                                const text = `${note.title} - ${window.location.href}`;
                                const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                                window.open(whatsappUrl, '_blank');
                            }}
                            className="text-green-600 hover:text-green-700 text-sm"
                        >
                            📱 WhatsApp
                        </button>
                        <button
                            onClick={() => {
                                const text = `Check out this note: ${note.title} ${window.location.href}`;
                                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                                window.open(twitterUrl, '_blank');
                            }}
                            className="text-blue-400 hover:text-blue-500 text-sm"
                        >
                            🐦 Twitter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
