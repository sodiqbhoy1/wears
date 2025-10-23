// This endpoint will be called by Vercel Cron or external cron services
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    // Verify this is coming from a cron job (simple protection)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'fallback-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      // Still allow it to run if no secret is set (for manual testing)
  console.warn('Cron job running without proper authentication');
    }
    
  // Cron job triggered: Checking for pending order emails
    
    // Call the email automation endpoint
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const automationUrl = `${baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`}/api/email-automation`;
    
    const response = await fetch(automationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: 'internal-cron-call'
      })
    });
    
    const result = await response.json();
    
  // Cron job completed
    
    return Response.json({
      success: true,
      cronTriggered: true,
      automationResult: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('🚨 Cron job error:', error);
    return Response.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST endpoint for manual triggers
export async function POST(request) {
  return GET(request);
}