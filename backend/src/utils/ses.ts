import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

let sesClient: SESClient | null = null;

function getSESClient(): { client: SESClient | null; senderEmail: string } {
  const senderEmail = process.env.AWS_SES_SENDER || 'no-reply@kayakasampadafpo.org';
  
  if (sesClient) {
    return { client: sesClient, senderEmail };
  }

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'us-east-1';

  if (accessKeyId && secretAccessKey) {
    sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    console.log('✅ AWS SES Client initialized successfully.');
    return { client: sesClient, senderEmail };
  }

  console.warn('⚠️ AWS SES credentials are not configured in environment variables. Email notifications will be mocked.');
  return { client: null, senderEmail };
}

export async function sendApprovalEmail(recipientEmail: string, fullName: string, regId: string): Promise<void> {
  const { client: clientToUse, senderEmail } = getSESClient();

  if (!clientToUse) {
    console.log(`[EMAIL MOCK] Would send approval email to ${recipientEmail} with RegID: ${regId} (AWS credentials missing)`);
    return;
  }

  const subject = `Registration Approved Successfully`;
  
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <p>Hello ${fullName},</p>
    <p>Your registration has been successfully approved by the Kayaka Sampada.</p>
    <br>
    <p>Thank you</p>
  </div>
</body>
</html>
  `;

  const textBody = `Hello ${fullName},

Your registration has been successfully approved by the Kayaka Sampada.

Thank you`;

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

    const response = await clientToUse.send(command);
    console.log(`✅ AWS SES approval email successfully sent to ${recipientEmail}. MessageId: ${response.MessageId}`);
  } catch (error: any) {
    console.error(`❌ Failed to send AWS SES approval email to ${recipientEmail}:`, error);
    if (error.name === 'MessageRejected') {
      console.error(`💡 Note: If you are in the AWS SES Sandbox, both the sender (${senderEmail}) and recipient (${recipientEmail}) must be verified in the AWS SES Console.`);
    }
    throw error; // Rethrow so the caller knows it failed
  }
}
