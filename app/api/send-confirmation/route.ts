// app/api/send-confirmation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface EmailRequest {
  email: string;
  churchName: string;
  topicName: string;
  leaderName: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, churchName, topicName, leaderName }: EmailRequest = await request.json();

    // Create transporter (configure with your SMTP settings)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Talent Fiesta Registration Confirmation</title>
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
            background-color: #b91c1c; 
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
          .highlight { 
            background-color: #fee2e2; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 20px 0; 
            border-left: 4px solid #b91c1c; 
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #ddd; 
            color: #666; 
            font-size: 12px; 
          }
          .trophy { 
            font-size: 24px; 
            color: #b91c1c; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏆 Talent Fiesta - Model Making Event</h1>
          <p>Registration Confirmation</p>
        </div>
        
        <div class="content">
          <h2>Dear ${leaderName},</h2>
          
          <p>Congratulations! Your registration for the Talent Fiesta Model Making Event has been <strong>successfully confirmed</strong>.</p>
          
          <div class="highlight">
            <h3>Registration Details:</h3>
            <p><strong>Church:</strong> ${churchName}</p>
            <p><strong>Topic:</strong> ${topicName}</p>
            <p><strong>Leader:</strong> ${leaderName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <h3>What's Next?</h3>
          <ul>
            <li>Start preparing your model based on the selected topic</li>
            <li>Gather all necessary materials and tools</li>
            <li>Form your team and assign roles</li>
            <li>Review the event guidelines and rules</li>
          </ul>
          
          <h3>Important Notes:</h3>
          <ul>
            <li>Please save this email for your records</li>
            <li>Your registration is now locked and cannot be changed</li>
            <li>Further event details will be communicated via email</li>
            <li>Contact us if you have any questions</li>
          </ul>
          
          <p>We're excited to see your creative masterpiece at the Talent Fiesta!</p>
          
          <p>Best regards,<br>
          <strong>Talent Fiesta Organizing Committee</strong></p>
        </div>
        
        <div class="footer">
          <p>This is an automated confirmation email. Please do not reply to this message.</p>
          <p>© 2025 Talent Fiesta - Model Making Event</p>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      Talent Fiesta - Model Making Event
      Registration Confirmation
      
      Dear ${leaderName},
      
      Congratulations! Your registration for the Talent Fiesta Model Making Event has been successfully confirmed.
      
      Registration Details:
      - Church: ${churchName}
      - Topic: ${topicName}
      - Leader: ${leaderName}
      - Email: ${email}
      - Registration Date: ${new Date().toLocaleDateString()}
      
      What's Next?
      - Start preparing your model based on the selected topic
      - Gather all necessary materials and tools
      - Form your team and assign roles
      - Review the event guidelines and rules
      
      Important Notes:
      - Please save this email for your records
      - Your registration is now locked and cannot be changed
      - Further event details will be communicated via email
      - Contact us if you have any questions
      
      We're excited to see your creative masterpiece at the Talent Fiesta!
      
      Best regards,
      Talent Fiesta Organizing Committee
      
      This is an automated confirmation email. Please do not reply to this message.
      © 2025 Talent Fiesta - Model Making Event
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: '🏆 Talent Fiesta Registration Confirmed - Model Making Event',
      text: textContent,
      html: htmlContent,
    });

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent successfully'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send confirmation email'
      },
      { status: 500 }
    );
  }
}