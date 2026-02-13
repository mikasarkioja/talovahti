import { RBAC } from "@/lib/auth/rbac";

// Higher-order function for API Routes
export function withAudit(
  action: string,
  handler: (req: Request, context: unknown) => Promise<Response>,
) {
  return async (req: Request, context: unknown) => {
    // Mock User Extraction (In real app, get from session)
    const userId = req.headers.get("x-user-id") || "mock-user-id";
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

    // Extract Target from URL or Body (Simplified)
    const target = req.url;

    // Log
    await RBAC.auditAccess(userId, action, target, "API Route Access", ip);

    return handler(req, context);
  };
}
