/**
 * Smart Invoice AI - Utility Functions
 */

const Utils = {
  // Generate UUID v4
  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  },

  // Generate short ID
  shortId(prefix = '') {
    return prefix + Math.random().toString(36).substring(2, 10).toUpperCase();
  },

  // Format currency
  formatCurrency(amount, currency = 'USD', locale = 'en-US') {
    const symbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹', CAD: 'C$', AUD: 'A$', AED: 'د.إ' };
    const symbol = symbols[currency] || '$';
    const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return `${symbol}${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  },

  // Format date
  formatDate(date, format = 'medium') {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d)) return '-';
    
    const formats = {
      short: { month: 'short', day: 'numeric', year: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' },
      iso: undefined // returns ISO string
    };
    
    if (format === 'iso') return d.toISOString().split('T')[0];
    return d.toLocaleDateString('en-US', formats[format] || formats.medium);
  },

  // Format relative time
  timeAgo(date) {
    const d = new Date(date);
    const now = new Date();
    const seconds = Math.floor((now - d) / 1000);
    
    const intervals = {
      year: 31536000, month: 2592000, week: 604800,
      day: 86400, hour: 3600, minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
  },

  // Days until date
  daysUntil(date) {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    return diff;
  },

  // Deep clone
  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  // Debounce
  debounce(fn, delay = 300) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  },

  // Throttle
  throttle(fn, limit = 100) {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Validate email
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  // Validate URL
  isValidUrl(url) {
    try { new URL(url); return true; } catch { return false; }
  },

  // Slugify
  slugify(text) {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
  },

  // Capitalize
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Title case
  titleCase(str) {
    return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  },

  // Random integer
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Random from array
  randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // Calculate percentage
  percentage(value, total) {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  },

  // Group by key
  groupBy(arr, key) {
    return arr.reduce((groups, item) => {
      const group = item[key] || 'Unknown';
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  },

  // Sort by key
  sortBy(arr, key, desc = false) {
    return [...arr].sort((a, b) => {
      const aVal = a[key] ?? 0;
      const bVal = b[key] ?? 0;
      return desc ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
    });
  },

  // Filter unique
  unique(arr, key) {
    if (key) {
      const seen = new Set();
      return arr.filter(item => {
        const val = item[key];
        if (seen.has(val)) return false;
        seen.add(val);
        return true;
      });
    }
    return [...new Set(arr)];
  },

  // Sum array
  sum(arr, key) {
    return arr.reduce((total, item) => total + (key ? (parseFloat(item[key]) || 0) : (parseFloat(item) || 0)), 0);
  },

  // Average
  average(arr, key) {
    const values = key ? arr.map(i => parseFloat(i[key]) || 0) : arr.map(i => parseFloat(i) || 0);
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  },

  // Generate invoice number
  generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `INV-${year}-${random}`;
  },

  // Parse natural language for invoice
  parseNaturalLanguage(text) {
    const result = {
      clientName: '',
      items: [],
      dueDays: 30,
      notes: ''
    };

    // Extract client name (after "for" or "to")
    const clientMatch = text.match(/(?:for|to)\s+([A-Z][A-Za-z\s&]+?)(?:\s+(?:for|at|@|due|on|with|invoice|amount|$))/i);
    if (clientMatch) result.clientName = clientMatch[1].trim();

    // Extract amounts with descriptions
    const itemMatches = text.matchAll(/([A-Za-z\s]+)\s*\$?(\d+(?:\.\d{2})?)/gi);
    for (const match of itemMatches) {
      const desc = match[1].trim();
      const amount = parseFloat(match[2]);
      if (desc && amount > 0) {
        result.items.push({ description: desc, rate: amount, quantity: 1 });
      }
    }

    // Extract due date
    const dueMatch = text.match(/due\s+(?:in\s+)?(\d+)\s*days?/i);
    if (dueMatch) result.dueDays = parseInt(dueMatch[1]);

    return result;
  },

  // Get exchange rate (simulated)
  getExchangeRate(from, to) {
    const rates = {
      USD: 1, EUR: 0.92, GBP: 0.79, JPY: 150.5,
      INR: 83.2, CAD: 1.35, AUD: 1.52, AED: 3.67
    };
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    return toRate / fromRate;
  },

  // Convert currency
  convertCurrency(amount, from, to) {
    return amount * this.getExchangeRate(from, to);
  },

  // Tax calculation
  calculateTax(amount, rate) {
    return (amount * rate) / 100;
  },

  // Discount calculation
  calculateDiscount(amount, rate) {
    return (amount * rate) / 100;
  },

  // Generate colors for charts
  generateColors(count) {
    const base = ['#6366f1', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(base[i % base.length]);
    }
    return colors;
  },

  // Download file
  downloadFile(content, filename, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Export to CSV
  exportCSV(data, filename) {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => {
      const val = row[h] ?? '';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    this.downloadFile(csv, filename, 'text/csv');
  },

  // Local storage with expiry
  storage: {
    set(key, value, ttlMinutes = null) {
      const item = { value, timestamp: Date.now() };
      if (ttlMinutes) item.ttl = ttlMinutes * 60 * 1000;
      localStorage.setItem(key, JSON.stringify(item));
    },
    
    get(key) {
      const item = localStorage.getItem(key);
      if (!item) return null;
      const parsed = JSON.parse(item);
      if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.value;
    },
    
    remove(key) {
      localStorage.removeItem(key);
    },
    
    clear() {
      localStorage.clear();
    }
  },

  // Mobile detection
  isMobile() {
    return window.innerWidth < 768;
  },

  // Copy to clipboard
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  },

  // Sanitize HTML
  sanitizeHtml(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}
