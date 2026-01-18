'use client';

import { useState, useEffect } from 'react';

export default function EmailAutomationPage() {
  const [status, setStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/email-automation');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to check status:', error);
    }
  };

  const runAutomation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/email-automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: 'manual-trigger'
        }),
      });

      const data = await response.json();
      setResults(data);
      
      // Refresh status after automation
      setTimeout(checkStatus, 1000);
    } catch (error) {
      setResults({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(checkStatus, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔄 Email Automation Dashboard
          </h1>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Status Panel */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">📊 Current Status</h2>
              {status ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Pending Emails:</span>
                    <span className={`font-bold ${status.pendingEmails > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                      {status.pendingEmails}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Check:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(status.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-700">{status.message}</p>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse">Loading...</div>
              )}
            </div>

            {/* Control Panel */}
            <div className="bg-green-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">🎮 Controls</h2>
              <div className="space-y-3">
                <button
                  onClick={checkStatus}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  🔍 Check Status
                </button>
                
                <button
                  onClick={runAutomation}
                  disabled={loading}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? '⏳ Processing...' : '▶️ Run Email Automation'}
                </button>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Auto-refresh status (30s)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Automation Results */}
          {results && (
            <div className="mb-6">
              <div className={`p-4 rounded-lg ${results.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className="font-semibold mb-2">
                  {results.success ? '✅ Automation Complete' : '❌ Automation Failed'}
                </h3>
                
                {results.summary && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">📈 Summary:</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-lg text-blue-600">{results.summary.total}</div>
                        <div>Total Processed</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-green-600">{results.summary.success}</div>
                        <div>Successful</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-red-600">{results.summary.failures}</div>
                        <div>Failed</div>
                      </div>
                    </div>
                  </div>
                )}

                {results.results && results.results.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">📋 Detailed Results:</h4>
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Order Reference</th>
                            <th className="text-left p-2">Email</th>
                            <th className="text-left p-2">Status</th>
                            <th className="text-left p-2">Error</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.results.map((result, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2 font-mono">{result.reference}</td>
                              <td className="p-2">{result.email}</td>
                              <td className="p-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {result.status}
                                </span>
                              </td>
                              <td className="p-2 text-xs text-gray-600">
                                {result.error || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {results.error && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-red-600">Error Details:</h4>
                    <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                      {results.error}
                    </pre>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Completed: {new Date(results.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* Information Panel */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">ℹ️ How It Works</h3>
            <ul className="text-sm space-y-2">
              <li>🔄 <strong>Automatic:</strong> Vercel Cron runs every 10 minutes to check for pending emails</li>
              <li>📧 <strong>Smart Retry:</strong> Only attempts 3 times per order to avoid spam</li>
              <li>⏰ <strong>24-Hour Window:</strong> Only processes orders from the last 24 hours</li>
              <li>🎯 <strong>Reliable:</strong> Handles both webhook and direct order creation failures</li>
              <li>🔍 <strong>Manual Override:</strong> You can manually trigger the automation anytime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}