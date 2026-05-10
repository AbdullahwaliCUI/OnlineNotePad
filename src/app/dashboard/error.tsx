'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            <div className="bg-red-50 p-4 rounded-md mb-4 max-w-2xl w-full overflow-auto border border-red-200">
                <p className="text-red-800 font-mono text-sm break-all">
                    {error.message}
                </p>
                <pre className="text-red-700 text-xs mt-2 overflow-auto max-h-96">
                    {error.stack}
                </pre>
            </div>
            <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
            >
                Try again
            </button>
        </div>
    );
}
