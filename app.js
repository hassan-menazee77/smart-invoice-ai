/**
 * Smart Invoice AI - Main Application Module
 */

const App = {
  sidebarOpen: false,
  currentPage: '',
  
  async init() {
    // Initialize auth
    await Auth.init();
    
    // Setup theme
    this.setupTheme();
    
    // Setup navigation
    this.setupNavigation();
    
    // Setup sidebar
    this.setupSidebar();
    
    // Setup toasts
    this.setupToasts();
    
    // Setup modals
    this.setupModals();
    
    // Setup RTL
    this.setupRTL();
    
    // Update UI based on auth
    this.updateAuthUI();
    
    // Mark current nav item
    this.highlightCurrentPage();
  },

  setupTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
    
    document.getElementById('themeToggle')?.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const isDark = document.documentElement.classList.contains('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      
      const icon = document.getElementById('themeIcon');
      if (icon) {
        icon.className = isDark ? 'fas fa-sun text-yellow-400' : 'fas fa-moon text-gray-500';
      }
    });
    
    // Set initial icon
    const icon = document.getElementById('themeIcon');
    if (icon) {
      const isDark = document.documentElement.classList.contains('dark');
      icon.className = isDark ? 'fas fa-sun text-yellow-400' : 'fas fa-moon text-gray-500';
    }
  },

  setupNavigation() {
    // Mobile menu toggle
    document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
      this.toggleSidebar();
    });
    
    // User menu dropdown
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenu = document.getElementById('userMenu');
    
    userMenuBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenu?.classList.toggle('hidden');
    });
    
    document.addEventListener('click', () => {
      userMenu?.classList.add('hidden');
    });
    
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      Auth.logout();
    });
  },

  setupSidebar() {
    const backdrop = document.getElementById('sidebarBackdrop');
    backdrop?.addEventListener('click', () => this.toggleSidebar(false));
    
    // Close sidebar on nav link click (mobile)
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 1024) this.toggleSidebar(false);
      });
    });
  },

  toggleSidebar(force) {
    this.sidebarOpen = force !== undefined ? force : !this.sidebarOpen;
    document.getElementById('sidebar')?.classList.toggle('open', this.sidebarOpen);
    document.getElementById('sidebarBackdrop')?.classList.toggle('active', this.sidebarOpen);
  },

  setupToasts() {
    if (!document.getElementById('toastContainer')) {
      const container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
  },

  toast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const icons = {
      success: 'fa-check-circle text-green-500',
      error: 'fa-exclamation-circle text-red-500',
      info: 'fa-info-circle text-blue-500',
      warning: 'fa-exclamation-triangle text-yellow-500'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fas ${icons[type]} text-xl"></i>
      <span class="text-sm font-medium text-gray-800 dark:text-gray-200">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  setupModals() {
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });
    
    document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'modalOverlay') this.closeModal();
    });
  },

  openModal(content, title = '') {
    const overlay = document.getElementById('modalOverlay');
    const titleEl = document.getElementById('modalTitle');
    const bodyEl = document.getElementById('modalBody');
    
    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = content;
    if (overlay) overlay.classList.add('active');
  },

  closeModal() {
    document.getElementById('modalOverlay')?.classList.remove('active');
  },

  setupRTL() {
    const rtl = localStorage.getItem('rtl') === 'true';
    if (rtl) document.documentElement.dir = 'rtl';
  },

  toggleRTL() {
    const isRTL = document.documentElement.dir === 'rtl';
    document.documentElement.dir = isRTL ? 'ltr' : 'rtl';
    localStorage.setItem('rtl', !isRTL);
  },

  async updateAuthUI() {
    const user = Auth.getUser();
    const authElements = document.querySelectorAll('[data-auth]');
    const guestElements = document.querySelectorAll('[data-guest]');
    
    if (user) {
      authElements.forEach(el => el.classList.remove('hidden'));
      guestElements.forEach(el => el.classList.add('hidden'));
      
      // Update user info
      const nameEl = document.getElementById('userName');
      const emailEl = document.getElementById('userEmail');
      const avatarEl = document.getElementById('userAvatar');
      const planEl = document.getElementById('userPlan');
      
      if (nameEl) nameEl.textContent = user.name;
      if (emailEl) emailEl.textContent = user.email;
      if (avatarEl) avatarEl.src = user.avatar;
      if (planEl) {
        planEl.textContent = Utils.capitalize(user.plan);
        planEl.className = `text-xs font-medium px-2 py-0.5 rounded-full ${
          user.plan === 'business' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
          user.plan === 'pro' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
        }`;
      }
    } else {
      authElements.forEach(el => el.classList.add('hidden'));
      guestElements.forEach(el => el.classList.remove('hidden'));
    }
  },

  highlightCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '') || 'index';
    this.currentPage = page;
    
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
      const href = link.getAttribute('href')?.replace('.html', '') || '';
      if (href === page || (page === 'index' && href === 'dashboard')) {
        link.classList.add('bg-indigo-50', 'text-indigo-600', 'dark:bg-indigo-900/20', 'dark:text-indigo-400');
        link.classList.remove('text-gray-600', 'dark:text-gray-400');
      }
    });
  },

  showLoading(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      el.innerHTML = '<div class="flex items-center justify-center p-8"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>';
    }
  },

  hideLoading(elementId, content) {
    const el = document.getElementById(elementId);
    if (el) el.innerHTML = content;
  },

  formatStatus(status) {
    const styles = {
      paid: 'badge-success',
      pending: 'badge-warning',
      overdue: 'badge-danger',
      draft: 'badge-info',
      completed: 'badge-success',
      active: 'badge-success',
      inactive: 'badge-danger',
      cancelled: 'badge-danger'
    };
    return `<span class="badge ${styles[status] || 'badge-info'}">${Utils.capitalize(status)}</span>`;
  },

  confirm(message, onConfirm, onCancel) {
    const content = `
      <p class="text-gray-600 dark:text-gray-300 mb-6">${message}</p>
      <div class="flex justify-end gap-3">
        <button onclick="App.closeModal(); ${onCancel ? `(${onCancel})()` : ''}" class="btn btn-secondary">Cancel</button>
        <button onclick="App.closeModal(); (${onConfirm})();" class="btn btn-danger">Confirm</button>
      </div>
    `;
    this.openModal(content, 'Confirm Action');
  },

  async loadCompanyData() {
    const company = await Auth.getCompany();
    const settings = await Auth.getSettings();
    return { company, settings };
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
