# Smart Invoice AI - SaaS Platform Documentation

## Overview

Smart Invoice AI is a modern, AI-powered invoice management SaaS platform built entirely with client-side technologies. It uses CDN libraries for styling and functionality, making it easy to deploy without a complex build process.

## Quick Start

### Option 1: Open Directly in Browser (Recommended)

1. Navigate to the `smart-invoice-ai/` folder
2. Open `index.html` in any modern web browser
3. The application will load all dependencies from CDN

### Option 2: Simple HTTP Server

If you want to serve the files locally:

```bash
# Python 3
python -m http.server 8000

# Then open http://localhost:8000
```

## Technical Stack

### Current (Client-Side Only)

- **Styling**: Tailwind CSS via CDN (https://cdn.tailwindcss.com)
- **Icons**: Font Awesome via CDN (https://cdnjs.cloudflare.com)
- **Charts**: Chart.js via CDN (https://cdn.jsdelivr.net/npm/chart.js)
- **PDF**: html2pdf.js via CDN (https://cdnjs.cloudflare.com)
- **Auth/DB**: Supabase JS SDK via CDN (https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2)
- **Database**: IndexedDB (browser local storage)
- **Fonts**: Google Fonts (Inter)

### Migration Path (Full-Stack)

When you're ready to go full-stack:

- **Backend**: Node.js/Express or Python/FastAPI
- **Database**: PostgreSQL (Supabase provides this)
- **Auth**: Supabase Auth (already configured)
- **AI**: OpenAI GPT-4 or Claude API

## Project Structure

```
smart-invoice-ai/
├── index.html              # Landing page (marketing)
├── login.html            # Authentication (login/register)
├── dashboard.html        # Main dashboard with analytics
├── invoice-create.html  # AI-powered invoice creation
├── invoice-list.html   # Manage invoices
├── invoice-view.html  # Client portal view
├── clients.html        # CRM-lite client management
├── templates.html      # Template gallery (10+ templates)
├── payments.html      # Payment tracking & integration
├── analytics.html     # Revenue reports & charts
├── ai-assistant.html  # AI Coach, Follow-up Bot, Predictor
├── settings.html     # Company settings & branding
├── css/
│   └── styles.css   # Custom animations & RTL support
├── js/
│   ├── app.js      # Main app initialization & routing
│   ├── auth.js    # Authentication (local + Supabase)
│   ├── db.js      # IndexedDB wrapper (data layer)
│   ├── ai-engine.js  # NLP parser & AI features
│   ├── utils.js   # Utilities (currency, dates, etc.)
│   └── supabase-client.js  # Supabase integration
└── README.md      # This file
```

## Features

### Implemented

✅ **AI Invoice Creation**
- Natural language to invoice ("Invoice ABC Corp $500 due 30 days" → structured invoice)
- Smart item suggestions based on industry
- Auto-calculate taxes, discounts, totals
- Multi-currency support

✅ **Client Management**
- CRM-lite with contact history
- Payment tracking
- Automated reminder scheduler

✅ **Templates**
- 10+ professional templates (Modern, Minimal, Professional, Creative, Elegant, Tech, Nature, Bold)
- Custom branding (logo, colors, fonts)
- PDF/Excel export

✅ **Payment Integration**
- Simulated Stripe/PayPal/Razorpay checkout
- Partial payment tracking
- Automatic receipt generation

✅ **Analytics**
- Revenue dashboards with Chart.js
- Overdue tracking
- Tax reports
- CSV export

✅ **AI Assistant**
- "Invoice Coach" for pricing suggestions
- "Follow-up Bot" for email templates
- "Cash Flow Predictor" for trends

✅ **Authentication**
- Local storage authentication (works offline)
- Supabase Auth ready (set `USE_SUPABASE = true`)

✅ **Monetization**
- Free (5 invoices/month)
- Pro ($19/month) - AI features
- Business ($49/month) - Team & API
- Enterprise - White-label

✅ **Design**
- Dark mode support
- Mobile-first responsive
- Arabic RTL support
- Smooth animations

## Configuration

### Connecting to Supabase (Optional)

1. Create a project at https://supabase.com
2. Get your URL and anon key from Settings → API
3. Update `js/supabase-client.js`:

```javascript
const SUPABASE_CONFIG = {
  url: 'https://your-project.supabase.co',
  authToken: 'your-anon-key'
};
```

4. Enable Supabase in `js/auth.js`:

```javascript
const USE_SUPABASE = true;
```

### Database Schema (For Supabase/PostgreSQL)

Run this SQL in Supabase SQL Editor:

```sql
-- Users table
create table users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  role text default 'admin',
  plan text default 'free',
  created_at timestamp with time zone default now()
);

-- Companies table
create table companies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id),
  name text not null,
  slug text unique,
  email text,
  phone text,
  address text,
  logo text,
  currency text default 'USD',
  tax_rate numeric default 10,
  theme jsonb,
  created_at timestamp with time zone default now()
);

-- Clients table
create table clients (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references companies(id),
  name text not null,
  email text,
  phone text,
  address text,
  status text default 'active',
  total_invoiced numeric default 0,
  total_paid numeric default 0,
  created_at timestamp with time zone default now()
);

-- Invoices table
create table invoices (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references companies(id),
  client_id uuid references clients(id),
  invoice_number text unique,
  status text default 'draft',
  issue_date date,
  due_date date,
  subtotal numeric,
  tax numeric default 0,
  discount numeric default 0,
  total numeric,
  notes text,
  template text,
  created_at timestamp with time zone default now()
);

-- Invoice Items table
create table invoice_items (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references invoices(id),
  description text,
  quantity numeric,
  rate numeric,
  amount numeric
);

-- Payments table
create table payments (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references invoices(id),
  amount numeric,
  method text,
  status text default 'pending',
  transaction_id text,
  paid_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Enable RLS and create policies for security
```

## Usage

### Creating Your First Invoice

1. Open `login.html`
2. Use demo credentials (demo@smartinvoice.ai / demo123) OR click "Create one" to register
3. Navigate to "Create Invoice"
4. Try the AI feature: "Invoice [Client Name] for [service] $[amount] due in [days] days"
5. Add line items, set tax rate, choose template
6. Preview, then "Send" or "Save as Draft"

### Managing Clients

1. Go to "Clients" in the navigation
2. View client list with payment history
3. Click a client to see all their invoices and payments
4. Add new clients with the "+" button

### Viewing Analytics

1. Go to "Analytics" tab
2. See revenue trends over time
3. Filter by date range
4. Export reports to CSV

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Security Notes

- Use HTTPS in production
- Enable RLS policies in Supabase
- Implement rate limiting
- Add CAPTCHA for registration
- Enable 2FA for admin accounts

## Troubleshooting

### Issue: "Supabase not initialized"

**Solution**: Ensure the Supabase CDN script loads before your custom scripts. The scripts are loaded in order:

```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase-client.js"></script>
```

### Issue: IndexedDB not working in private mode

**Solution**: This is expected. Use Supabase for full functionality or allow cookies in private browsing.

### Issue: PDF export not working

**Solution**: Ensure your browser allows popups and downloads from the file:// origin.

## Migration Checklist

When moving to full-stack:

- [ ] Set up Node.js/Express or Python/FastAPI backend
- [ ] Configure Supabase with production keys
- [ ] Enable RLS policies
- [ ] Set up authentication with 2FA
- [ ] Implement rate limiting
- [ ] Add webhook handlers for payment providers
- [ ] Set up email sending (SendGrid/Postmark)
- [ ] Configure CDN for static assets
- [ ] Set up backup strategy

## License

MIT License - Feel free to use for your own projects!

## Credits

- UI inspired by Notion, Stripe, Linear
- Icons by Font Awesome
- Charts by Chart.js
- PDF generation by html2pdf.js
- Auth & Database by Supabase
