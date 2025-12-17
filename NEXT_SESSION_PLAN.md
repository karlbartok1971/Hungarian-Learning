# Next Session Plan: Supabase Integration & Deployment

## Current Status
- **Frontend**: Admin CMS is fully functional (Read/Write) but currently using local JSON files.
- **Backend**: Ready for Supabase, but `prisma db push` failed due to `.env` configuration errors.
- **Blocker**: 
    1.  `backend/.env` has a **duplicate** `DATABASE_URL` (one for local, one for Supabase). The system was reading the broken local one.
    2.  Supabase connection requires IPv4 Supavisor URL (`pooler.supabase.com`) due to network environment.
    3.  `npx prisma db push` must be run from the `backend` directory, not the project root.

## Immediate Next Steps (To-Do)

1.  **Fix `backend/.env` Configuration**
    -   Open `backend/.env`.
    -   **Delete** the top `DATABASE_URL` line (referencing `localhost`).
    -   **Keep** the bottom `DATABASE_URL` with the IPv4 Pooler address:
        ```env
        DATABASE_URL="postgresql://postgres.vtddxhnpwhyitrgjaiip:Chon990515%5E%5E@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
        DIRECT_URL="postgresql://postgres:Chon990515%5E%5E@db.vtddxhnpwhyitrgjaiip.supabase.co:5432/postgres"
        ```

2.  **Database Migration**
    -   Run the command **inside the `backend` folder**:
        ```bash
        cd backend
        npx prisma db push
        ```
    -   This will create the tables in Supabase.

3.  **Data Migration**
    -   Create a script to read `a1.json` (and others) and insert them into the Supabase `VocabularyItem` table.

4.  **Backend Logic Update**
    -   Modify `backend/src/api/admin.ts` to read/write from Prisma (DB) instead of the file system.

5.  **Deployment**
    -   Deploy Frontend to Vercel.
    -   Deploy Backend to Render.
