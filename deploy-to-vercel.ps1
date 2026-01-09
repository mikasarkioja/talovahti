# Talovahti Vercel Deployment Script (PowerShell)
Write-Host "Starting deployment process for Talovahti..." -ForegroundColor Cyan

# 1. Check if Vercel is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Error "Vercel CLI not found. Please run: npm install -g vercel"
    exit
}

# 2. Login and Link
Write-Host "Linking to Vercel project..." -ForegroundColor Yellow
vercel link

# 3. Push Environment Variables
Write-Host "Syncing environment variables..." -ForegroundColor Yellow

$varsToSync = @(
    "DATABASE_URL",
    "DIRECT_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
)

if (Test-Path .env.local) {
    Get-Content .env.local | ForEach-Object {
        if ($_ -match '^(.*?)=(.*)$') {
            $key = $matches[1]
            $value = $matches[2].Trim('"').Trim("'")
            
            if ($varsToSync -contains $key) {
                Write-Host "Adding $key..." -ForegroundColor Gray
                # Add to production and preview
                $value | vercel env add "$key" production 
                $value | vercel env add "$key" preview
            }
        }
    }
} else {
    Write-Warning ".env.local not found."
}

# 4. Generate Prisma Client
Write-Host "Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

# 5. Build and Deploy
Write-Host "Deploying to Production..." -ForegroundColor Green
    vercel deploy --prod --yes

Write-Host "Deployment complete! Check your Vercel dashboard." -ForegroundColor Green
