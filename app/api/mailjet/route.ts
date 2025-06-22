import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from './config';
import { handleSendEmail } from './helper';


export async function POST(request: NextRequest) {
  try {
    const { type, data } = await validateRequest(request);
    
    switch (type) {
      case 'sendEmail':
        return await handleSendEmail(data);
      
      default:
        return NextResponse.json(
          { error: 'Invalid request type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Mailjet API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
