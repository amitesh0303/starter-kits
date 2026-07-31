export interface NewsletterSubscription {
  email: string;
  subscribedAt: Date;
}

export interface NewsletterAdapter {
  subscribe(email: string): Promise<{ success: boolean; error?: string }>;
}

function createFakeNewsletterAdapter(): NewsletterAdapter {
  return {
    async subscribe(email: string) {
      if (!email || !email.includes("@")) {
        return { success: false, error: "Invalid email address" };
      }
      return { success: true };
    },
  };
}

export function useNewsletter(): NewsletterAdapter {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY || RESEND_API_KEY === "re_placeholder") {
    return createFakeNewsletterAdapter();
  }

  return createFakeNewsletterAdapter();
}
