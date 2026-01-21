# Troubleshooting Database Connection Issues

## Quick Checklist

If you're still getting "FATAL: Tenant or user not found" after updating environment variables:

### 1. ✅ Did You Redeploy?

**Critical:** Vercel does NOT automatically use new environment variables until you redeploy.

**Fix:**
- Go to Vercel Dashboard → **Deployments**
- Click **⋯** on the latest deployment → **Redeploy**
- OR push a new commit to trigger a new deployment

### 2. ✅ Password URL Encoding

If your database password contains special characters (`@`, `#`, `%`, `&`, etc.), they MUST be URL-encoded in the connection string.

**Common characters that need encoding:**
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `/` → `%2F`
- `?` → `%3F`
- `=` → `%3D`

**Example:**
```
# Wrong (if password is "p@ss#word"):
postgresql://postgres:p@ss#word@db.xxx.supabase.co:5432/postgres

# Correct:
postgresql://postgres:p%40ss%23word@db.xxx.supabase.co:5432/postgres
```

**Quick Fix:**
- Use an online URL encoder: https://www.urlencoder.org/
- Or use JavaScript: `encodeURIComponent('your-password')`

### 3. ✅ Verify Connection String Format

Your connection string should look exactly like this:

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Check:**
- ✅ Starts with `postgresql://`
- ✅ Has `postgres:` (username)
- ✅ Has `[PASSWORD]` (URL-encoded if needed)
- ✅ Has `@db.` (not `@aws-0-` or other prefixes)
- ✅ Has `.supabase.co` (not `.supabase.com` or other domains)
- ✅ Has `:5432` (port)
- ✅ Ends with `/postgres` (database name)

### 4. ✅ Test Connection String Locally First

Before deploying to Vercel, test the connection string locally:

1. **Update your local `.env` file** with the same connection string
2. **Run the test script:**
   ```bash
   npx tsx prisma/test-connection.ts
   ```
3. **If it works locally but not on Vercel:**
   - Double-check the Vercel environment variable value
   - Make sure there are no extra spaces or line breaks
   - Verify the environment (Production vs Preview)

### 5. ✅ Supabase Connection Pooling

For Supabase, you have two connection options:

**Option A: Connection Pooler (Recommended for Vercel)**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Option B: Direct Connection**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**For `DATABASE_URL`:** Use the **Connection Pooler** (port 6543)
**For `DIRECT_URL`:** Use the **Direct Connection** (port 5432) with `?pgbouncer=true`

### 6. ✅ Verify Database Exists

The error "Tenant or user not found" can also mean:
- The database doesn't exist
- The project reference is wrong
- You're connecting to the wrong Supabase project

**Check:**
1. Go to Supabase Dashboard
2. Verify your project reference ID matches the connection string
3. Check that the database is active (not paused)

### 7. ✅ Check Vercel Build Logs

1. Go to Vercel Dashboard → **Deployments**
2. Click on the failed deployment
3. Check **Build Logs** for:
   - What `DATABASE_URL` value is being used (masked)
   - Any connection errors
   - Prisma generation errors

### 8. ✅ Environment Variable Scope

Make sure your environment variables are set for the correct environment:

- **Production:** For your live site
- **Preview:** For pull request previews
- **Development:** For local Vercel CLI (optional)

**Check:** In Vercel Dashboard → Environment Variables, verify each variable shows the correct environment badge.

## Step-by-Step Debugging

### Step 1: Get the Exact Connection String from Supabase

1. Go to Supabase Dashboard → **Settings** → **Database**
2. Under **Connection string**, select **URI**
3. **Copy the EXACT string** (don't modify it manually)
4. Replace `[YOUR-PASSWORD]` with your actual password (URL-encoded if needed)

### Step 2: Test Locally

1. Update `.env`:
   ```env
   DATABASE_URL="[paste-connection-string-here]"
   DIRECT_URL="[same-but-with-?pgbouncer=true]"
   ```

2. Test:
   ```bash
   npx tsx prisma/test-connection.ts
   ```

3. If it fails locally, the connection string is wrong. Fix it first.

### Step 3: Update Vercel

1. Go to Vercel Dashboard → **Settings** → **Environment Variables**
2. For `DATABASE_URL` (Production):
   - Click **⋯** → **Edit**
   - Paste the EXACT connection string (same as local `.env`)
   - Verify no extra spaces
   - Click **Save**

3. For `DIRECT_URL` (Production):
   - Click **⋯** → **Edit**
   - Paste the same connection string
   - Add `?pgbouncer=true` at the end
   - Click **Save**

### Step 4: Force Redeploy

1. Go to **Deployments**
2. Click **⋯** on latest deployment
3. Click **Redeploy**
4. Wait for build to complete
5. Check if error is resolved

## Common Mistakes

❌ **Copying connection string with extra spaces**
✅ Remove all leading/trailing spaces

❌ **Using wrong password (old password)**
✅ Reset password in Supabase if unsure

❌ **Not URL-encoding special characters in password**
✅ Use `encodeURIComponent()` or online encoder

❌ **Using Preview environment variable in Production**
✅ Check the environment badge on each variable

❌ **Forgetting to redeploy after updating variables**
✅ Always redeploy after changing environment variables

❌ **Using `DIRECT_URL` format for `DATABASE_URL`**
✅ Use connection pooler for `DATABASE_URL`, direct for `DIRECT_URL`

## Still Not Working?

If you've tried everything above:

1. **Create a new Supabase project** (if possible) to get fresh credentials
2. **Reset your database password** in Supabase
3. **Check Supabase status page** for any outages
4. **Contact Supabase support** with your project reference ID

## Verification Script

Run this locally to verify your connection string format:

```bash
# Test connection
npx tsx prisma/test-connection.ts

# If successful, you should see:
# ✅ Connection Successful! Found X housing companies.
```

If this works locally but not on Vercel, the issue is with how the environment variable is set in Vercel (formatting, encoding, or environment scope).
