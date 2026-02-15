/**
 * SignatureService (Visma Sign Mock)
 * Handles digital signing of legal documents.
 */
export class SignatureService {
  /**
   * Initiates a signing process for a document.
   * In a real app, this would call Visma Sign / Scrive / DocuSign API.
   */
  async createSigningRequest(params: {
    documentContent: string;
    documentName: string;
    signers: Array<{ name: string; email: string }>;
  }) {
    console.log(`[Signature Mock] Creating request for ${params.documentName}`);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Return a mock signing URL
    return {
      success: true,
      documentId: `sign_${Math.random().toString(36).substr(2, 9)}`,
      signingUrl: `https://vismasign-mock.fi/sign/${Math.random().toString(36).substr(2, 12)}`,
    };
  }

  /**
   * Formats the contract with dynamic data (Hydration)
   */
  hydrateContract(template: string, replacements: Record<string, string>) {
    let hydrated = template;
    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
      hydrated = hydrated.replace(regex, value);
    });
    return hydrated;
  }
}

export const signatureService = new SignatureService();
