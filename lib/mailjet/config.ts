import Mailjet from 'node-mailjet';

export const mailjet = new Mailjet({
  apiKey: process.env.NEXT_PUBLIC_MJ_APIKEY_PUBLIC,
  apiSecret: process.env.NEXT_PUBLIC_MJ_APIKEY_PRIVATE
});

export const NEWSLETTER_LIST_ID = process.env.NEXT_PUBLIC_MJ_NEWSLETTER_LIST_ID;

if (!NEWSLETTER_LIST_ID) {
  throw new Error('NEXT_PUBLIC_MJ_NEWSLETTER_LIST_ID is required');
}
