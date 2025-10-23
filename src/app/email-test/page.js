'use client';

import { useState } from 'react';

export default function EmailTestPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async (testType = 'full') => {
    setLoading(true);
    try {
      const response = await fetch('/api/email-diagnostics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: 'test-email-2024',
          testType
        }),
      });

      const data = await response.json();
      setResults(data);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            📧 Email Service Diagnostics
          </h1>
          
          <div className="space-y-4 mb-6">
            <button
              onClick={() => runDiagnostics('env-only')}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mr-4"
            >
              Check Environment Only
            </button>
            
            <button
              onClick={() => runDiagnostics('full')}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              Full Email Test
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Running diagnostics...</span>
            </div>
          )}

          {results && (
            <div className="mt-6">
              <div className={`p-4 rounded-lg ${results.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className="font-semibold mb-2">
                  {results.success ? '✅ Diagnostics Complete' : '❌ Diagnostics Failed'}
                </h3>
                
                {results.environment && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Environment Variables:</h4>
                    <ul className="text-sm space-y-1">
                      <li>Email User: {results.environment.emailUser ? '✅ Set' : '❌ Missing'}</li>
                      <li>Email Pass: {results.environment.emailPass ? '✅ Set' : '❌ Missing'}</li>
                      <li>Base URL: {results.environment.baseUrl}</li>
                      <li>Node Env: {results.environment.nodeEnv}</li>
                      <li>Vercel Env: {results.environment.vercelEnv}</li>
                    </ul>
                  </div>
                )}

                {results.tests && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Test Results:</h4>
                    <ul className="text-sm space-y-1">
                      <li>Nodemailer Import: {results.tests.nodemailerImport}</li>
                      <li>SMTP Verification: {results.tests.verification}</li>
                      <li>Email Send: {results.tests.emailSend}</li>
                    </ul>
                  </div>
                )}

                {results.nodeVersion && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Runtime Info:</h4>
                    <ul className="text-sm space-y-1">
                      <li>Node Version: {results.nodeVersion}</li>
                      <li>Runtime: {results.runtime}</li>
                      <li>Timestamp: {results.timestamp}</li>
                    </ul>
                  </div>
                )}

                {results.error && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-red-600">Error Details:</h4>
                    <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                      {typeof results.error === 'string' ? results.error : JSON.stringify(results.error, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Full Response:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-96">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">🔍 Troubleshooting Guide</h3>
            <ul className="text-sm space-y-2">
              <li><strong>Environment Check:</strong> Verify EMAIL_USER and EMAIL_PASS are set in Vercel dashboard</li>
              <li><strong>Gmail Setup:</strong> Ensure you&apos;re using an App Password (not regular password)</li>
              <li><strong>Verification Failed:</strong> This is often normal on Vercel - emails may still work</li>
              <li><strong>Email Send Failed:</strong> Check Gmail settings and verify credentials</li>
              <li><strong>Timeout Errors:</strong> Vercel has strict timeouts - this is expected behavior</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}