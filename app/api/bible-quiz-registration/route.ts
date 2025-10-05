import { NextRequest, NextResponse } from 'next/server';
import { supabaseBrowser } from '@/lib/supabase';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

interface Participant {
  name: string;
  gender: string;
  dob: string;
  mobileNo: string;
}

interface RegistrationRequest {
  groupLeaderName: string;
  church: string;
  location: string;
  langOfQuiz: string;
  zone: string;
  contactNo: string;
  alternateNo: string;
  mailId: string;
  participants: Participant[];
  verificationEmail: string;
}

// Generate PDF form
// Generate PDF form with improved formatting
async function generatePDFForm(
  registrationData: RegistrationRequest,
  groupNumber: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF with optimized page size and margins
      const doc = new PDFDocument({
        margin: 40,
        font: 'Helvetica',
        size: 'A4'
      });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Page dimensions for calculations
      const pageWidth = doc.page.width - 80; // Total width minus margins
      const leftMargin = 40;

      // Header Section
      doc.font('Helvetica-Bold')
        .fontSize(18)
        .fillColor('#dc2626')
        .text('BDYFC Bible Quiz 2025 - Registration Form', leftMargin, 50, {
          align: 'center',
          width: pageWidth
        });

      doc.font('Helvetica-Bold')
        .fontSize(14)
        .fillColor('#7f1d1d')
        .text(`Group Number: ${groupNumber}`, leftMargin, 75, {
          align: 'center',
          width: pageWidth
        });

      // Group Leader Details Section
      let currentY = 110;
      doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#dc2626')
        .text('Group Leader Details', leftMargin, currentY);

      currentY += 20;
      doc.font('Helvetica')
        .fontSize(9)
        .fillColor('#000000');

      // Two-column layout for group leader details
      const col1Width = pageWidth * 0.48;
      const col2Width = pageWidth * 0.48;
      const col2X = leftMargin + col1Width + 20;

      doc.text(`Group Leader Name: ${registrationData.groupLeaderName}`, leftMargin, currentY);
      doc.text(`Church: ${registrationData.church}`, leftMargin, currentY + 12);
      doc.text(`Location: ${registrationData.location}`, leftMargin, currentY + 24);
      doc.text(`Language of Quiz: ${registrationData.langOfQuiz}`, leftMargin, currentY + 36);

      doc.text(`Zone: ${registrationData.zone}`, col2X, currentY);
      doc.text(`Contact Number: ${registrationData.contactNo}`, col2X, currentY + 12);
      if (registrationData.alternateNo) {
        doc.text(`Alternate Number: ${registrationData.alternateNo}`, col2X, currentY + 24);
      }
      doc.text(`Email Address: ${registrationData.mailId}`, col2X, currentY + 36);

      // Participants Table Section
      currentY += 65;
      doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#dc2626')
        .text('Participants Details', leftMargin, currentY);

      currentY += 20;

      // Optimized table layout
      const tableStartX = leftMargin;
      const colWidths = [25, 140, 40, 70, 80]; // Increased name column width
      const rowHeight = 14;

      // Table headers
      doc.font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#dc2626');

      let xPos = tableStartX;
      doc.text('No.', xPos, currentY, { width: colWidths[0], align: 'center' });
      xPos += colWidths[0];
      doc.text('Name', xPos, currentY, { width: colWidths[1] });
      xPos += colWidths[1];
      doc.text('Gender', xPos, currentY, { width: colWidths[2], align: 'center' });
      xPos += colWidths[2];
      doc.text('Date of Birth', xPos, currentY, { width: colWidths[3], align: 'center' });
      xPos += colWidths[3];
      doc.text('Mobile Number', xPos, currentY, { width: colWidths[4], align: 'center' });

      // Header underline
      currentY += 12;
      doc.moveTo(tableStartX, currentY)
        .lineTo(tableStartX + colWidths.reduce((a, b) => a + b), currentY)
        .stroke('#dc2626');

      currentY += 5;

      // Participants data
      doc.font('Helvetica')
        .fontSize(8)
        .fillColor('#000000');

      registrationData.participants.forEach((participant, index) => {
        xPos = tableStartX;
        doc.text((index + 1).toString(), xPos, currentY, {
          width: colWidths[0],
          align: 'center'
        });
        xPos += colWidths[0];

        // Display full name without truncation
        doc.text(participant.name, xPos, currentY, { width: colWidths[1] });
        xPos += colWidths[1];

        doc.text(participant.gender, xPos, currentY, {
          width: colWidths[2],
          align: 'center'
        });
        xPos += colWidths[2];

        doc.text(participant.dob, xPos, currentY, {
          width: colWidths[3],
          align: 'center'
        });
        xPos += colWidths[3];

        doc.text(participant.mobileNo || 'N/A', xPos, currentY, {
          width: colWidths[4],
          align: 'center'
        });

        currentY += rowHeight;
      });

      // Add extra rows if less than 8 participants to maintain consistent spacing
      const remainingRows = Math.max(0, 8 - registrationData.participants.length);
      for (let i = 0; i < remainingRows; i++) {
        currentY += rowHeight;
      }

      currentY += 15;

      // Declarations Section - Side by side layout
      const declarationY = currentY;
      const declarationColWidth = (pageWidth - 20) / 2;

      // Group Leader Declaration (Left Column)
      doc.font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#dc2626')
        .text('Declaration of Group Leader', leftMargin, declarationY);

      doc.font('Helvetica')
        .fontSize(8)
        .fillColor('#000000')
        .text(`I, ${registrationData.groupLeaderName}, hereby declare that the above details are true as of my knowledge and belief. I hereby agree to follow the rules and regulations of BDYFC Bible Quiz 2025.`,
          leftMargin, declarationY + 15, {
          width: declarationColWidth,
          align: 'justify'
        });

      doc.fontSize(7)
        .text('Signature:', leftMargin, declarationY + 60)
        .text('_____________________', leftMargin, declarationY + 72)
        .text('Date:', leftMargin, declarationY + 88)
        .text('_____________________', leftMargin, declarationY + 100);

      // Priest Declaration (Right Column)
      const rightColX = leftMargin + declarationColWidth + 20;
      doc.font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#dc2626')
        .text('Declaration of Priest in Charge', rightColX, declarationY);

      doc.font('Helvetica')
        .fontSize(8)
        .fillColor('#000000')
        .text('I certify that the participants mentioned above are from the youth fellowship of my parish and the details provided above are genuine. I have verified their eligibility and approve their participation in BDYFC Bible Quiz 2025.',
          rightColX, declarationY + 15, {
          width: declarationColWidth,
          align: 'justify'
        });

      doc.fontSize(7)
        .text('Priest Name:', rightColX, declarationY + 60)
        .text('_____________________', rightColX, declarationY + 72)
        .text('Signature:', rightColX, declarationY + 88)
        .text('_____________________', rightColX, declarationY + 100)
        .text('Date:', rightColX, declarationY + 116)
        .text('_____________________', rightColX, declarationY + 128);

      // Church Seal
      currentY = declarationY + 150;
      doc.font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#dc2626')
        .text('Church Seal:', leftMargin, currentY);
      doc.font('Helvetica')
        .fontSize(8)
        .fillColor('#7f1d1d')
        .text('[PLEASE AFFIX OFFICIAL CHURCH STAMP HERE]', leftMargin + 70, currentY);

      // Draw a box for church seal - moved further right
      doc.rect(leftMargin + 300, currentY - 5, 80, 30)
        .stroke('#dc2626');

      // Important Instructions
      currentY += 45;
      doc.font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#dc2626')
        .text('Important Instructions', leftMargin, currentY);

      currentY += 15;
      const instructions = [
        'This form must be signed by the Group Leader and the Priest in Charge.',
        'Official church seal/stamp must be affixed on the designated area.',
        'Mail this completed and signed form to: cni.bdyfc@gmail.com',
        'Registration is only complete after we receive this signed form.',
        'All participants must carry valid ID proof on the quiz day.',
        'Late submissions will not be entertained.',
        'Minimum 2 participants required per team.'
      ];

      doc.font('Helvetica')
        .fontSize(7)
        .fillColor('#7f1d1d');

      // Two-column instructions layout
      const midPoint = Math.ceil(instructions.length / 2);
      const instructionColWidth = (pageWidth - 20) / 2;

      instructions.slice(0, midPoint).forEach((instruction, index) => {
        doc.text(`${index + 1}. ${instruction}`, leftMargin, currentY + (index * 10), {
          width: instructionColWidth
        });
      });

      instructions.slice(midPoint).forEach((instruction, index) => {
        doc.text(`${midPoint + index + 1}. ${instruction}`, leftMargin + instructionColWidth + 20, currentY + (index * 10), {
          width: instructionColWidth
        });
      });

      // Footer
      const footerY = doc.page.height - 60;
      doc.font('Helvetica')
        .fontSize(6)
        .fillColor('#999999')
        .text('© BDYFC Bible Quiz 2025 - For queries, contact the organizing committee',
          leftMargin, footerY, {
          align: 'center',
          width: pageWidth
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Send confirmation email with PDF
async function sendConfirmationEmail(
  email: string,
  groupLeaderName: string,
  church: string,
  participants: Participant[],
  groupNumber: string,
  pdfBuffer: Buffer
): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const participantsList = participants.map((p, index) =>
    `<tr>
      <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${p.name}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${p.gender}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${p.dob}</td>
      <td style="border: 1px solid #ddd; padding: 8px;">${p.mobileNo || 'N/A'}</td>
    </tr>`
  ).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>BDYFC Bible Quiz 2025 Registration Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
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
        .highlight {
          background-color: #fee2e2;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          border-left: 4px solid #dc2626;
        }
        .important {
          background-color: #fef3c7;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          border-left: 4px solid #f59e0b;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #fee2e2;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
          font-size: 12px;
        }
        .group-number {
          background-color: #dc2626;
          color: white;
          padding: 10px;
          border-radius: 5px;
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>BDYFC Bible Quiz 2025</h1>
        <p>Registration Confirmation</p>
      </div>

      <div class="content">
        <h2>Dear ${groupLeaderName},</h2>
        <p>Thank you for registering for the <strong>BDYFC Bible Quiz 2025</strong>! Your registration has been <strong>successfully confirmed</strong>.</p>

        <div class="group-number">
          Your Group Number: ${groupNumber}
        </div>

        <div class="highlight">
          <h3>Registration Details:</h3>
          <p><strong>Group Leader:</strong> ${groupLeaderName}</p>
          <p><strong>Church:</strong> ${church}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Number of Participants:</strong> ${participants.length}</p>
        </div>

        <h3>Registered Participants:</h3>
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Name</th>
              <th>Gender</th>
              <th>Date of Birth</th>
              <th>Mobile No</th>
            </tr>
          </thead>
          <tbody>
            ${participantsList}
          </tbody>
        </table>

        <div class="important">
          <h3>CRITICAL NEXT STEPS - Registration Not Complete Yet!</h3>
          <ol>
            <li><strong>Download and Print</strong> the attached PDF registration form</li>
            <li><strong>Get Priest's Signature</strong> and official church stamp on the printed form</li>
            <li><strong>Mail the signed form</strong> to: <strong>cni.bdyfc@gmail.com</strong></li>
            <li><strong>Your registration will ONLY be complete</strong> after we receive the signed form</li>
          </ol>
          <p style="color: #dc2626; font-weight: bold;">
            Important: Teams without submitted signed forms will not be allowed to participate!
          </p>
        </div>

        <h3>Contact Information:</h3>
        <p>For any queries, please contact the organizing committee. Keep this email and your group number safe for future reference.</p>

        <p>We look forward to your participation and wish you all the best for the BDYFC Bible Quiz 2025!</p>

        <p>May God bless you and your team.</p>

        <p>Best regards,<br/>
        <strong>BDYFC</strong></p>
      </div>

      <div class="footer">
        <p>© BDYFC</p>
        <p>This is an automated email. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    BDYFC Bible Quiz 2025 - Registration Confirmation

    Dear ${groupLeaderName},

    Thank you for registering for the BDYFC Bible Quiz 2025! Your registration has been successfully confirmed.

    YOUR GROUP NUMBER: ${groupNumber}

    Registration Details:
    - Group Leader: ${groupLeaderName}
    - Church: ${church}
    - Email: ${email}
    - Registration Date: ${new Date().toLocaleDateString()}
    - Number of Participants: ${participants.length}

    CRITICAL NEXT STEPS - Registration Not Complete Yet!
    1. Download and print the attached PDF registration form
    2. Get priest's signature and official church stamp on the printed form
    3. Mail the signed form to: cni.bdyfc@gmail.com
    4. Your registration will ONLY be complete after we receive the signed form

    Registered Participants:
    ${participants.map((p, index) => `${index + 1}. ${p.name} (${p.gender}) - DOB: ${p.dob}`).join('\n')}

    Important: Teams without submitted signed forms will not be allowed to participate!

    Quiz Rules:
    - Based on Holy Bible (Old and New Testament)
    - Valid ID proof required on quiz day
    - No electronic devices allowed
    - Minimum 2 participants required per team
    - Team composition cannot be changed after registration

    Best regards,
    BDYFC

    © BDYFC
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'BDYFC Bible Quiz 2025 - Registration Confirmed (Action Required)',
    text: textContent,
    html: htmlContent,
    attachments: [
      {
        filename: `BibleQuiz2025_Registration_Group${groupNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  });
}

// Get next group number
async function getNextGroupNumber(): Promise<string> {
  const { data, error } = await supabaseBrowser
    .from('bible_quiz_registrations_2025')
    .select('group_number')
    .order('group_number', { ascending: false })
    .limit(100);  // Get more rows to sort properly

  if (error) {
    console.error('Error getting last group number:', error);
    return '1';
  }

  if (!data || data.length === 0) {
    return '1';
  }

  // Sort numerically in JavaScript since SQL sorts as strings
  const numbers = data
    .map(row => parseInt(row.group_number))
    .filter(num => !isNaN(num))
    .sort((a, b) => b - a);  // Descending numeric sort

  const lastNumber = numbers[0] || 0;
  const nextNumber = lastNumber + 1;

  return nextNumber.toString();
}

export async function POST(request: NextRequest) {
  try {
    const registrationData: RegistrationRequest = await request.json();

    console.log('Starting BDYFC Bible Quiz registration process...');

    // Validate required fields
    const requiredFields = ['groupLeaderName', 'church', 'location', 'langOfQuiz', 'zone', 'contactNo', 'mailId', 'verificationEmail'];
    for (const field of requiredFields) {
      if (!registrationData[field as keyof RegistrationRequest]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registrationData.mailId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate participants - minimum 2 required
    if (!registrationData.participants || registrationData.participants.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Minimum 2 participants are required' },
        { status: 400 }
      );
    }

    // Step 1: Check for duplicate registration - email
    console.log('Checking for duplicate email...');
    const { data: existingEmailReg, error: emailCheckError } = await supabaseBrowser
      .from('bible_quiz_registrations_2025')
      .select('id, mail_id')
      .eq('mail_id', registrationData.mailId)
      .maybeSingle();

    if (emailCheckError && emailCheckError.code !== 'PGRST116') {
      console.error('Email duplicate check error:', emailCheckError);
      return NextResponse.json(
        { success: false, message: 'Error checking for duplicate email' },
        { status: 500 }
      );
    }

    if (existingEmailReg) {
      return NextResponse.json(
        { success: false, message: 'Registration already exists for this email address' },
        { status: 400 }
      );
    }

    // Check for duplicate church
    console.log('Checking for duplicate church...');
    const { data: existingChurchReg, error: churchCheckError } = await supabaseBrowser
      .from('bible_quiz_registrations_2025')
      .select('id, church')
      .eq('church', registrationData.church)
      .maybeSingle();

    if (churchCheckError && churchCheckError.code !== 'PGRST116') {
      console.error('Church duplicate check error:', churchCheckError);
      return NextResponse.json(
        { success: false, message: 'Error checking for duplicate church' },
        { status: 500 }
      );
    }

    if (existingChurchReg) {
      return NextResponse.json(
        { success: false, message: 'Registration already exists for this church' },
        { status: 400 }
      );
    }

    // Step 2: Get next group number
    console.log('Getting next group number...');
    const groupNumber = await getNextGroupNumber();

    // Step 3: Create main registration record
    console.log('Creating registration record...');
    const { data: newRegistration, error: registrationError } = await supabaseBrowser
      .from('bible_quiz_registrations_2025')
      .insert([{
        group_leader_name: registrationData.groupLeaderName,
        church: registrationData.church,
        location: registrationData.location,
        lang_of_quiz: registrationData.langOfQuiz,
        zone: registrationData.zone,
        contact_no: registrationData.contactNo,
        alternate_no: registrationData.alternateNo || null,
        mail_id: registrationData.mailId,
        total_participants: registrationData.participants.length,
        group_number: groupNumber
      }])
      .select()
      .single();

    if (registrationError) {
      console.error('Registration creation error:', registrationError);
      return NextResponse.json(
        { success: false, message: `Registration failed: ${registrationError.message}` },
        { status: 500 }
      );
    }

    console.log('Registration created successfully:', newRegistration);

    // Step 4: Create participant records
    console.log('Creating participant records...');
    const participantRecords = registrationData.participants.map(participant => ({
      registration_id: newRegistration.id,
      name: participant.name,
      gender: participant.gender,
      dob: participant.dob,
      mobile_no: participant.mobileNo || null
    }));

    const { error: participantsError } = await supabaseBrowser
      .from('bible_quiz_participants_2025')
      .insert(participantRecords);

    if (participantsError) {
      console.error('Participants creation error:', participantsError);
      // Try to cleanup the main registration record
      await supabaseBrowser
        .from('bible_quiz_registrations_2025')
        .delete()
        .eq('id', newRegistration.id);

      return NextResponse.json(
        { success: false, message: `Failed to register participants: ${participantsError.message}` },
        { status: 500 }
      );
    }

    console.log('Participants created successfully');

    // Step 5: Generate PDF form
    console.log('Generating PDF form...');
    const pdfBuffer = await generatePDFForm(registrationData, groupNumber);

    // Step 6: Send confirmation email with PDF
    try {
      console.log('Sending confirmation email with PDF...');
      await sendConfirmationEmail(
        registrationData.mailId,
        registrationData.groupLeaderName,
        registrationData.church,
        registrationData.participants,
        groupNumber,
        pdfBuffer
      );
      console.log('Confirmation email sent successfully');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the registration if email fails, but log it
      console.warn('Registration successful but email sending failed');
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: 'Registration completed successfully! PDF form has been sent to your email.',
      registrationId: newRegistration.id,
      groupNumber: groupNumber,
      pdfDownload: `data:application/pdf;base64,${pdfBuffer.toString('base64')}`
    });

  } catch (error: any) {
    console.error('Unexpected registration error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}