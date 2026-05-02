/**
 * Smart Invoice AI - Main Application Module
 */

const App = {
  sidebarOpen: false,
  currentPage: '',
  
async init() {
    try {
      // Wait for DB initialization if not ready
      if (!window.DB_READY) {
        await new Promise(resolve => {
          if (window.DB_READY) return resolve();
          document.addEventListener('dbReady', resolve, { once: true });
          setTimeout(resolve, 1000);
        });
      }
      
      // Initialize auth (only if Auth is defined)
      if (typeof Auth !== 'undefined' && Auth.init) {
        await Auth.init();
      } else {
        console.warn('Auth module not loaded yet');
      }
    } catch (err) {
      console.warn('Auth init skipped:', err.message);
    }
    
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
    // Check localStorage first, then system preference, default to light
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply saved theme or default to light (not dark)
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (saved === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (prefersDark) {
      // Only use system preference if nothing saved
      document.documentElement.classList.add('dark');
    }
    // Default is light mode (no dark class)
    
    // Theme toggle button
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
    
    // Logout (only if Auth is defined)
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
      if (typeof Auth !== 'undefined' && Auth.logout) {
        Auth.logout();
      }
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
    const modalContent = overlay?.querySelector('.modal-content');
    
    if (titleEl) titleEl.textContent = title;
    if (bodyEl && content) bodyEl.innerHTML = content;
    // If no content provided, just show existing modal content
    if (overlay) overlay.classList.add('active');
  },

  closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
      overlay.classList.remove('active');
      // Reset any form fields inside the modal if they exist
      overlay.querySelectorAll('input, textarea, select').forEach(el => {
        if (el.type !== 'select-one') el.value = '';
      });
    }
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
    const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
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
      
      if (nameEl && user.name) nameEl.textContent = user.name;
      if (emailEl && user.email) emailEl.textContent = user.email;
      if (avatarEl && user.avatar) avatarEl.src = user.avatar;
      if (planEl && user.plan) {
        planEl.textContent = typeof Utils !== 'undefined' ? Utils.capitalize(user.plan) : user.plan;
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
    const displayStatus = typeof Utils !== 'undefined' ? Utils.capitalize(status) : (status ? status.charAt(0).toUpperCase() + status.slice(1) : status);
    return `<span class="badge ${styles[status] || 'badge-info'}">${displayStatus}</span>`;
  },

  confirm(message, onConfirm, onCancel) {
    let overlay = document.getElementById('confirmOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'confirmOverlay';
      overlay.className = 'modal-overlay';
      overlay.style.zIndex = '100'; // Make sure it's above other modals
      overlay.innerHTML = `
        <div class="modal-content p-6 max-w-sm">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirm Action</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-6" id="confirmMessage"></p>
          <div class="flex justify-end gap-3">
            <button id="confirmCancelBtn" class="btn btn-secondary">Cancel</button>
            <button id="confirmOkBtn" class="btn btn-danger">Confirm</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    
    document.getElementById('confirmMessage').textContent = message;
    
    document.getElementById('confirmCancelBtn').onclick = () => {
      overlay.classList.remove('active');
      if (onCancel) onCancel();
    };
    
    document.getElementById('confirmOkBtn').onclick = () => {
      overlay.classList.remove('active');
      if (onConfirm) onConfirm();
    };
    
    overlay.classList.add('active');
  },

async loadCompanyData() {
    const company = typeof Auth !== 'undefined' ? await Auth.getCompany() : null;
    const settings = typeof Auth !== 'undefined' ? await Auth.getSettings() : null;
    return { company, settings };
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
