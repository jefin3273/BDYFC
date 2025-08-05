import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface EmailRequest {
  email: string;
  churchName: string;
  topicName: string;
  leaderName: string;
}

// Notify n8n via webhook and return success/failure
async function notifyN8n(
  churchName: string,
  topicName: string,
  leaderName: string,
  email: string
): Promise<boolean> {
  const webhookUrl = process.env.N8N_EVENT_REGISTRATION_WEBHOOK_URL!;
  const payload = { churchName, topicName, leaderName, email };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (e) {
    console.error('n8n notification failed:', e);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, churchName, topicName, leaderName }: EmailRequest = await request.json();

    // First try n8n
    const n8nSuccess = await notifyN8n(churchName, topicName, leaderName, email);

    // If n8n fails, fallback to Nodemailer
    if (!n8nSuccess) {
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

            <h3>Event Rules</h3>
            <ul>
              <li>Each group must consist of a minimum of 4 members and a maximum of 8 members.</li>
              <li><strong>Team Coordination:</strong> Group leaders are responsible for coordinating with their church youth and selecting a topic for their team.</li>
              <li><strong>Event Day Preparation:</strong> Teams must build their models on the day of the event, based on the assigned topic.</li>
              <li><strong>Post-Event Responsibility:</strong> Participants must take home their respective models and all materials after the event; no storage or disposal will be provided by organizers.</li>
              <li><strong>Time Limit:</strong> Teams will have a maximum of 2 hours to complete their model.</li>
            </ul>

            <h3>Important Notes:</h3>
            <ul>
              <li>Please save this email for your records</li>
              <li>Your registration is now locked and cannot be changed</li>
              <li>Further event details will be communicated via email</li>
              <li>Contact us if you have any questions</li>
            </ul>

            <p>We're excited to see your creative masterpiece at the Talent Fiesta '25!</p>

            <p>Best regards,<br/>
            <strong>DYFC Bombay, CNI</strong></p>
          </div>

          <div class="footer">
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

        Event Rules:
        - Each group must consist of 4–8 members.
        - Group leaders coordinate with youth and choose a topic.
        - Models are to be built on event day.
        - Teams must take their models back post-event.
        - 2 hours time limit.

        Important Notes:
        - Save this email for your records.
        - Registration is locked.
        - Further details will be emailed.

        We're excited to see your creativity!

        Best regards,
        DYFC Bombay, CNI

        © 2025 Talent Fiesta - Model Making Event
      `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: '🏆 Talent Fiesta Registration Confirmed - Model Making Event',
        text: textContent,
        html: htmlContent,
      });
    }

    return NextResponse.json({
      success: true,
      message: n8nSuccess
        ? 'Registration successful. Email and Telegram sent via n8n.'
        : 'Registration successful. Fallback email sent via Nodemailer.',
    });
  } catch (error) {
    console.error('Error in registration:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Registration failed. Please try again later.',
      },
      { status: 500 }
    );
  }
}
