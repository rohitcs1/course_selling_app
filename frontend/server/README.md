# Backend Server for Course Selling Website

This is the backend server that handles payment processing and email notifications.

## Setup

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in your Razorpay keys and email credentials

3. **Start the server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## API Endpoints

### POST `/api/create-order`
Creates a Razorpay order.

**Request Body:**
```json
{
  "amount": 299900,
  "currency": "INR",
  "receipt": "receipt_123",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  }
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order_xxx",
  "razorpayKey": "rzp_test_xxx"
}
```

### POST `/api/verify-payment`
Verifies payment and sends email with Google Drive link.

**Request Body:**
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and email sent successfully"
}
```

## Configuration

### Razorpay Setup
1. Sign up at [Razorpay](https://razorpay.com)
2. Get your API keys from Dashboard → Settings → API Keys
3. Add them to `.env` file

### Gmail Setup
1. Enable 2-Step Verification on your Google account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App Passwords
   - Create password for "Mail"
3. Use this password in `EMAIL_PASS`

### Google Drive Link
1. Upload your course files to Google Drive
2. Create a folder and share it (make it accessible)
3. Copy the folder link and add to `GOOGLE_DRIVE_LINK`

## Important Notes

- The server runs on port 5000 by default
- Make sure CORS is enabled for your frontend domain
- Use HTTPS in production for secure payment processing
- Keep your `.env` file secure and never commit it to git

