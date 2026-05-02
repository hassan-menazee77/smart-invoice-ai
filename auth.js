/**
 * Smart Invoice AI - Authentication Module
 * Works offline (localStorage) with optional Supabase
 */

console.log('Loading auth.js...');

// Make Auth available globally IMMEDIATELY
const Auth = {
  supabaseAvailable: false,
  currentUser: null,

  async init() {
    console.log('Initializing Auth...');
    
    // Check if Supabase is available
    if (typeof supabase !== 'undefined' && typeof supabaseClient !== 'undefined') {
      this.supabaseAvailable = true;
      console.log('Supabase is available');
    } else {
      console.log('Using offline mode (localStorage)');
    }
    
    // Try to get user from localStorage
    const stored = localStorage.getItem('user');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      console.log('User loaded from storage:', this.currentUser?.email);
    }
  },

async login(email, password) {
    console.log('Login attempt:', email);
    
    // Try Supabase if available
    if (this.supabaseAvailable) {
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        if (data?.user) {
          this.currentUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.email.split('@')[0],
            plan: 'business'
          };
          localStorage.setItem('user', JSON.stringify(this.currentUser));
          return this.currentUser;
        }
      } catch (err) {
        throw new Error(err.message);
      }
    }
    
    // Fallback: check IndexedDB
    if (typeof DB !== 'undefined') {
      const users = await DB.getAll('users');
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        this.currentUser = user;
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      }
    }
    
    throw new Error('Invalid credentials');
  },

  async register(name, email, password, plan = 'free') {
    console.log('Register attempt:', name, email, plan);
    
    // Check if email already exists
    if (typeof DB !== 'undefined') {
      const users = await DB.getAll('users');
      if (users.some(u => u.email === email)) {
        throw new Error('Email already registered');
      }
    }

    const user = {
      id: Utils.uuid(),
      email,
      name,
      password, // In production, never store plain text passwords!
      plan,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
      createdAt: new Date().toISOString()
    };
    
    // Store in IndexedDB
    if (typeof DB !== 'undefined') {
      await DB.add('users', user);
    }
    
    // Set as current user
    delete user.password; // Don't store password in session
    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
    
    console.log('Registration successful');
    return user;
  },

  logout() {
    console.log('Logging out...');
    this.currentUser = null;
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  },

  getUser() {
    if (this.currentUser) return this.currentUser;
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  },

async getCompany() {
    const user = this.getUser();
    if (!user) return null;
    
    if (typeof DB === 'undefined') return null;
    
    let companies = await DB.getAll('companies');
    let company = companies.find(c => c.user_id === user.id || c.userId === user.id);
    
    // Auto-create company if none exists
    if (!company && user) {
      company = {
        id: Utils.uuid(),
        name: (user.name || 'My') + "'s Company",
        email: user.email,
        phone: '',
        address: '',
        taxId: '',
        logo: '',
        userId: user.id,
        createdAt: new Date().toISOString()
      };
      await DB.add('companies', company);
      console.log('Auto-created company:', company);
    }
    
    return company || null;
  },

getSettings() {
    return {
      currency: 'USD',
      timezone: 'UTC',
      language: 'en',
      darkMode: true,
      template: 'modern'
    };
  },

  async requireAuth() {
    const user = this.getUser();
    if (!user) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  setUser(user) {
    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Make Auth globally available immediately
window.Auth = Auth;
console.log('Auth object created and assigned to window.Auth');

// Standalone functions for compatibility
async function registerUser(email, password, name) {
  return Auth.register(name, email, password, 'free');
}

async function loginUser(email, password) {
  return Auth.login(email, password);
}

async function logoutUser() {
  Auth.logout();
}

async function getCurrentUser() {
  return Auth.getUser();
}

// Company functions
async function createCompany(companyData) {
  const user = Auth.getUser();
  if (!user) return null;
  
  const company = {
    ...companyData,
    user_id: user.id,
    created_at: new Date().toISOString()
  };
  
  const stored = localStorage.getItem('companies');
  const companies = stored ? JSON.parse(stored) : [];
  companies.push(company);
  localStorage.setItem('companies', JSON.stringify(companies));
  
  return company;
}

async function getMyCompany() {
  return Auth.getCompany();
}

// Client functions
async function createClient(clientData) {
  const client = {
    ...clientData,
    created_at: new Date().toISOString()
  };
  
  const stored = localStorage.getItem('clients');
  const clients = stored ? JSON.parse(stored) : [];
  clients.push(client);
  localStorage.setItem('clients', JSON.stringify(clients));
  
  return client;
}

async function getClients(companyId) {
  const stored = localStorage.getItem('clients');
  if (!stored) return [];
  const clients = JSON.parse(stored);
  return clients.filter(c => c.company_id === companyId);
}

// Invoice functions
async function createInvoice(invoiceData, items) {
  const invoice = {
    ...invoiceData,
    status: 'draft',
    total_paid: 0,
    created_at: new Date().toISOString()
  };
  
  const stored = localStorage.getItem('invoices');
  const invoices = stored ? JSON.parse(stored) : [];
  
  invoice.id = 'INV-' + Date.now();
  invoices.push(invoice);
  localStorage.setItem('invoices', JSON.stringify(invoices));
  
  // Store items
  if (items?.length) {
    const itemsStored = localStorage.getItem('invoice_items');
    const allItems = itemsStored ? JSON.parse(itemsStored) : [];
    items.forEach(item => {
      item.invoice_id = invoice.id;
      allItems.push(item);
    });
    localStorage.setItem('invoice_items', JSON.stringify(allItems));
  }
  
  return invoice;
}

async function getInvoices(companyId) {
  const stored = localStorage.getItem('invoices');
  if (!stored) return [];
  const invoices = JSON.parse(stored);
  return invoices.filter(i => i.company_id === companyId);
}

async function getInvoice(invoiceId) {
  const stored = localStorage.getItem('invoices');
  if (!stored) return null;
  const invoices = JSON.parse(stored);
  return invoices.find(i => i.id === invoiceId) || null;
}

async function updateInvoiceStatus(invoiceId, status) {
  const stored = localStorage.getItem('invoices');
  if (!stored) return;
  
  const invoices = JSON.parse(stored);
  const invoice = invoices.find(i => i.id === invoiceId);
  if (invoice) {
    invoice.status = status;
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }
}

// Payment functions
async function recordPayment(paymentData) {
  const payment = {
    ...paymentData,
    paid_at: new Date().toISOString()
  };
  
  const stored = localStorage.getItem('payments');
  const payments = stored ? JSON.parse(stored) : [];
  payments.push(payment);
  localStorage.setItem('payments', JSON.stringify(payments));
  
  return payment;
}

console.log('auth.js loaded successfully');
