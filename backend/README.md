# Course Selling Backend

This backend provides:
- Supabase (Postgres) storage for courses, admins, purchases and payments
- Admin registration & login (bcrypt + JWT)
- Course create/update/delete (protected)
- Public GET /api/courses to fetch courses for the frontend
- Razorpay order creation and payment verification with email + optional redirect to Google Drive

Quick setup
1. Copy `.env.example` to `.env` and fill required values including `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
2. Install dependencies:

```powershell
cd backend; npm install
```

3. Run server:

```powershell
npm run dev
```

API endpoints
- POST /admin/register { username, password }  -- create admin (one-time)
- POST /admin/login { username, password }     -- login returns { token }
- POST /admin/course (Bearer token) { course } -- create/update course
- DELETE /admin/course/:id (Bearer token)      -- delete course
- GET /api/courses                              -- list courses
- POST /api/create-order { amount, customer }   -- create razorpay order (amount in paise) and create a pending purchase
- POST /api/verify-payment { razorpay_order_id, razorpay_payment_id, razorpay_signature, customer } -- verify, save payment and email link

Database
- A SQL schema is provided at `supabase_schema.sql`. Create the tables in your Supabase project's SQL editor or via psql.

Notes
- The backend expects `FIREBASE_SERVICE_ACCOUNT` to be a JSON string. If you paste the raw JSON into the env file, replace newlines with `\\n`.
