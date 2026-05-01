/**
 * Smart Invoice AI - IndexedDB Database Layer
 * Simulates PostgreSQL backend with client-side persistence
 */

const DB = {
  name: 'SmartInvoiceAI',
  version: 1,
  db: null,

  stores: {
    users: { keyPath: 'id', indexes: ['email', 'role'] },
    companies: { keyPath: 'id', indexes: ['userId', 'slug'] },
    clients: { keyPath: 'id', indexes: ['companyId', 'email', 'status'] },
    invoices: { keyPath: 'id', indexes: ['companyId', 'clientId', 'status', 'dueDate', 'invoiceNumber'] },
    invoiceItems: { keyPath: 'id', indexes: ['invoiceId'] },
    payments: { keyPath: 'id', indexes: ['invoiceId', 'status', 'method'] },
    templates: { keyPath: 'id', indexes: ['category', 'isDefault'] },
    subscriptions: { keyPath: 'id', indexes: ['userId', 'status'] },
    activities: { keyPath: 'id', indexes: ['companyId', 'type', 'createdAt'] },
    settings: { keyPath: 'id', indexes: ['companyId'] }
  },

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.name, this.version);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => { this.db = request.result; resolve(this.db); };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        Object.entries(this.stores).forEach(([storeName, config]) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: config.keyPath });
            config.indexes.forEach(index => store.createIndex(index, index, { unique: false }));
          }
        });
      };
    });
  },

  async add(store, data) {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(store, 'readwrite');
      const st = tx.objectStore(store);
      const request = st.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async put(store, data) {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(store, 'readwrite');
      const st = tx.objectStore(store);
      const request = st.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async get(store, id) {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(store, 'readonly');
      const st = tx.objectStore(store);
      const request = st.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getAll(store) {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(store, 'readonly');
      const st = tx.objectStore(store);
      const request = st.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  async delete(store, id) {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(store, 'readwrite');
      const st = tx.objectStore(store);
      const request = st.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async query(store, indexName, value) {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(store, 'readonly');
      const st = tx.objectStore(store);
      const index = st.index(indexName);
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  async clear(store) {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(store, 'readwrite');
      const st = tx.objectStore(store);
      const request = st.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async ensureInit() {
    if (!this.db) await this.init();
  },

  async seed() {
    const count = await this.getAll('users');
    if (count.length > 0) return;

    const now = new Date().toISOString();
    const companyId = Utils.uuid();
    const userId = Utils.uuid();

    await this.add('users', {
      id: userId, email: 'demo@smartinvoice.ai', password: 'demo123',
      name: 'Demo User', role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=6366f1&color=fff',
      plan: 'business', createdAt: now, lastLogin: now
    });

    await this.add('companies', {
      id: companyId, userId, name: 'Acme Design Studio', slug: 'acme-design',
      email: 'hello@acmedesign.com', phone: '+1 (555) 123-4567',
      website: 'https://acmedesign.com', address: '123 Creative Ave, San Francisco, CA 94102',
      logo: '', taxId: '12-3456789', currency: 'USD', taxRate: 10,
      theme: { primary: '#6366f1', font: 'Inter' }, createdAt: now
    });

    const clients = [
      { id: Utils.uuid(), companyId, name: 'TechCorp Inc', email: 'billing@techcorp.com', phone: '+1 (555) 987-6543', address: '456 Innovation Dr, Austin, TX 78701', status: 'active', totalInvoiced: 15000, totalPaid: 12000, createdAt: now },
      { id: Utils.uuid(), companyId, name: 'GreenLeaf Solutions', email: 'accounts@greenleaf.io', phone: '+1 (555) 456-7890', address: '789 Eco Blvd, Portland, OR 97201', status: 'active', totalInvoiced: 8500, totalPaid: 8500, createdAt: now },
      { id: Utils.uuid(), companyId, name: 'Metro Retail Group', email: 'finance@metrorg.com', phone: '+1 (555) 234-5678', address: '321 Commerce St, Chicago, IL 60601', status: 'active', totalInvoiced: 22000, totalPaid: 15000, createdAt: now },
      { id: Utils.uuid(), companyId, name: 'StartupXYZ', email: 'founders@startupxyz.com', phone: '+1 (555) 876-5432', address: '654 Startup Lane, Miami, FL 33101', status: 'inactive', totalInvoiced: 3000, totalPaid: 1000, createdAt: now }
    ];
    for (const c of clients) await this.add('clients', c);

    const invoices = [
      { id: Utils.uuid(), companyId, clientId: clients[0].id, invoiceNumber: 'INV-2024-1001', status: 'paid', issueDate: '2024-01-15', dueDate: '2024-02-15', subtotal: 5000, tax: 500, discount: 0, total: 5500, notes: 'Website redesign project', template: 'modern', createdAt: now },
      { id: Utils.uuid(), companyId, clientId: clients[1].id, invoiceNumber: 'INV-2024-1002', status: 'paid', issueDate: '2024-02-01', dueDate: '2024-03-01', subtotal: 3500, tax: 350, discount: 0, total: 3850, notes: 'Brand identity package', template: 'minimal', createdAt: now },
      { id: Utils.uuid(), companyId, clientId: clients[2].id, invoiceNumber: 'INV-2024-1003', status: 'pending', issueDate: '2024-02-20', dueDate: '2024-03-22', subtotal: 8000, tax: 800, discount: 400, total: 8400, notes: 'E-commerce platform development', template: 'professional', createdAt: now },
      { id: Utils.uuid(), companyId, clientId: clients[0].id, invoiceNumber: 'INV-2024-1004', status: 'overdue', issueDate: '2024-01-01', dueDate: '2024-01-31', subtotal: 10000, tax: 1000, discount: 0, total: 11000, notes: 'Mobile app development - Phase 1', template: 'modern', createdAt: now },
      { id: Utils.uuid(), companyId, clientId: clients[3].id, invoiceNumber: 'INV-2024-1005', status: 'draft', issueDate: '2024-03-01', dueDate: '2024-04-01', subtotal: 2000, tax: 200, discount: 0, total: 2200, notes: 'Consulting services', template: 'creative', createdAt: now }
    ];
    for (const inv of invoices) await this.add('invoices', inv);

    const items = [
      { id: Utils.uuid(), invoiceId: invoices[0].id, description: 'Homepage redesign', quantity: 1, rate: 2000, amount: 2000 },
      { id: Utils.uuid(), invoiceId: invoices[0].id, description: 'About page design', quantity: 1, rate: 1500, amount: 1500 },
      { id: Utils.uuid(), invoiceId: invoices[0].id, description: 'Contact page + forms', quantity: 1, rate: 1500, amount: 1500 },
      { id: Utils.uuid(), invoiceId: invoices[1].id, description: 'Logo design', quantity: 1, rate: 1500, amount: 1500 },
      { id: Utils.uuid(), invoiceId: invoices[1].id, description: 'Brand guidelines', quantity: 1, rate: 1000, amount: 1000 },
      { id: Utils.uuid(), invoiceId: invoices[1].id, description: 'Business cards', quantity: 100, rate: 10, amount: 1000 },
      { id: Utils.uuid(), invoiceId: invoices[2].id, description: 'Frontend development', quantity: 80, rate: 60, amount: 4800 },
      { id: Utils.uuid(), invoiceId: invoices[2].id, description: 'Backend API', quantity: 40, rate: 80, amount: 3200 },
      { id: Utils.uuid(), invoiceId: invoices[3].id, description: 'iOS app development', quantity: 120, rate: 75, amount: 9000 },
      { id: Utils.uuid(), invoiceId: invoices[3].id, description: 'App Store deployment', quantity: 1, rate: 1000, amount: 1000 },
      { id: Utils.uuid(), invoiceId: invoices[4].id, description: 'Strategy session', quantity: 4, rate: 500, amount: 2000 }
    ];
    for (const item of items) await this.add('invoiceItems', item);

    const payments = [
      { id: Utils.uuid(), invoiceId: invoices[0].id, amount: 5500, method: 'stripe', status: 'completed', transactionId: 'pi_' + Utils.shortId(), paidAt: '2024-01-20T10:30:00Z', createdAt: now },
      { id: Utils.uuid(), invoiceId: invoices[1].id, amount: 3850, method: 'paypal', status: 'completed', transactionId: 'PAY-' + Utils.shortId(), paidAt: '2024-02-15T14:22:00Z', createdAt: now },
      { id: Utils.uuid(), invoiceId: invoices[2].id, amount: 4200, method: 'stripe', status: 'completed', transactionId: 'pi_' + Utils.shortId(), paidAt: '2024-03-01T09:15:00Z', createdAt: now },
      { id: Utils.uuid(), invoiceId: invoices[2].id, amount: 4200, method: 'stripe', status: 'pending', transactionId: 'pi_' + Utils.shortId(), paidAt: null, createdAt: now }
    ];
    for (const p of payments) await this.add('payments', p);

    const templates = [
      { id: 'modern', name: 'Modern', category: 'professional', isDefault: true, description: 'Clean and contemporary design', colors: { primary: '#6366f1', secondary: '#8b5cf6', text: '#1f2937' } },
      { id: 'minimal', name: 'Minimal', category: 'professional', isDefault: false, description: 'Simple and elegant', colors: { primary: '#000000', secondary: '#666666', text: '#333333' } },
      { id: 'professional', name: 'Professional', category: 'business', isDefault: false, description: 'Traditional business style', colors: { primary: '#1e40af', secondary: '#3b82f6', text: '#1e293b' } },
      { id: 'creative', name: 'Creative', category: 'creative', isDefault: false, description: 'Bold and artistic', colors: { primary: '#ec4899', secondary: '#f472b6', text: '#831843' } },
      { id: 'elegant', name: 'Elegant', category: 'premium', isDefault: false, description: 'Luxury and sophistication', colors: { primary: '#b45309', secondary: '#d97706', text: '#451a03' } },
      { id: 'tech', name: 'Tech', category: 'technology', isDefault: false, description: 'Modern tech aesthetic', colors: { primary: '#06b6d4', secondary: '#22d3ee', text: '#164e63' } },
      { id: 'nature', name: 'Nature', category: 'lifestyle', isDefault: false, description: 'Organic and fresh', colors: { primary: '#10b981', secondary: '#34d399', text: '#064e3b' } },
      { id: 'bold', name: 'Bold', category: 'creative', isDefault: false, description: 'High contrast impact', colors: { primary: '#ef4444', secondary: '#f87171', text: '#7f1d1d' } }
    ];
    for (const t of templates) await this.add('templates', t);

    await this.add('subscriptions', {
      id: Utils.uuid(), userId, plan: 'business', status: 'active', price: 49,
      interval: 'month', features: ['unlimited_invoices', 'ai_features', 'custom_branding', 'team_collaboration', 'api_access', 'advanced_analytics'],
      currentPeriodStart: now, currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), createdAt: now
    });

    const activities = [
      { id: Utils.uuid(), companyId, type: 'invoice_created', title: 'New invoice created', description: 'Invoice #INV-2024-1005 for StartupXYZ', metadata: { invoiceId: invoices[4].id }, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { id: Utils.uuid(), companyId, type: 'payment_received', title: 'Payment received', description: '$4,200 from Metro Retail Group', metadata: { paymentId: payments[2].id }, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { id: Utils.uuid(), companyId, type: 'invoice_overdue', title: 'Invoice overdue', description: 'Invoice #INV-2024-1004 is 30 days overdue', metadata: { invoiceId: invoices[3].id }, createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
      { id: Utils.uuid(), companyId, type: 'client_added', title: 'New client added', description: 'Metro Retail Group added to clients', metadata: { clientId: clients[2].id }, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      { id: Utils.uuid(), companyId, type: 'template_changed', title: 'Template updated', description: 'Switched to Modern template', metadata: {}, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }
    ];
    for (const a of activities) await this.add('activities', a);

    await this.add('settings', {
      id: Utils.uuid(), companyId, language: 'en', timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY', currency: 'USD', taxRate: 10,
      autoReminders: true, reminderDays: [7, 3, 1],
      emailNotifications: true, darkMode: false, rtl: false, createdAt: now
    });
  },

  async getDashboardStats(companyId) {
    const invoices = await this.query('invoices', 'companyId', companyId);
    const allPayments = await this.getAll('payments');
    const clients = await this.query('clients', 'companyId', companyId);
    
    const paid = invoices.filter(i => i.status === 'paid');
    const pending = invoices.filter(i => i.status === 'pending');
    const overdue = invoices.filter(i => i.status === 'overdue');
    
    const totalRevenue = paid.reduce((sum, i) => sum + i.total, 0);
    const outstanding = pending.reduce((sum, i) => sum + i.total, 0) + overdue.reduce((sum, i) => sum + i.total, 0);
    const overdueAmount = overdue.reduce((sum, i) => sum + i.total, 0);
    
    return {
      totalInvoices: invoices.length, totalRevenue, outstanding, overdueAmount,
      paidCount: paid.length, pendingCount: pending.length, overdueCount: overdue.length,
      clientCount: clients.length,
      collectionRate: totalRevenue > 0 ? Math.round((totalRevenue / (totalRevenue + outstanding)) * 100) : 0
    };
  },

  async getRevenueData(companyId, months = 6) {
    const invoices = await this.query('invoices', 'companyId', companyId);
    const payments = await this.getAll('payments');
    const data = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      const monthInvoices = invoices.filter(inv => inv.issueDate.startsWith(monthKey));
      const monthPayments = payments.filter(p => p.paidAt?.startsWith(monthKey) && p.status === 'completed');
      
      data.push({
        month: monthName,
        invoiced: monthInvoices.reduce((sum, inv) => sum + inv.total, 0),
        paid: monthPayments.reduce((sum, p) => sum + p.amount, 0),
        count: monthInvoices.length
      });
    }
    return data;
  },

  async getClientWithHistory(clientId) {
    const client = await this.get('clients', clientId);
    if (!client) return null;
    const invoices = await this.query('invoices', 'clientId', clientId);
    const allPayments = await this.getAll('payments');
    const payments = allPayments.filter(p => invoices.some(i => i.id === p.invoiceId));
    return {
      ...client, invoices: invoices.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate)),
      payments: payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      totalInvoiced: invoices.reduce((sum, i) => sum + i.total, 0),
      totalPaid: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
    };
  },

  async getInvoiceFull(invoiceId) {
    const invoice = await this.get('invoices', invoiceId);
    if (!invoice) return null;
    const items = await this.query('invoiceItems', 'invoiceId', invoiceId);
    const payments = await this.query('payments', 'invoiceId', invoiceId);
    const client = await this.get('clients', invoice.clientId);
    const company = await this.get('companies', invoice.companyId);
    const totalPaid = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
    return { ...invoice, items, payments, client, company, totalPaid, balance: invoice.total - totalPaid };
  },

  async reset() {
    this.db?.close();
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.name);
      request.onsuccess = resolve;
      request.onerror = reject;
    });
    this.db = null;
    await this.init();
    await this.seed();
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  try { await DB.init(); await DB.seed(); console.log('DB ready'); }
  catch (err) { console.error('DB init failed:', err); }
});
