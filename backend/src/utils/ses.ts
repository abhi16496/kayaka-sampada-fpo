import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Retrieve values from process.env
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION || 'us-east-1';
const senderEmail = process.env.AWS_SES_SENDER || 'no-reply@kayakasampadafpo.org';

let sesClient: SESClient | null = null;

if (accessKeyId && secretAccessKey) {
  sesClient = new SESClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
} else {
  console.warn('⚠️ AWS SES credentials are not configured in environment variables. Email notifications will be mocked.');
}

export async function sendApprovalEmail(recipientEmail: string, fullName: string, regId: string): Promise<void> {
  if (!sesClient) {
    console.log(`[EMAIL MOCK] Would send approval email to ${recipientEmail} with RegID: ${regId} (AWS credentials missing)`);
    return;
  }

  // Constructing a beautiful bilingual HTML email
  const subject = `Kayaka Sampada FPO — Membership Verified | ಸದಸ್ಯತ್ವ ಅನುಮೋದಿಸಲಾಗಿದೆ (ID: ${regId})`;
  
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
      background-color: #f7f9fa;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      border: 1px solid #e1e8ed;
    }
    .header {
      background: linear-gradient(135deg, #1b4d3e, #2c7a5f);
      padding: 30px 20px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .header p {
      margin: 5px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px 40px;
    }
    .welcome {
      font-size: 18px;
      font-weight: 600;
      color: #1b4d3e;
      margin-bottom: 20px;
    }
    .card {
      background-color: #f0f7f4;
      border-left: 4px solid #2c7a5f;
      padding: 20px;
      margin: 25px 0;
      border-radius: 0 8px 8px 0;
    }
    .card-title {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #555555;
      margin: 0 0 5px 0;
    }
    .reg-id {
      font-size: 28px;
      font-weight: 800;
      color: #1b4d3e;
      margin: 0;
      letter-spacing: 1px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #2c7a5f;
      margin-top: 25px;
      border-bottom: 1px solid #e1e8ed;
      padding-bottom: 5px;
    }
    .benefits-list {
      padding-left: 20px;
      margin: 15px 0;
    }
    .benefits-list li {
      margin-bottom: 10px;
    }
    .bilingual-divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #2c7a5f, transparent);
      margin: 35px 0;
    }
    .footer {
      background-color: #f7f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #777777;
      border-top: 1px solid #e1e8ed;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>KAYAKA SAMPADA FPO</h1>
      <p>ಕಾಯಕ ಸಂಪದ ರೈತ ಉತ್ಪಾದಕ ಸಂಸ್ಥೆ</p>
    </div>
    
    <div class="content">
      <!-- English Section -->
      <div class="welcome">Dear ${fullName},</div>
      <p>We are delighted to inform you that your membership application for <strong>Kayaka Sampada Farmer Producer Organisation (FPO)</strong> has been successfully reviewed and approved by our administrative committee! Welcome to our growing agricultural family.</p>
      
      <div class="card">
        <div class="card-title">Your Unique Member Registration ID</div>
        <div class="reg-id">${regId}</div>
      </div>
      
      <div class="section-title">Exclusive Member Benefits</div>
      <ul class="benefits-list">
        <li><strong>Quality Seeds & Fertilizers:</strong> Subsidized high-yield seeds, customized organic/chemical fertilizers, and organic soil health conditioners.</li>
        <li><strong>Government Subsidies:</strong> Direct access to department schemes, farming equipment, and state-backed financial/credit initiatives.</li>
        <li><strong>FPO Direct Buyback:</strong> Guaranteed, competitive market rate buybacks for your yield, completely bypassing middlemen.</li>
      </ul>
      
      <p>If you have any questions or would like to pick up your formal membership card, please feel free to reach out to our local administrative office.</p>

      <div class="bilingual-divider"></div>

      <!-- Kannada Section -->
      <div class="welcome" style="font-family: inherit;">ಆತ್ಮೀಯ ${fullName},</div>
      <p>ನಮ್ಮ ಆಡಳಿತ ಸಮಿತಿಯಿಂದ <strong>ಕಾಯಕ ಸಂಪದ ರೈತ ಉತ್ಪಾದಕ ಸಂಸ್ಥೆಯ (FPO)</strong> ನಿಮ್ಮ ಸದಸ್ಯತ್ವ ಅರ್ಜಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಿ ಅನುಮೋದಿಸಲಾಗಿದೆ ಎಂದು ತಿಳಿಸಲು ನಾವು ಸಂತೋಷಪಡುತ್ತೇವೆ! ನಮ್ಮ ಬೆಳೆಯುತ್ತಿರುವ ಕೃಷಿ ಕುಟುಂಬಕ್ಕೆ ಆತ್ಮೀಯ ಸ್ವಾಗತ.</p>
      
      <div class="card">
        <div class="card-title">ನಿಮ್ಮ ವಿಶಿಷ್ಟ ಸದಸ್ಯತ್ವ ನೋಂದಣಿ ಐಡಿ (Registration ID)</div>
        <div class="reg-id">${regId}</div>
      </div>
      
      <div class="section-title">ಸದಸ್ಯರ ವಿಶೇಷ ಸೌಲಭ್ಯಗಳು</div>
      <ul class="benefits-list">
        <li><strong>ಗುಣಮಟ್ಟದ ಬಿತ್ತನೆ ಬೀಜ ಮತ್ತು ರಸಗೊಬ್ಬರಗಳು:</strong> ರಿಯಾಯಿತಿ ದರದಲ್ಲಿ ಉತ್ತಮ ಇಳುವರಿ ನೀಡುವ ಬೀಜಗಳು, ಸಾವಯವ ಮತ್ತು ರಾಸಾಯನಿಕ ಗೊಬ್ಬರಗಳು.</li>
        <li><strong>ಸರ್ಕಾರಿ ಸಹಾಯಧನಗಳು:</strong> ಕೃಷಿ ಇಲಾಖೆಯ ಯೋಜನೆಗಳು, ಉಪಕರಣಗಳು ಮತ್ತು ಆರ್ಥಿಕ ಸೌಲಭ್ಯಗಳ ನೇರ ಲಭ್ಯತೆ.</li>
        <li><strong>ನೇರ ಕೃಷಿ ಉತ್ಪನ್ನ ಖರೀದಿ:</strong> ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲದೆ ನಿಮ್ಮ ಬೆಳೆಗಳಿಗೆ ಖಾತರಿ ಮತ್ತು ಸ್ಪರ್ಧಾತ್ಮಕ ಮಾರುಕಟ್ಟೆ ದರದಲ್ಲಿ ನೇರ ಖರೀದಿ ವ್ಯವಸ್ಥೆ.</li>
      </ul>
      
      <p>ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳಿದ್ದಲ್ಲಿ ಅಥವಾ ನಿಮ್ಮ ಅಧಿಕೃತ ಸದಸ್ಯತ್ವ ಕಾರ್ಡ್ ಪಡೆಯಲು ದಯವಿಟ್ಟು ನಮ್ಮ ಸ್ಥಳೀಯ ಆಡಳಿತ ಕಚೇರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.</p>
      
      <p style="margin-top: 30px;">Warm regards / ಆತ್ಮೀಯ ಗೌರವಗಳೊಂದಿಗೆ,<br><strong>Board of Administration / ಆಡಳಿತ ಮಂಡಳಿ</strong><br>Kayaka Sampada FPO / ಕಾಯಕ ಸಂಪದ ಎಫ್.ಪಿ.ಒ.</p>
    </div>
    
    <div class="footer">
      <p>© 2026 Kayaka Sampada FPO. All Rights Reserved / ಸರ್ವ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.</p>
      <p>This is an automated system notification. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
  `;

  const textBody = `
Dear ${fullName},

We are delighted to inform you that your membership application for Kayaka Sampada Farmer Producer Organisation (FPO) has been approved!

Your Unique Member Registration ID: ${regId}

---

ಆತ್ಮೀಯ ${fullName},

ಕಾಯಕ ಸಂಪದ ರೈತ ಉತ್ಪಾದಕ ಸಂಸ್ಥೆಯ (FPO) ನಿಮ್ಮ ಸದಸ್ಯತ್ವ ಅರ್ಜಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಿ ಅನುಮೋದಿಸಲಾಗಿದೆ!

ನಿಮ್ಮ ವಿಶಿಷ್ಟ ಸದಸ್ಯತ್ವ ನೋಂದಣಿ ಐಡಿ: ${regId}

---
Warm regards / ಆತ್ಮೀಯ ಗೌರವಗಳೊಂದಿಗೆ,
Board of Administration / ಆಡಳಿತ ಮಂಡಳಿ
Kayaka Sampada FPO
  `;

  try {
    const command = new SendEmailCommand({
      Source: senderEmail,
      Destination: {
        ToAddresses: [recipientEmail],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8',
          },
          Text: {
            Data: textBody,
            Charset: 'UTF-8',
          },
        },
      },
    });

    const response = await sesClient.send(command);
    console.log(`✅ AWS SES approval email successfully sent to ${recipientEmail}. MessageId: ${response.MessageId}`);
  } catch (error: any) {
    console.error(`❌ Failed to send AWS SES approval email to ${recipientEmail}:`, error);
    // Explicit warning about sandbox error for debugging
    if (error.name === 'MessageRejected') {
      console.error(`💡 Note: If you are in the AWS SES Sandbox, both the sender (${senderEmail}) and recipient (${recipientEmail}) must be verified in the AWS SES Console.`);
    }
  }
}
