'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { noteService } from '@/lib/database';

export default function TestDbPage() {
  const { user, loading: authLoading } = useAuth();
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testDatabase = async () => {
    if (!user) {
      setTestResult({ error: 'No user found' });
      return;
    }

    setLoading(true);
    try {
      console.log('Testing database with user:', user.id);
      
      // Test direct database call
      const result = await noteService.getNotes(user.id, {}, { field: 'updated_at', direction: 'desc' });
      console.log('Database test result:', result);
      
      setTestResult({
        success: true,
        user: user.id,
        notesCount: result.data.length,
        notes: result.data,
        rawResult: result
      });
    } catch (error: any) {
      console.error('Database test error:', error);
      setTestResult({
        error: error?.message || 'Unknown error',
        details: error
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      testDatabase();
    }
  }, [user, authLoading]);

  if (authLoading) {
    return <div className="p-8">Loading auth...</div>;
  }

  if (!user) {
    return <div className="p-8">Please sign in to test database</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Test</h1>
      
      <div className="mb-4">
        <button 
          onClick={testDatabase}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Database'}
        </button>
      </div>

      {testResult && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Test Result:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}