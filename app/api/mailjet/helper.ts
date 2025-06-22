import { NextResponse } from 'next/server';
import Mailjet from 'node-mailjet';
import { getMailjetConfig } from './config';

interface EmailRecipient {
    Email: string;
    Name?: string;
  }
  
  interface EmailData {
    from: EmailRecipient;
    to: EmailRecipient[];
    subject: string;
    html: string;
    text: string;
    templateId?: number;
    variables?: Record<string, any>;
  }
  
  const mailjet = new Mailjet(getMailjetConfig());

  
  
  

export async function handleSendEmail(data: EmailData): Promise<NextResponse> {
    try {
      const response = await mailjet
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: {
                Email: data.from.Email,
                Name: data.from.Name
              },
              To: data.to.map(recipient => ({
                Email: recipient.Email,
                Name: recipient.Name
              })),
              Subject: data.subject,
              HTMLPart: String(data.html),
              TextPart: data.text,
              TemplateID: data.templateId,
              Variables: data.variables
            }
          ]
        });
      
      return NextResponse.json({
        success: true,
        data: response
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        data: error
      });
    }
  }
  