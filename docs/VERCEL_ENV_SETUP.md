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
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your actual database password

**Format:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

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
- ❌ `DATABASE_URL` points to a database that doesn't exist

**Solution:**
1. Verify the connection string in your Supabase dashboard
2. Check that the password is correct
3. Ensure the variable is set for **Production** environment
4. Redeploy after making changes

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
- [ ] Connection string format is correct
- [ ] Database password is correct
- [ ] Deployment has been triggered after setting variables
