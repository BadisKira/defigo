export interface MailjetDataWrapper<T = any> {
  Count: number;
  Data: T[];
  Total?: number;
}

export interface MailjetResponse<T = any> {
  body: MailjetDataWrapper<T>;
}

export interface MailjetContact {
  Email: string;
  Name?: string;
}

export interface MailjetListRecipient {
  ContactEmail: string;
  ListID: string;
}
