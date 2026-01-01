'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Menu } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AIAssistant from '@/components/AIAssistant';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <ProtectedRoute>
            <div className="flex h-screen bg-background overflow-hidden relative">
                <ErrorBoundary name="Sidebar">
                    <Sidebar
                        isOpen={sidebarOpen}
                        setIsOpen={setSidebarOpen}
                        isMobile={isMobile}
                    />
                </ErrorBoundary>

                <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${!isMobile && sidebarOpen ? 'ml-[240px]' : !isMobile ? 'ml-[80px]' : ''
                    }`}>
                    {/* Mobile Header */}
                    {isMobile && (
                        <div className="h-16 px-4 border-b border-border flex items-center bg-card flex-shrink-0">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 -ml-2 rounded-md hover:bg-accent text-foreground"
                            >
                                <Menu size={24} />
                            </button>
                            <h1 className="ml-3 text-lg font-semibold">NotepadX</h1>
                        </div>
                    )}

                    <ErrorBoundary name="Dashboard Content">
                        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 scroll-smooth">
                            {children}
                        </div>
                    </ErrorBoundary>

                    <ErrorBoundary name="AI Assistant">
                        <AIAssistant />
                    </ErrorBoundary>
                </main>
            </div>
        </ProtectedRoute>
    );
}
