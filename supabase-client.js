/**
 * Supabase Client Configuration
 * Smart Invoice AI - Backend Integration
 * 
 * To connect to your Supabase project:
 * 1. Create a project at supabase.com
 * 2. Get your URL and anon key from Settings → API
 * 3. Replace the values below
 */

// Configuration - Replace with your Supabase credentials
const SUPABASE_URL = 'https://jiduxcxivrzdzpnxmnfm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DRQ6AZcqtnXTG-ViXf_gOw_kopvJFdn';

const SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_KEY
};

// Global Supabase client instance
let supabaseClient = null;
let supabaseReady = false;

// Initialize Supabase client using global supabase from CDN
async function initSupabase() {
  // Wait for supabase global to be available
  if (typeof window.supabase === 'undefined') {
    console.warn('⏳ Waiting for Supabase library...');
    
    // Retry after a short delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (typeof window.supabase === 'undefined') {
      console.warn('⚠️ Supabase not available - using local storage fallback');
      return null;
    }
  }
  
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    
    // Test the connection
    const { data, error } = await supabaseClient.from('_ping').select('*').limit(1).catch(() => ({ data: null, error: null }));
    
    supabaseReady = true;
    console.log('✅ Supabase client connected!');
    return supabaseClient;
  } catch (error) {
    console.warn('⚠️ Supabase connection failed, using local storage:', error.message);
    return null;
  }
}

// Load Supabase from CDN
function loadSupabaseCDN() {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.onload = () => {
    if (SUPABASE_CONFIG.url.includes('your-project')) {
      console.warn('Please configure your Supabase credentials in supabase-client.js');
    }
  };
  document.head.appendChild(script);
}

// Get Supabase client
function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = initSupabase();
  }
  return supabaseClient;
}

// Authentication functions
const Auth = {
  // Sign in with email and password
  async signIn(email, password) {
    const client = getSupabase();
    if (!client) return { error: { message: 'Supabase not initialized' } };
    
    const { data, error } = await client.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    return { data, error };
  },
  
  // Sign up new user
  async signUp(email, password) {
    const client = getSupabase();
    if (!client) return { error: { message: 'Supabase not initialized' } };
    
    const { data, error } = await client.auth.signUp({
      email: email,
      password: password
    });
    
    return { data, error };
  },
  
  // Sign out
  async signOut() {
    const client = getSupabase();
    if (!client) return { error: { message: 'Supabase not initialized' } };
    
    const { error } = await client.auth.signOut();
    return { error };
  },
  
  // Get current user
  async getUser() {
    const client = getSupabase();
    if (!client) return { data: { user: null }, error: { message: 'Supabase not initialized' } };
    
    const { data, error } = await client.auth.getUser();
    return { data, error };
  },
  
  // Get session
  async getSession() {
    const client = getSupabase();
    if (!client) return { data: { session: null }, error: { message: 'Supabase not initialized' } };
    
    const { data, error } = await client.auth.getSession();
    return { data, error };
  }
};

// Database operations
const DB = {
  // Fetch invoices for current user
  async getInvoices() {
    const client = getSupabase();
    if (!client) return { data: [], error: { message: 'Supabase not initialized' } };
    
    const { data: { user } } = await client.auth.getUser();
    if (!user) return { data: [], error: { message: 'Not authenticated' } };
    
    const { data, error } = await client
      .from('invoices')
      .select('*, clients(name, email)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    return { data: data || [], error };
  },
  
  // Fetch invoices for company
  async getCompanyInvoices(companyId) {
    const client = getSupabase();
    if (!client) return { data: [], error: { message: 'Supabase not initialized' } };
    
    const { data, error } = await client
      .from('invoices')
      .select('*, clients(name, email)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    return { data: data || [], error };
  },
  
  // Fetch clients for company
  async getClients(companyId) {
    const client = getSupabase();
    if (!client) return { data: [], error: { message: 'Supabase not initialized' } };
    
    const { data, error } = await client
      .from('clients')
      .select('*')
      .eq('company_id', companyId)
      .order('name');
    
    return { data: data || [], error };
  },
  
  // Add new invoice
  async addInvoice(invoice) {
    const client = getSupabase();
    if (!client) return { error: { message: 'Supabase not initialized' } };
    
    const { data, error } = await client
      .from('invoices')
      .insert([invoice])
      .select();
    
    return { data, error };
  },
  
  // Add new client
  async addClient(clientData) {
    const client = getSupabase();
    if (!client) return { error: { message: 'Supabase not initialized' } };
    
    const { data, error } = await client
      .from('clients')
      .insert([clientData])
      .select();
    
    return { data, error };
  },
  
  // Update invoice
  async updateInvoice(id, updates) {
    const client = getSupabase();
    if (!client) return { error: { message: 'Supabase not initialized' } };
    
    const { data, error } = await client
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select();
    
    return { data, error };
  },
  
  // Delete invoice
  async deleteInvoice(id) {
    const client = getSupabase();
    if (!client) return { error: { message: 'Supabase not initialized' } };
    
    const { error } = await client
      .from('invoices')
      .delete()
      .eq('id', id);
    
    return { error };
  },
  
  // Add payment
  async addPayment(payment) {
    const client = getSupabase();
    if (!client) return { error: { message: 'Supabase not initialized' } };
    
    const { data, error } = await client
      .from('payments')
      .insert([payment])
      .select();
    
    return { data, error };
  },
  
  // Get payments for invoice
  async getPayments(invoiceId) {
    const client = getSupabase();
    if (!client) return { data: [], error: { message: 'Supabase not initialized' } };
    
    const { data, error } = await client
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false });
    
    return { data: data || [], error };
  }
};

// Real-time subscriptions
const Realtime = {
  // Subscribe to invoice changes
  subscribeToInvoices(callback) {
    const client = getSupabase();
    if (!client) return null;
    
    return client
      .channel('invoices')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, callback)
      .subscribe();
  },
  
  // Subscribe to client changes
  subscribeToClients(callback) {
    const client = getSupabase();
    if (!client) return null;
    
    return client
      .channel('clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, callback)
      .subscribe();
  }
};

// Auto-initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSupabase);
} else {
  initSupabase();
}

// Export for use in other files
window.SmartInvoiceDB = { Auth, DB, Realtime, getSupabase };
