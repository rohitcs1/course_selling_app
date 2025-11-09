# 🎓 Online Course Selling Website

A modern, responsive React application for selling online courses with integrated payment gateway (Razorpay), email notifications, and Google Drive download links.

## ✨ Features

- 🎨 **Beautiful UI** - Modern design with Tailwind CSS and Framer Motion animations
- 📱 **Fully Responsive** - Works perfectly on mobile, tablet, and desktop
- 💳 **Payment Integration** - Secure Razorpay payment gateway
- 📧 **Email Notifications** - Automatic email with Google Drive links after payment
- 🎬 **Auto-play Video** - Preview video on landing page
- ✅ **Success Animations** - Confetti effects and smooth transitions
- 🔒 **Protected Routes** - Course page accessible only after payment

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Razorpay account (for payments)
- Gmail account (for sending emails)

### Installation

#### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

#### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment variables:**
   - Copy `server/.env.example` to `server/.env`
   - Add your Razorpay keys and email credentials

3. **Start backend server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

4. **Backend will run on:** `http://localhost:5000`

## 📁 Project Structure

```
course-selling-website/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── PaymentModal.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Success.jsx
│   │   └── Course.jsx
│   ├── hooks/
│   │   └── useWindowSize.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🔧 Configuration

### Razorpay Setup

1. **Get Razorpay Keys:**
   - Sign up at [Razorpay](https://razorpay.com)
   - Get your API keys from Dashboard

2. **Update PaymentModal.jsx:**
   ```javascript
   key: razorpayKey || 'rzp_test_YOUR_KEY', // Replace with your key
   ```

### Backend API Endpoints

You need to create a backend server with these endpoints:

1. **POST `/api/create-order`**
   - Creates Razorpay order
   - Returns: `{ orderId, razorpayKey }`

2. **POST `/api/verify-payment`**
   - Verifies payment signature
   - Sends email with Google Drive link
   - Returns: `{ success: true/false }`

### Email Configuration

Configure email service in your backend to send Google Drive links using:
- **Nodemailer** (for Node.js)
- Gmail SMTP or any email service

### Google Drive Link

Update the Google Drive link in `Course.jsx`:
```javascript
const [googleDriveLink] = useState('https://drive.google.com/drive/folders/YOUR_FOLDER_ID')
```

## 🎨 Customization

### Change Course Data

Edit `src/pages/Home.jsx`:
```javascript
const courseData = {
  title: "Your Course Title",
  description: "Your course description",
  price: 2999,
  originalPrice: 5999,
  poster: "your-image-url",
  videoUrl: "your-video-url"
}
```

### Change Colors

Edit `tailwind.config.js` to customize the color scheme.

## 📦 Build for Production

```bash
npm run build
```

The optimized files will be in the `dist` folder.

## 🔗 Instagram Ads Integration

To redirect from Instagram ads:

1. Create an Instagram ad campaign
2. Set the website URL to: `https://yourdomain.com`
3. Add UTM parameters for tracking:
   ```
   https://yourdomain.com?utm_source=instagram&utm_medium=ads
   ```

## 📝 Environment Variables

Create a `.env` file in the root directory (for backend):

```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
GOOGLE_DRIVE_LINK=https://drive.google.com/drive/folders/YOUR_FOLDER_ID
```

## 🛠️ Technologies Used

- **React 18** - UI library
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Hot Toast** - Notifications
- **React Confetti** - Success effects
- **Axios** - HTTP requests
- **Razorpay** - Payment gateway
- **Vite** - Build tool

## 📱 Mobile Responsive

The website is fully responsive and optimized for:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)

## 🎯 Features Breakdown

### Landing Page
- Hero section with course poster
- Auto-playing preview video
- Course gallery with prices
- Smooth animations

### Payment Flow
- Email/Phone collection form
- Razorpay checkout
- Payment verification
- Success page with confetti

### Course Access
- Full course video player
- Google Drive download button
- Course modules list
- Email confirmation message

## 🤝 Support

For issues or questions, please contact support.

## 📄 License

This project is open source and available under the MIT License.

---

**Made with ❤️ for course sellers**

