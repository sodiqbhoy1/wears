// Force Node.js runtime for Vercel
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { token, testType = 'full' } = await request.json();
    
    // Simple token protection
    if (token !== 'test-email-2024') {
      return Response.json({ 
        success: false, 
        error: 'Invalid token' 
      }, { status: 401 });
    }

  // Starting email diagnostics
    
    // Environment check
    const envCheck = {
      emailUser: !!process.env.EMAIL_USER,
      emailPass: !!process.env.EMAIL_PASS,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'NOT_SET',
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || 'NOT_VERCEL'
    };
    
  // Environment check

    if (testType === 'env-only') {
      return Response.json({
        success: true,
        environment: envCheck,
        message: 'Environment variables checked'
      });
    }

    // Import test
    let nodemailer;
    try {
      const nodemailerModule = await import('nodemailer');
      nodemailer = nodemailerModule.default || nodemailerModule;
  // Nodemailer imported successfully
    } catch (importErr) {
      console.error('❌ Nodemailer import failed:', importErr);
      return Response.json({
        success: false,
        error: 'Nodemailer import failed',
        details: importErr.message,
        environment: envCheck
      }, { status: 500 });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return Response.json({
        success: false,
        error: 'Email credentials not configured',
        environment: envCheck
      }, { status: 500 });
    }

    // Create transporter with same config as production
    const transporter = nodemailer.createTransporter({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verification test
    let verificationResult = 'SKIPPED';
    if (testType === 'full') {
      try {
  // Testing transporter verification
        const verifyPromise = transporter.verify();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Verification timeout')), 10000)
        );
        
        await Promise.race([verifyPromise, timeoutPromise]);
        verificationResult = 'SUCCESS';
  // Transporter verified
      } catch (verifyError) {
        verificationResult = `FAILED: ${verifyError.message}`;
  console.error('Verification failed:', verifyError.message);
      }
    }

    // Send test email
    let emailResult = 'SKIPPED';
    if (testType === 'full') {
      try {
  // Sending test email
        const testEmail = {
          from: `"FoodJoint Test" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_USER, // Send to self
          subject: '🧪 Vercel Email Test - ' + new Date().toISOString(),
          text: `Test email sent from Vercel at ${new Date().toISOString()}\n\nEnvironment: ${process.env.VERCEL_ENV || 'local'}\nNode Version: ${process.version}`,
          html: `
            <h2>🧪 Vercel Email Test</h2>
            <p><strong>Sent:</strong> ${new Date().toISOString()}</p>
            <p><strong>Environment:</strong> ${process.env.VERCEL_ENV || 'local'}</p>
            <p><strong>Node Version:</strong> ${process.version}</p>
            <p><strong>Runtime:</strong> nodejs</p>
            <p>✅ Email service is working on Vercel!</p>
          `
        };

        const result = await transporter.sendMail(testEmail);
        emailResult = `SUCCESS: ${result.messageId}`;
  // Test email sent
      } catch (emailError) {
        emailResult = `FAILED: ${emailError.message}`;
  console.error('Test email failed:', emailError);
      }
    }

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      runtime: 'nodejs',
      nodeVersion: process.version,
      tests: {
        nodemailerImport: 'SUCCESS',
        verification: verificationResult,
        emailSend: emailResult
      },
      message: 'Email diagnostics completed'
    });

  } catch (error) {
    console.error('🚨 Diagnostics error:', error);
    return Response.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}