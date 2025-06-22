import { NextRequest } from 'next/server';

export interface MailjetConfig {
  apiKey: string;
  apiSecret: string;
}

export const getMailjetConfig = () => {
  const apiKey = process.env.NEXT_PUBLIC_MJ_APIKEY_PUBLIC;
  const apiSecret = process.env.NEXT_PUBLIC_MJ_APIKEY_PRIVATE;

  if (!apiKey || !apiSecret) {
    throw new Error('Mailjet API credentials are missing');
  }

  return {
    apiKey,
    apiSecret
  };
};

export interface MailjetRequest {
  type: 'sendEmail' | 'subscribeToNewsletter';
  data: any;
}

export interface MailjetResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export async function validateRequest(request: NextRequest): Promise<MailjetRequest> {
  try {
    const body = await request.json();
    if (!body.type || !body.data) {
      throw new Error('Invalid request format');
    }
    return body;
  } catch (error) {
    console.error(error);
    throw new Error('Invalid request body');
  }
}
