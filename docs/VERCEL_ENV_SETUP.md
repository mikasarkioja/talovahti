# Vercel Environment Variables Setup

## Overview

Vercel **does NOT use `.env` files** in production. Environment variables must be configured in the Vercel Dashboard.

## Required Environment Variables

Based on your Prisma schema, you need:

1. **`DATABASE_URL`** - Main database connection string (used by Prisma Client)
2. **`DIRECT_URL`** - Direct connection string (used for migrations, optional but recommended)

## How to Set Environment Variables in Vercel

### Step 1: Access Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Navigate to your project: **talovahti** (or your project name)
3. Click **Settings** → **Environment Variables**

### Step 2: Add Variables

For each variable:

1. **Key**: Enter the variable name (e.g., `DATABASE_URL`)
2. **Value**: Paste your connection string
3. **Environment**: Select where it applies:
   - ✅ **Production** (for live site)
   - ✅ **Preview** (for pull request previews)
   - ✅ **Development** (optional, for local Vercel CLI)

4. Click **Save**

### Step 3: Redeploy

After adding/changing environment variables:
- Vercel will automatically redeploy, OR
- Go to **Deployments** tab → Click **⋯** on latest deployment → **Redeploy**

## Getting Your Database Connection String

### If Using Supabase:

1. Go to your Supabase project dashboard
2. Click **Settings** → **Database**
3. Under **Connection string**, select **URI**
4. **IMPORTANT**: Verify the region matches your Supabase project region
   - Check your Supabase project region (e.g., `eu-west-3`, `eu-west-1`)
   - The connection string host should match: `db.[PROJECT-REF].supabase.co` or include the region
5. Copy the connection string
6. Replace `[YOUR-PASSWORD]` with your actual database password

**Format:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**⚠️ Region Mismatch Warning:**
- If your Supabase database is in `eu-west-3` (Paris), but your Vercel `DATABASE_URL` points to `eu-west-1` (Ireland), **this will cause connection failures**
- Always ensure the connection string region matches your actual Supabase project region
- Your Vercel project region (shown in project settings) doesn't need to match, but the database connection string must match your Supabase region

### For DIRECT_URL (Supabase):

Use the same connection string but add `?pgbouncer=true` at the end:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true
```

## Local vs Production

| Location | File/Place | Purpose |
|----------|-----------|---------|
| **Local Development** | `.env` file in project root | Used by `npm run dev` |
| **Vercel Production** | Vercel Dashboard → Environment Variables | Used by deployed app |
| **Vercel Preview** | Vercel Dashboard → Environment Variables | Used by PR previews |

**Important:** 
- Your local `.env` file is **NOT** deployed to Vercel
- `.env` files are typically in `.gitignore` (and should be!)
- You must manually set variables in Vercel Dashboard

## Troubleshooting

### Error: "FATAL: Tenant or user not found"

This means:
- ❌ `DATABASE_URL` is not set in Vercel, OR
- ❌ `DATABASE_URL` has wrong credentials, OR
- ❌ `DATABASE_URL` points to a database that doesn't exist, OR
- ❌ **Region mismatch** - Connection string points to wrong region (e.g., `eu-west-1` when database is in `eu-west-3`)

**Solution:**
1. **CRITICAL: Redeploy after updating variables** - Vercel doesn't use new env vars until redeploy
2. Verify the connection string in your Supabase dashboard
3. **Check that the region in the connection string matches your Supabase project region**
4. **URL-encode special characters in password** (e.g., `@` → `%40`, `#` → `%23`)
5. Check that the password is correct (try resetting in Supabase if unsure)
6. Ensure the variable is set for **Production** environment
7. Test the connection string locally first (see `TROUBLESHOOTING_DB_CONNECTION.md`)

**Still not working?** See `docs/TROUBLESHOOTING_DB_CONNECTION.md` for detailed debugging steps.

### Error: "Connection timeout"

This usually means:
- Database firewall is blocking Vercel IPs
- Connection string uses wrong port or host

**Solution (Supabase):**
1. Go to Supabase Dashboard → **Settings** → **Database**
2. Check **Connection pooling** settings
3. Ensure **IPv4** connections are allowed
4. Verify you're using the correct connection string format

## Security Best Practices

1. ✅ **Never commit `.env` files** to git
2. ✅ **Use different databases** for development and production
3. ✅ **Rotate passwords** regularly
4. ✅ **Use connection pooling** (Supabase PgBouncer) for production
5. ✅ **Limit environment variable access** to necessary environments only

## Verifying Setup

After setting environment variables:

1. Go to Vercel Dashboard → **Deployments**
2. Click on a deployment
3. Check **Build Logs** for any connection errors
4. If successful, the app should connect to your database

## Quick Checklist

- [ ] `DATABASE_URL` is set in Vercel Dashboard
- [ ] `DIRECT_URL` is set in Vercel Dashboard (optional but recommended)
- [ ] Variables are enabled for **Production** environment
- [ ] **Connection string region matches your Supabase project region** (e.g., `eu-west-3`)
- [ ] Connection string format is correct
- [ ] Database password is correct
- [ ] No duplicate environment variables (one per environment: Production, Preview)
- [ ] Deployment has been triggered after setting variables

## Common Issues

### Duplicate Environment Variables

**Normal:** Having `DATABASE_URL` once for **Production** and once for **Preview** is correct and expected.

**Problem:** Having multiple `DATABASE_URL` entries for the same environment (e.g., two `DATABASE_URL` for Production) is a problem.

**Solution:**
1. In Vercel Dashboard → Environment Variables
2. Click the **⋯** menu on duplicate entries
3. Delete the incorrect/duplicate entries
4. Keep only one `DATABASE_URL` and one `DIRECT_URL` per environment (Production, Preview)
