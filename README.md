# Smart Invoice AI - SaaS Platform

A modern, AI-powered invoice generation and management platform built as a client-side web application. Designed to be easily migrated to a full-stack architecture.

## Features

### Core Features
- **AI-Powered Invoice Creation** - Natural language parsing, smart item suggestions, auto-calculation
- **Client Management (CRM-lite)** - Contact history, payment tracking, automated reminders
- **Professional Templates** - 8+ templates with custom branding support
- **Payment Integration** - Simulated Stripe, PayPal, and Razorpay checkout flows
- **Analytics & Reporting** - Revenue dashboards, tax reports, invoice aging
- **AI Assistant** - Invoice Coach, Follow-up Bot, Cash Flow Predictor, Expense Matcher

### Platform Features
- **Authentication** - Simulated JWT with role-based access (Admin, Accountant, Client)
- **Subscription Tiers** - Free, Pro ($19/mo), Business ($49/mo), Enterprise
- **Dark Mode** - Full dark mode support with system preference detection
- **RTL Support** - Arabic right-to-left language support built-in
- **Responsive Design** - Mobile-first, works on all devices
- **Offline-First** - IndexedDB persistence, works without internet

## Tech Stack

### Current (Client-Side)
- **HTML5** - Semantic markup
- **Tailwind CSS** - Utility-first styling via CDN
- **Vanilla JavaScript (ES6+)** - Modular architecture
- **IndexedDB** - Client-side database with Dexie.js-like wrapper
- **Chart.js** - Analytics visualizations
- **html2pdf.js** - PDF export functionality

### Migration Path (Full-Stack)
- **Frontend**: React/Next.js with Tailwind CSS
- **Backend**: Node.js/Express or Python/FastAPI
- **Database**: PostgreSQL (relational data), Redis (caching)
- **AI**: OpenAI GPT-4/Claude API integration
- **Auth**: JWT with refresh tokens
- **Payments**: Real Stripe/PayPal/Razorpay SDKs

## Project Structure

```
smart-invoice-ai/
├── index.html              # Landing page with pricing
├── login.html              # Authentication
├── dashboard.html          # Main dashboard with analytics
├── invoice-create.html     # AI-powered invoice creation
├── invoice-list.html       # Invoice management
├── invoice-view.html       # Client invoice portal
├── clients.html            # CRM client management
├── templates.html          # Template gallery
├── payments.html           # Payment tracking
├── analytics.html          # Reports and analytics
├── ai-assistant.html       # AI features
├── settings.html           # Company settings
├── css/
│   └── styles.css          # Global styles, animations, RTL
├── js/
│   ├── utils.js            # Utilities (currency, dates, validation)
│   ├── db.js               # IndexedDB wrapper with seed data
│   ├── auth.js             # Authentication simulation
│   ├── app.js              # App shell (sidebar, theme, toasts)
│   └── ai-engine.js        # AI features engine
└── README.md               # This file
```

## Database Schema

### IndexedDB Stores
- **users** - User accounts and profiles
- **companies** - Company profiles and branding
- **clients** - Client CRM data
- **invoices** - Invoice headers
- **invoiceItems** - Line items
- **payments** - Payment records
- **templates** - Template configurations
- **subscriptions** - Subscription plans
- **activities** - Activity log
- **settings** - User preferences

### PostgreSQL Migration Schema
```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  plan VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  tax_id VARCHAR(100),
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  client_id UUID REFERENCES clients(id),
  invoice_number VARCHAR(100) NOT NULL,
  issue_date DATE,
  due_date DATE,
  subtotal DECIMAL(10,2),
  tax DECIMAL(10,2),
  discount DECIMAL(10,2),
  total DECIMAL(10,2),
  total_paid DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Invoice Items
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id),
  description TEXT,
  quantity INTEGER,
  rate DECIMAL(10,2),
  amount DECIMAL(10,2)
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id),
  amount DECIMAL(10,2),
  method VARCHAR(50),
  status VARCHAR(50),
  transaction_id VARCHAR(255),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Getting Started

### Option 1: Direct Browser (Current)
1. Open `index.html` in any modern browser
2. No server required - works entirely client-side
3. Data persists in browser's IndexedDB

### Option 2: Local Server (Recommended)
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

### Option 3: Docker (Future)
```bash
docker-compose up -d
```

## Migration to Full-Stack

### Step 1: Backend API
Replace `js/db.js` API calls with REST endpoints:
```javascript
// Before (IndexedDB)
const invoices = await DB.query('invoices', 'companyId', companyId);

// After (REST API)
const response = await fetch(`/api/invoices?companyId=${companyId}`);
const invoices = await response.json();
```

### Step 2: Authentication
Replace `js/auth.js` with real JWT:
```javascript
// Before (localStorage)
const user = JSON.parse(localStorage.getItem('user'));

// After (JWT + HttpOnly cookies)
const response = await fetch('/api/auth/login', { method: 'POST', body: credentials });
const { token } = await response.json();
```

### Step 3: AI Integration
Replace `js/ai-engine.js` rule-based logic with OpenAI API:
```javascript
// Before (rule-based)
function parseInvoiceText(text) { /* ... */ }

// After (GPT-4)
const response = await fetch('/api/ai/parse-invoice', {
  method: 'POST',
  body: JSON.stringify({ text })
});
```

### Step 4: Real Payments
Replace simulated payments with Stripe/PayPal SDKs:
```javascript
// Stripe integration
const stripe = Stripe('pk_test_...');
const {paymentIntent} = await fetch('/api/payments/create-intent', {
  method: 'POST',
  body: JSON.stringify({ amount, currency })
});
```

## API Endpoints (Future)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id` - Get invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Clients
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `GET /api/clients/:id` - Get client
- `PUT /api/clients/:id` - Update client

### Payments
- `POST /api/payments` - Record payment
- `GET /api/payments` - List payments

### AI
- `POST /api/ai/parse-invoice` - NLP invoice parsing
- `POST /api/ai/pricing-suggestion` - Get pricing suggestions
- `POST /api/ai/follow-up` - Generate follow-up email
- `POST /api/ai/cashflow-prediction` - Predict cash flow

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/smart_invoice
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# AI
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...

# Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
RAZORPAY_KEY_ID=...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

## Deployment

### Vercel (Frontend)
```bash
npm i -g vercel
vercel --prod
```

### Railway/Render (Backend)
```bash
# Dockerfile included
docker build -t smart-invoice-api .
docker push registry.railway.app/smart-invoice-api
```

### AWS (Full Stack)
- **ECS/Fargate** - Container orchestration
- **RDS** - PostgreSQL database
- **ElastiCache** - Redis caching
- **S3** - File storage for logos/PDFs
- **CloudFront** - CDN

## Security Considerations

- All financial data encrypted at rest
- HTTPS required for production
- PCI DSS compliance for payment handling
- GDPR compliant data handling
- CSRF protection on all mutations
- Rate limiting on API endpoints
- Input validation and sanitization

## License

MIT License - See LICENSE file for details

## Support

For support, email support@smartinvoice.ai or open an issue on GitHub.
