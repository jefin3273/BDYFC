import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email
async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Bible Quiz 2025 - Email Verification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #dc2626;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 8px 8px;
          border: 1px solid #ddd;
        }
        .otp-box {
          background-color: #dc2626;
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 3px;
          margin: 20px 0;
        }
        .warning {
          background-color: #fef3c7;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
          border-left: 4px solid #f59e0b;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📖 BDYFC Bible Quiz 2025</h1>
        <p>Email Verification</p>
      </div>

      <div class="content">
        <h2>Email Verification Required</h2>
        <p>Please use the following One-Time Password (OTP) to verify your email address for BDYFC Bible Quiz 2025 registration:</p>

        <div class="otp-box">
          ${otp}
        </div>

        <div class="warning">
          <p><strong>Important:</strong></p>
          <ul>
            <li>This OTP is valid for your current registration session only</li>
            <li>Do not share this OTP with anyone</li>
            <li>If you didn't request this verification, please ignore this email</li>
            <li>Complete your registration process after verifying this OTP</li>
          </ul>
        </div>

        <p>If you're having trouble with the registration process, please contact your zonal head.</p>

        <p>Thank you for registering for BDYFC Bible Quiz 2025!</p>

        <p>Best regards,<br/>
        <strong>BDYFC</strong></p>
      </div>

      <div class="footer">
        <p>©BDYFC</p>
        <p>This is an automated email. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Bible Quiz 2025 - Email Verification

    Please use the following One-Time Password (OTP) to verify your email address:

    OTP: ${otp}

    Important:
    - This OTP is valid for your current registration session only
    - Do not share this OTP with anyone
    - If you didn't request this verification, please ignore this email
    - Complete your registration process after verifying this OTP

    Thank you for registering for Bible Quiz 2025!

    Best regards,
    Bible Quiz 2025 Organizing Committee

    © 2025 Bible Quiz - Registration System
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: '🔐 Bible Quiz 2025 - Email Verification OTP',
    text: textContent,
    html: htmlContent,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();

    try {
      // Send OTP email
      await sendOTPEmail(email, otp);
      
      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
        otp: otp // In production, you should store this in a secure session/cache instead of returning it
      });
    } catch (emailError) {
      console.error('OTP email sending failed:', emailError);
      return NextResponse.json(
        { success: false, message: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('OTP generation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}