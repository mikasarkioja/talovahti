# HTJ2 Integration Engine

## Overview

The HTJ2 Integration Engine provides a secure synchronization layer between Maanmittauslaitos (MML) HTJ2 APIs and the Talovahti database using a "Shadow Database" strategy. All operations are wrapped with GDPR-compliant audit logging.

## Architecture

### Shadow Database Strategy

- **HTJ_ShadowRecord**: Stores raw JSON responses from MML API endpoints
- **HTJ_SyncLog**: Tracks all operations with PII field access logging for GDPR compliance
- Local database models are updated only when no user modifications exist

### Components

1. **HTJ2Client** (`src/lib/mml/htj-client.ts`)
   - mTLS (Mutual TLS) authentication with MML production APIs
   - Uses Node.js `https` and `tls` modules for client certificate authentication
   - Singleton pattern for HTTPS agent reuse

2. **Audit Wrapper** (`src/lib/mml/audit-wrapper.ts`)
   - Wraps all HTJ2 operations with GDPR-compliant logging
   - Automatically extracts and logs PII fields accessed
   - Tracks board member actions and operation metadata

3. **Sync Actions** (`src/app/actions/htj-sync.ts`)
   - `syncHousingCompany`: Syncs data from `/yhtiot/` and `/osakeryhmat/` endpoints
   - `compareHTJState`: Calculates delta between local DB and shadow records
   - `submitRenovationToHTJ`: Submits renovation notifications to `/ilmoitukset/kunnossapito`

## Configuration

### Environment Variables

```env
MML_API_BASE_URL=https://api.maanmittauslaitos.fi/htj2
MML_CLIENT_CERT_PATH=/path/to/client.crt
MML_CLIENT_KEY_PATH=/path/to/client.key
MML_CA_CERT_PATH=/path/to/ca.crt
```

### Certificate Setup

1. Obtain client certificates from MML for production environment
2. Store certificates securely (use environment variables or secure vault)
3. Ensure proper file permissions (read-only for application user)

## Usage

### Sync Housing Company Data

```typescript
import { syncHousingCompany } from "@/app/actions/htj-sync";

const result = await syncHousingCompany(
  "1234567-8", // businessId (Y-tunnus)
  "user-id-123" // boardMemberId
);

// Returns:
// {
//   success: true,
//   apartmentsSynced: 12,
//   shareholdersSynced: 8,
//   auditLogIds: ["log-id-1", "log-id-2"]
// }
```

### Compare HTJ State (Delta View)

```typescript
import { compareHTJState } from "@/app/actions/htj-sync";

const delta = await compareHTJState(
  "1234567-8", // businessId
  "user-id-123" // boardMemberId
);

// Returns:
// {
//   businessId: "1234567-8",
//   housingCompanyId: "company-id",
//   deltas: [
//     {
//       type: "HOUSING_COMPANY",
//       field: "totalSqm",
//       localValue: 2500,
//       htjValue: 2800,
//       status: "MISMATCH"
//     }
//   ],
//   deltaCount: 1,
//   lastSync: Date
// }
```

### Submit Renovation Notification

```typescript
import { submitRenovationToHTJ } from "@/app/actions/htj-sync";

const result = await submitRenovationToHTJ(
  "renovation-id-123", // renovationId
  "user-id-123" // boardMemberId
);

// Returns:
// {
//   success: true,
//   auditLogId: "log-id",
//   submissionId: "mml-submission-id"
// }
```

## Data Protection

### PII Field Tracking

The audit wrapper automatically extracts and logs all PII fields accessed:

- `henkilotunnus` (personal identity code)
- `nimi`, `etunimi`, `sukunimi` (name fields)
- `osoite`, `katuosoite`, `postinumero`, `postitoimipaikka` (address fields)
- `puhelin`, `email`, `sahkoposti` (contact fields)

### Audit Log Structure

```typescript
{
  id: string;
  housingCompanyId: string;
  boardMemberId: string;
  operation: "SYNC_YHTIO" | "SYNC_OSAKERYHMAT" | "SUBMIT_RENOVATION" | "COMPARE_DELTA";
  status: "SUCCESS" | "FAILED" | "PARTIAL";
  recordCount: number;
  piiFieldsAccessed: string[]; // Array of PII field paths accessed
  errorMessage?: string;
  metadata: {
    endpoint?: string;
    businessId?: string;
    duration?: number;
    timestamp?: string;
  };
  timestamp: Date;
}
```

## Data Mapping Strategy

### Preserving User Data

The sync process uses a "non-destructive" approach:

1. **Housing Company**: Only updates fields that are `null` or missing
2. **Apartments**: Detects user modifications by comparing values
   - If apartment exists with different values, assumes user modification
   - Only creates/updates if no conflicts detected
3. **Shareholders**: Only creates new records, never overwrites existing

### Shadow Record Storage

All raw API responses are stored in `HTJ_ShadowRecord` for:
- Compliance auditing
- Delta comparison
- Debugging and troubleshooting
- Historical record keeping

## Error Handling

All operations are wrapped with try-catch and audit logging:

- Failed operations are logged with error messages
- PII fields are still tracked even on failure
- Audit logs can be queried for compliance reports

## Security Considerations

1. **mTLS Authentication**: Required for production MML API access
2. **Certificate Management**: Store certificates securely, never commit to git
3. **Audit Logging**: All operations logged with board member ID
4. **PII Tracking**: Automatic extraction and logging of all PII fields
5. **Shadow Database**: Raw responses stored for compliance and debugging

## Future Enhancements

- Scheduled automatic syncs
- Conflict resolution UI for delta mismatches
- Batch renovation submissions
- Real-time sync status dashboard
- Export audit logs for compliance reports
