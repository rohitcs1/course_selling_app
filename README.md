Course Selling App
===================

Full-stack platform to sell digital courses - React frontend, Express backend, Razorpay payments, Supabase storage and Nodemailer for delivery of Google Drive links.

What this project does
----------------------

This repository implements a minimal course marketplace where admins can create courses, and buyers can purchase access. It demonstrates a small, production-ready stack for digital product delivery including:

- Course management (admin)
- Razorpay order creation and payment verification
- Storing courses, purchases, and payments in Supabase
- Sending course access (Google Drive) links via email after successful payment
- Responsive React frontend built with Vite

Tech stack
----------

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: Supabase (Postgres)
- Payments: Razorpay
- Email: Nodemailer (SMTP) - configured to use Gmail App Passwords

Repo layout
-----------

- `frontend/` - React app, includes components and pages (Home, Course, Admin, Payment modal)
- `backend/` - Express server, payment verification, email sending, Supabase integration

Quick start (development)
-------------------------

1. Clone the repo:

```powershell
git clone <your-repo-url>
cd "course selling"
```

2. Install dependencies and run frontend and backend in separate terminals:

```powershell
# Frontend
cd frontend
npm install
npm run dev

# Backend (new terminal)
cd backend
npm install
node index.js
```

3. Open the frontend URL shown by Vite (usually http://localhost:5173) and use the app.

Important environment variables
-------------------------------

Backend (place in `backend/.env` or configure in your host):

- `RAZORPAY_KEY_ID` - Razorpay key id
- `RAZORPAY_KEY_SECRET` - Razorpay key secret
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role (server) key
- `EMAIL_HOST` - SMTP host (default: `smtp.gmail.com`)
- `EMAIL_PORT` - SMTP port (587)
- `EMAIL_USER` - SMTP username (your Gmail address)
- `EMAIL_PASS` - SMTP app password (generate via Google Account)
- `JWT_SECRET` - secret used for admin auth tokens
- `GOOGLE_DRIVE_LINK` - fallback drive link if course-specific link missing (optional)

Frontend (place in `frontend/.env` or use Vite env variables):

- `VITE_API_BASE` - Backend base URL (e.g., `http://localhost:5000` or your deployed backend URL)

Gmail notes (email delivery)
---------------------------

Use Google App Passwords (recommended) rather than your main Gmail password:

1. Enable 2-Step Verification on your Google account.
2. Go to Security -> App Passwords -> create a new app password for Mail.
3. Use the generated password as `EMAIL_PASS`.

If emails still fail on a host like Render, check the host logs for SMTP errors and confirm outbound SMTP is permitted.

Deploying backend (Render.com) - short checklist
-----------------------------------------------

1. Create a Web Service in Render pointing to the `backend/` folder or the repo root with start command: `node index.js` (or an npm start script).
2. Set environment variables in the Render dashboard (copy the backend env list above).
3. Ensure Supabase keys and Razorpay secrets are set as secret environment variables.
4. Check Render logs for startup and for any errors during email sending.

Usage
-----

- Admins can create or update courses via the admin endpoint.
- When a buyer purchases a course, the backend verifies payment and emails the buyer a Google Drive link (course-specific link from DB; fallback to `GOOGLE_DRIVE_LINK`).

Repository topics (suggested)
----------------------------

react, express, razorpay, supabase, nodemailer, payments, online-courses, vite, fullstack

Contributing
------------

PRs welcome. For feature changes, include a short test or manual verification steps (e.g., create a test course and simulate a Razorpay payment). Keep secret keys out of commits - use environment variables.

License
-------

Add a license of your choice (MIT recommended). Create a `LICENSE` file at repository root.

---

Extras I can add on request:

- Badges (build, license) and a longer Getting Started with screenshots.
- `frontend/.env.example` and `backend/.env.example` with placeholders.
