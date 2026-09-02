# MEGA JOURNAL — The Trading Performance Journal

MEGA JOURNAL is a full-stack, data-driven trading performance journal built for retail traders to log trades, discover statistical edges, identify drawdown leaks, and enforce trading discipline.

## Tech Stack (Vanilla & Lightweight)

- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript (ES modules, zero framework overhead, zero build step).
- **Backend**: Node.js with Express REST API.
- **Database**: MongoDB Atlas via Mongoose.
- **Auth**: JWT stored in httpOnly cookies / localStorage with Google OAuth support & 1-Click Demo Mode.
- **Charts**: Vanilla Chart.js.
- **Icons**: Lucide CDN.

## Architecture

```
/server
  ├── config/        # Database setup
  ├── middleware/    # JWT Auth & Zod Input Validation
  ├── models/        # 25 Core Mongoose Schemas (User, Account, Trade, Strategy, Playbook, Rule, etc.)
  ├── routes/        # REST API Routes (/api/auth, /api/trades, /api/analytics, etc.)
  ├── seed.js        # MongoDB Atlas demo data seeder script
  └── server.js      # Express server entry point
/public
  ├── css/style.css  # Hand-written dark SaaS trading dashboard design system
  ├── js/app.js      # Vanilla SPA Router, State Engine & Chart.js integration
  └── index.html     # SPA Shell with Modals & Command Palette (Ctrl+K)
```

## Quick Start & Setup Steps

### 1. Prerequisites

- Node.js (v18+ recommended)
- Active Internet Connection for MongoDB Atlas

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb+srv://ameyukeba175_db_user:7znYSrjPXEx639Qn@cluster0.s4fxl3w.mongodb.net/?appName=Cluster0
JWT_SECRET=super_jwt_secret_key_12345_mega_journal
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Seed Demo Data into MongoDB Atlas

Run the seed script to populate sample trades, accounts, strategies, playbooks, and rules:

```bash
npm run seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open your browser and navigate to:
👉 **http://localhost:3000**

## Key Features Included

- ⚡ **1-Click Instant Demo Mode**: Test the full platform instantly without registering.
- ⌨️ **Command Palette (`Ctrl+K`)**: Rapid quick-navigation keyboard shortcut across all 24 views.
- 📊 **Equity Growth Curve (Chart.js)**: Live net profit tracking with customizable metrics.
- 🗓️ **Calendar Heatmap**: Daily P&L and frequency heatmap visualization.
- 🧠 **AI Analyst 2.0**: Server-side trade coach with actionable advice.
- 🛑 **Risk Center & Prop Firm Compliance**: Max daily drawdown shields and lot size caps.
- 📥 **CSV/JSON Import & Export**: One-click bulk trade backup and import.
