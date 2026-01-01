'use client';

import React from 'react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    name?: string;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error(`ErrorBoundary [${this.props.name}] caught error:`, error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 m-2 bg-red-50 border border-red-200 rounded text-sm text-red-800 text-left">
                    <strong className="font-bold block mb-1">Error in {this.props.name || 'Component'}:</strong>
                    <div className="font-mono bg-red-100 p-2 rounded overflow-auto text-xs whitespace-pre-wrap">
                        {this.state.error?.message}
                    </div>
                    <details className="mt-2">
                        <summary className="cursor-pointer font-semibold hover:underline">Stack Trace</summary>
                        <pre className="mt-1 text-[10px] overflow-auto max-h-40">
                            {this.state.error?.stack}
                        </pre>
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
