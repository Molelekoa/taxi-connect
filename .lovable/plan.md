
## Setting Up Environment Variables for Neon Connection String

### Your Current Setup Context
- **Frontend**: React + Vite (client-side only, no .env files in this repo)
- **Database**: Neon (external PostgreSQL)
- **Backend**: Vercel serverless functions (not yet created in this repo)
- **Note**: There is NO .env or .env.local file needed in your Lovable project because it's frontend-only

### Where Environment Variables Go

Since you're using **two separate platforms**, environment variables must be configured in each:

**1. Vercel (for API Routes / Serverless Functions)**
   - This is where your Neon connection string lives
   - Environment variables are set in the Vercel dashboard
   - Your API routes will access them via `process.env.DATABASE_URL`

**2. Lovable Frontend (this project)**
   - Frontend uses public environment variables only (prefixed with `VITE_`)
   - Used for Mapbox API key, etc.
   - NOT for sensitive secrets like database credentials

### Implementation Steps

#### Step 1: Get Your Neon Connection String
1. Log into your Neon dashboard
2. Go to **Project Settings** → **Connection String**
3. Copy the PostgreSQL connection string:
   ```
   postgresql://username:password@neon-hostname.neon.tech/database_name?sslmode=require
   ```

#### Step 2: Store in Vercel (for API Routes)
1. Go to your **Vercel project settings**
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Paste your Neon connection string
   - **Environments**: Select Development, Preview, and Production as needed
4. Click **Save**

#### Step 3: Use in Your Vercel API Routes
When you create API routes (e.g., `/api/register-sender`), access it like:
```javascript
const dbUrl = process.env.DATABASE_URL;
const client = new Client({ connectionString: dbUrl });
```

#### Step 4: Verify Locally (Optional)
If you're developing Vercel functions locally with the Vercel CLI:
1. Install: `npm i -g vercel`
2. Run: `vercel env pull` (pulls env vars into `.env.local` for local testing)
3. Your API routes can now access `process.env.DATABASE_URL`

### Important Security Notes
- ✅ The `DATABASE_URL` is a **secret** — never commit it to GitHub
- ✅ Vercel's **Environment Variables** are encrypted and securely stored
- ✅ Only your Vercel functions can access it (not exposed to frontend)
- ❌ Do NOT paste credentials into your React code or vite.config.ts

### What's Next
Once you've set up the connection string in Vercel, the next step is to create your first API route (e.g., `/api/auth/register-sender`) that connects to Neon and inserts data from the frontend forms.

### Diagram
```
Frontend (React)         Vercel Functions           Neon Database
┌─────────────┐         ┌──────────────┐           ┌──────────────┐
│  Form Data  │────────>│  API Route   │──────────>│  PostgreSQL  │
│  (JSON)     │         │  Uses $DB_URL│           │  (Tables)    │
└─────────────┘         └──────────────┘           └──────────────┘
                        Env Var: DATABASE_URL
```

