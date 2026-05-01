/**
 * Smart Invoice AI - Authentication Module
 * Simulates JWT-based auth with role-based access control
 */

const Auth = {
  currentUser: null,
  token: null,

  async init() {
    const session = Utils.storage.get('session');
    if (session?.token && session?.user) {
      this.token = session.token;
      this.currentUser = session.user;
      return true;
    }
    return false;
  },

  async login(email, password) {
    const users = await DB.getAll('users');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) throw new Error('Invalid email or password');
    
    const token = this.generateToken(user);
    this.currentUser = { ...user, password: undefined };
    this.token = token;
    
    Utils.storage.set('session', { token, user: this.currentUser }, 60 * 24 * 7); // 7 days
    
    await DB.put('users', { ...user, lastLogin: new Date().toISOString() });
    return this.currentUser;
  },

  async register(name, email, password, plan = 'free') {
    const users = await DB.getAll('users');
    if (users.some(u => u.email === email)) {
      throw new Error('Email already registered');
    }

    const user = {
      id: Utils.uuid(),
      email,
      password,
      name,
      role: 'admin',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
      plan,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    await DB.add('users', user);
    
    const company = {
      id: Utils.uuid(),
      userId: user.id,
      name: `${name}'s Company`,
      slug: Utils.slugify(name),
      email,
      phone: '',
      website: '',
      address: '',
      logo: '',
      taxId: '',
      currency: 'USD',
      taxRate: 10,
      theme: { primary: '#6366f1', font: 'Inter' },
      createdAt: new Date().toISOString()
    };
    await DB.add('companies', company);

    const token = this.generateToken(user);
    this.currentUser = { ...user, password: undefined };
    this.token = token;
    
    Utils.storage.set('session', { token, user: this.currentUser }, 60 * 24 * 7);
    return this.currentUser;
  },

  logout() {
    this.currentUser = null;
    this.token = null;
    Utils.storage.remove('session');
    window.location.href = 'login.html';
  },

  generateToken(user) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
      iat: Date.now(),
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000
    }));
    const signature = btoa(`${header}.${payload}.secret`);
    return `${header}.${payload}.${signature}`;
  },

  isAuthenticated() {
    return !!this.currentUser && !!this.token;
  },

  hasRole(role) {
    return this.currentUser?.role === role || this.currentUser?.role === 'admin';
  },

  hasPlan(requiredPlan) {
    const plans = { free: 0, pro: 1, business: 2, enterprise: 3 };
    return plans[this.currentUser?.plan] >= plans[requiredPlan];
  },

  canCreateInvoice() {
    if (!this.isAuthenticated()) return false;
    if (this.hasPlan('business')) return true;
    
    const planLimits = { free: 5, pro: Infinity, business: Infinity };
    // This would check actual count in production
    return true;
  },

  getUser() {
    return this.currentUser;
  },

  requireAuth() {
    // Check localStorage directly to avoid race condition with init()
    const session = Utils.storage.get('session');
    if (session?.token && session?.user) {
      this.token = session.token;
      this.currentUser = session.user;
      return true;
    }
    window.location.href = 'login.html';
    return false;
  },



  async getCompany() {
    if (!this.currentUser) return null;
    const companies = await DB.query('companies', 'userId', this.currentUser.id);
    return companies[0] || null;
  },

  async getSettings() {
    const company = await this.getCompany();
    if (!company) return null;
    const settings = await DB.query('settings', 'companyId', company.id);
    return settings[0] || null;
  }
};
