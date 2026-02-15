/**
 * Stripe Service Mock
 * Handles simulated checkout sessions and transactions.
 */
export class StripeService {
  async createCheckoutSession(params: {
    userId: string;
    amount: number;
    productName: string;
    metadata: Record<string, string>;
    successUrl: string;
    cancelUrl: string;
  }) {
    console.log(`[Stripe Mock] Creating checkout session for ${params.productName}`);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const sessionId = `cs_mock_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: sessionId,
      url: `${params.successUrl.replace('{CHECKOUT_SESSION_ID}', sessionId)}`,
    };
  }

  async verifyWebhookSignature(payload: string, signature: string, secret: string) {
    // Mock verification
    return true;
  }
}

export const stripe = new StripeService();
