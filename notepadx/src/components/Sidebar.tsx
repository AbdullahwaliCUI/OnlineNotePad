'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    FileText,
    PlusCircle,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    Moon,
    Sun,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
    className?: string;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    isMobile: boolean;
}

export default function Sidebar({ className, isOpen, setIsOpen, isMobile }: SidebarProps) {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const { signOut, user } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const links = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/notes/new', label: 'New Note', icon: PlusCircle },
        // { href: '/settings', label: 'Settings', icon: Settings }, // Future
    ];

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    // On mobile, close sidebar when clicking a link
    const handleLinkClick = () => {
        if (isMobile) setIsOpen(false);
    };

    return (
        <>
            <AnimatePresence>
                {(isOpen || !isMobile) && (
                    <motion.div
                        initial={isMobile ? { x: -300 } : { width: isOpen ? 240 : 80 }}
                        animate={isMobile ? { x: 0 } : { width: isOpen ? 240 : 80 }}
                        exit={isMobile ? { x: -300 } : undefined}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className={cn(
                            "fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border shadow-xl h-full",
                            isMobile ? "w-[280px]" : "",
                            className
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
                            <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden" onClick={handleLinkClick}>
                                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl flex-shrink-0">
                                    N
                                </div>
                                {(isOpen || isMobile) && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="font-bold text-xl whitespace-nowrap"
                                    >
                                        NotepadX
                                    </motion.span>
                                )}
                            </Link>
                            {!isMobile && (
                                <button
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors"
                                >
                                    {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                                </button>
                            )}
                            {isMobile && (
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                            )}
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                            {links.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={handleLinkClick}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                                            isActive
                                                ? "bg-primary/10 text-primary font-medium"
                                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                        )}
                                    >
                                        <link.icon
                                            size={20}
                                            className={cn(
                                                "flex-shrink-0 transition-colors",
                                                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                            )}
                                        />
                                        {(isOpen || isMobile) && (
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="whitespace-nowrap"
                                            >
                                                {link.label}
                                            </motion.span>
                                        )}
                                        {!isOpen && !isMobile && (
                                            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                                {link.label}
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User & Settings */}
                        <div className="border-t border-border p-3 space-y-2">
                            <button
                                onClick={toggleTheme}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
                                    !isOpen && !isMobile && "justify-center"
                                )}
                            >
                                {mounted && theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                                {(isOpen || isMobile) && <span>Toggle Theme</span>}
                            </button>

                            <button
                                onClick={handleSignOut}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors",
                                    !isOpen && !isMobile && "justify-center"
                                )}
                            >
                                <LogOut size={20} />
                                {(isOpen || isMobile) && <span>Sign Out</span>}
                            </button>
                        </div>

                        {(isOpen || isMobile) && user && (
                            <div className="px-4 py-3 border-t border-border mt-auto">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-background">
                                        {user.email?.[0].toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{user.email}</p>
                                        <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay for mobile */}
            {isMobile && isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                />
            )}
        </>
    );
}
