/**
 * Audit Logging Wrapper for HTJ2 Operations
 *
 * Ensures GDPR compliance by logging all PII field access
 * and tracking board member actions.
 */

import { prisma } from "@/lib/db";

interface AuditContext {
  boardMemberId: string;
  housingCompanyId: string;
  operation: string;
  piiFieldsAccessed: string[];
  metadata?: Record<string, unknown>;
}

interface AuditResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  auditLogId: string;
}

/**
 * Wraps an HTJ2 operation with audit logging
 */
export async function withAuditLogging<T>(
  context: AuditContext,
  operation: () => Promise<T>,
): Promise<AuditResult<T>> {
  const startTime = Date.now();

  try {
    const result = await operation();
    const duration = Date.now() - startTime;

    // Extract PII fields from result if it contains data with PII
    let piiFields = context.piiFieldsAccessed;
    if (result && typeof result === "object") {
      if (
        "piiFields" in result &&
        Array.isArray((result as { piiFields: unknown }).piiFields)
      ) {
        piiFields = (result as { piiFields: string[] }).piiFields;
      } else if ("data" in result) {
        // If result has a data field, extract PII from it
        const extracted = extractPIIFields((result as { data: unknown }).data);
        piiFields = [...new Set([...piiFields, ...extracted])];
      } else {
        // Extract PII from the result itself
        const extracted = extractPIIFields(result);
        piiFields = [...new Set([...piiFields, ...extracted])];
      }
    }

    // Log successful operation
    const log = await prisma.hTJ_SyncLog.create({
      data: {
        housingCompanyId: context.housingCompanyId,
        boardMemberId: context.boardMemberId,
        operation: context.operation,
        status: "SUCCESS",
        recordCount: 0, // Will be updated by caller if needed
        piiFieldsAccessed: piiFields,
        metadata: {
          ...context.metadata,
          duration,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return {
      success: true,
      data: result,
      auditLogId: log.id,
    };
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log failed operation
    const log = await prisma.hTJ_SyncLog.create({
      data: {
        housingCompanyId: context.housingCompanyId,
        boardMemberId: context.boardMemberId,
        operation: context.operation,
        status: "FAILED",
        recordCount: 0,
        piiFieldsAccessed: context.piiFieldsAccessed,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        metadata: {
          ...context.metadata,
          duration,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      auditLogId: log.id,
    };
  }
}

/**
 * Extract PII fields from MML API response
 * Based on HTJ2 API documentation, common PII fields include:
 * - henkilotunnus (personal identity code)
 * - nimi (name)
 * - osoite (address)
 * - puhelin (phone)
 * - email (email)
 */
export function extractPIIFields(data: unknown): string[] {
  const piiFields: string[] = [];
  const piiFieldNames = [
    "henkilotunnus",
    "nimi",
    "etunimi",
    "sukunimi",
    "osoite",
    "katuosoite",
    "postinumero",
    "postitoimipaikka",
    "puhelin",
    "email",
    "sahkoposti",
  ];

  function traverse(obj: unknown, path = ""): void {
    if (obj === null || obj === undefined) return;

    if (typeof obj === "object") {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          traverse(item, `${path}[${index}]`);
        });
      } else {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;

          if (piiFieldNames.includes(key.toLowerCase())) {
            piiFields.push(currentPath);
          }

          traverse(value, currentPath);
        }
      }
    }
  }

  traverse(data);
  return [...new Set(piiFields)]; // Remove duplicates
}
