/**
 * Smart Invoice AI - AI Engine Module
 * Provides AI-powered features for invoice creation and business intelligence
 */

// Google Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyCPf8gmo6JXVltSsRJOJ94RXLCzLhr_7f4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

var AIEngine = {
  // Industry-specific service suggestions
  industryServices: {
    technology: [
      { description: 'Web Application Development', rate: 120 },
      { description: 'Mobile App Development', rate: 150 },
      { description: 'API Integration', rate: 100 },
      { description: 'Cloud Infrastructure Setup', rate: 200 },
      { description: 'DevOps Consulting', rate: 180 },
      { description: 'UI/UX Design', rate: 110 },
      { description: 'Code Review & Audit', rate: 90 },
      { description: 'Database Optimization', rate: 130 }
    ],
    design: [
      { description: 'Logo Design', rate: 800 },
      { description: 'Brand Identity Package', rate: 2500 },
      { description: 'Website Design', rate: 3000 },
      { description: 'Social Media Graphics', rate: 150 },
      { description: 'Print Design', rate: 200 },
      { description: 'Packaging Design', rate: 1500 },
      { description: 'Illustration', rate: 250 },
      { description: 'Motion Graphics', rate: 350 }
    ],
    marketing: [
      { description: 'SEO Audit & Strategy', rate: 1500 },
      { description: 'Content Marketing Plan', rate: 2000 },
      { description: 'Social Media Management', rate: 1200 },
      { description: 'PPC Campaign Management', rate: 1000 },
      { description: 'Email Marketing Setup', rate: 800 },
      { description: 'Analytics & Reporting', rate: 600 },
      { description: 'Influencer Outreach', rate: 500 },
      { description: 'Video Marketing', rate: 2000 }
    ],
    consulting: [
      { description: 'Business Strategy Session', rate: 500 },
      { description: 'Market Research', rate: 3000 },
      { description: 'Financial Analysis', rate: 2500 },
      { description: 'Process Optimization', rate: 2000 },
      { description: 'Training Workshop', rate: 1500 },
      { description: 'Executive Coaching', rate: 400 },
      { description: 'Risk Assessment', rate: 1800 },
      { description: 'Growth Planning', rate: 2200 }
    ],
    writing: [
      { description: 'Blog Post (1500 words)', rate: 300 },
      { description: 'Website Copywriting', rate: 1500 },
      { description: 'White Paper', rate: 2500 },
      { description: 'Case Study', rate: 800 },
      { description: 'Press Release', rate: 400 },
      { description: 'Technical Documentation', rate: 600 },
      { description: 'Email Sequence', rate: 500 },
      { description: 'Product Description', rate: 100 }
    ],
    photography: [
      { description: 'Product Photography', rate: 500 },
      { description: 'Corporate Headshots', rate: 300 },
      { description: 'Event Coverage', rate: 1500 },
      { description: 'Real Estate Photography', rate: 800 },
      { description: 'Food Photography', rate: 600 },
      { description: 'Fashion Shoot', rate: 2000 },
      { description: 'Photo Editing', rate: 150 },
      { description: 'Drone Photography', rate: 1000 }
    ],
    legal: [
      { description: 'Contract Review', rate: 500 },
      { description: 'Legal Consultation', rate: 400 },
      { description: 'Trademark Filing', rate: 1500 },
      { description: 'Business Formation', rate: 1200 },
      { description: 'Compliance Audit', rate: 2000 },
      { description: 'IP Protection Strategy', rate: 2500 },
      { description: 'Employment Agreement', rate: 800 },
      { description: 'Privacy Policy Drafting', rate: 600 }
    ],
    healthcare: [
      { description: 'Medical Billing Service', rate: 500 },
      { description: 'Telehealth Setup', rate: 2000 },
      { description: 'HIPAA Compliance Audit', rate: 3000 },
      { description: 'Medical Transcription', rate: 150 },
      { description: 'Healthcare IT Consulting', rate: 250 },
      { description: 'Patient Portal Development', rate: 5000 },
      { description: 'Medical Coding', rate: 100 },
      { description: 'Practice Management Setup', rate: 1800 }
    ]
  },

  // Parse natural language to invoice data
  parseInvoice(text) {
    const result = {
      clientName: '',
      items: [],
      dueDays: 30,
      notes: '',
      confidence: 0
    };

    const lowerText = text.toLowerCase();

    // Extract client name
    const clientPatterns = [
      /(?:for|to|invoice|bill)\s+([A-Z][A-Za-z0-9\s&.,]+?)(?:\s+(?:for|at|@|due|on|with|amount|total|$))/i,
      /(?:client|customer)\s*:?\s*([A-Z][A-Za-z0-9\s&.,]+?)(?:\s|$)/i,
      /([A-Z][A-Za-z0-9\s&.,]{2,50})(?:\s+(?:for|project|website|app|design|consulting))/i
    ];

    for (const pattern of clientPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.clientName = match[1].trim();
        break;
      }
    }

    // Extract items with amounts
    const itemPatterns = [
      /([A-Za-z\s]+?)\s*(?:for|@)?\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/gi,
      /([A-Za-z\s]+?)\s+(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|EUR|GBP|\$)/gi
    ];

    for (const pattern of itemPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const desc = match[1].trim();
        const amount = parseFloat(match[2].replace(/,/g, ''));
        if (desc.length > 2 && amount > 0 && !result.items.some(i => i.description === desc)) {
          result.items.push({ description: Utils.titleCase(desc), quantity: 1, rate: amount, amount });
        }
      }
    }

    // Extract due date
    const duePatterns = [
      /due\s+(?:in\s+)?(\d+)\s*days?/i,
      /due\s+(?:in\s+)?(\d+)\s*weeks?/i,
      /net\s+(\d+)/i,
      /(\d+)\s*days?\s+(?:payment|terms)/i
    ];

    for (const pattern of duePatterns) {
      const match = text.match(pattern);
      if (match) {
        let days = parseInt(match[1]);
        if (lowerText.includes('week')) days *= 7;
        result.dueDays = days;
        break;
      }
    }

    // Extract notes
    const notePatterns = [
      /(?:note|notes|memo|description)\s*:?\s*(.+?)(?:\s*$|(?=\bdue\b|\bfor\b))/i,
      /(?:project|regarding|re|about)\s*:?\s*(.+?)(?:\s*$|(?=\bdue\b|\bfor\b))/i
    ];

    for (const pattern of notePatterns) {
      const match = text.match(pattern);
      if (match) {
        result.notes = match[1].trim();
        break;
      }
    }

    // Calculate confidence
    let score = 0;
    if (result.clientName) score += 30;
    if (result.items.length > 0) score += 40;
    if (result.dueDays !== 30) score += 10;
    if (result.notes) score += 10;
    if (result.items.length > 1) score += 10;
    result.confidence = Math.min(score, 100);

    return result;
  },

  // Get smart suggestions based on industry
  getSuggestions(industry, query = '') {
    const services = this.industryServices[industry] || this.industryServices.technology;
    
    if (!query) return services.slice(0, 5);
    
    const lowerQuery = query.toLowerCase();
    return services
      .filter(s => s.description.toLowerCase().includes(lowerQuery))
      .slice(0, 5);
  },

  // Recommend template based on industry
  recommendTemplate(industry) {
    const recommendations = {
      technology: 'tech',
      design: 'creative',
      marketing: 'modern',
      consulting: 'professional',
      writing: 'minimal',
      photography: 'creative',
      legal: 'professional',
      healthcare: 'modern',
      default: 'modern'
    };
    return recommendations[industry] || recommendations.default;
  },

  // Generate follow-up email
  async generateFollowUpEmail(invoice, tone = 'professional') {
    try {
      const prompt = `Write a ${tone} payment reminder email to ${invoice.clientName} for invoice ${invoice.invoiceNumber}. The amount due is $${invoice.total} and was due on ${invoice.dueDate}. The sender company is ${invoice.companyName}. Return JSON ONLY in this exact format: {"subject": "string", "body": "string"}`;
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });
      const data = await response.json();
      return JSON.parse(data.candidates[0].content.parts[0].text);
    } catch (e) {
      console.error("Gemini API error, using fallback:", e);

    const tones = {
      professional: {
        subject: `Payment Reminder: Invoice ${invoice.invoiceNumber}`,
        body: `Dear ${invoice.clientName},

I hope this email finds you well. I am writing to remind you about invoice ${invoice.invoiceNumber} for ${Utils.formatCurrency(invoice.total)}, which was due on ${Utils.formatDate(invoice.dueDate)}.

If you have already processed this payment, please disregard this message. Otherwise, we would appreciate your prompt attention to this matter.

Please let us know if you have any questions or concerns.

Best regards,
${invoice.companyName}`
      },
      friendly: {
        subject: `Quick reminder about ${invoice.invoiceNumber}`,
        body: `Hi ${invoice.clientName},

Just a friendly nudge about invoice ${invoice.invoiceNumber} (${Utils.formatCurrency(invoice.total)}) - it was due on ${Utils.formatDate(invoice.dueDate)}.

No worries if it's in progress, just wanted to make sure it didn't slip through the cracks!

Thanks,
${invoice.companyName}`
      },
      firm: {
        subject: `URGENT: Overdue Invoice ${invoice.invoiceNumber}`,
        body: `${invoice.clientName},

This is a reminder that invoice ${invoice.invoiceNumber} for ${Utils.formatCurrency(invoice.total)} is now ${Math.abs(Utils.daysUntil(invoice.dueDate))} days overdue.

Please arrange payment immediately to avoid any late fees or service interruption.

${invoice.companyName}`
      }
    };

    return tones[tone] || tones.professional;
    }
  },

  // Predict cash flow
  async predictCashFlow(invoices, months = 3) {
    try {
      const invoiceData = invoices.map(i => ({ amount: i.total, status: i.status, dueDate: i.dueDate }));
      const prompt = `Based on these invoices: ${JSON.stringify(invoiceData)}. Predict the expected cash flow for the next ${months} months. Return JSON ONLY as an array in this exact format: [{"month": "MMM YYYY", "expected": 0, "optimistic": 0, "conservative": 0, "confidence": 0}]`;
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });
      const data = await response.json();
      return JSON.parse(data.candidates[0].content.parts[0].text);
    } catch (e) {
      console.error("Gemini API error, using fallback:", e);

    const now = new Date();
    const predictions = [];
    
    // Calculate historical collection rate
    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);
    const totalPaid = paidInvoices.reduce((sum, i) => sum + i.total, 0);
    const collectionRate = totalInvoiced > 0 ? totalPaid / totalInvoiced : 0.7;
    
    // Average invoice value
    const avgInvoice = invoices.length > 0 ? totalInvoiced / invoices.length : 5000;
    
    // Pending and overdue amounts
    const pending = invoices.filter(i => i.status === 'pending');
    const overdue = invoices.filter(i => i.status === 'overdue');
    
    for (let i = 0; i < months; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthName = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Expected collections from pending invoices
      const expectedPending = pending.reduce((sum, inv) => {
        const dueDate = new Date(inv.dueDate);
        if (dueDate.getMonth() === month.getMonth() && dueDate.getFullYear() === month.getFullYear()) {
          return sum + (inv.total * collectionRate);
        }
        return sum;
      }, 0);
      
      // Expected collections from overdue (diminishing probability)
      const expectedOverdue = overdue.reduce((sum, inv) => {
        const daysOverdue = Math.abs(Utils.daysUntil(inv.dueDate));
        const probability = Math.max(0.1, 0.8 - (daysOverdue * 0.01));
        return sum + (inv.total * probability);
      }, 0);
      
      // Projected new invoices (based on historical average)
      const projectedNew = avgInvoice * 2 * collectionRate;
      
      predictions.push({
        month: monthName,
        expected: Math.round(expectedPending + expectedOverdue + (i === 0 ? projectedNew : 0)),
        optimistic: Math.round((expectedPending + expectedOverdue + projectedNew) * 1.2),
        conservative: Math.round((expectedPending + expectedOverdue) * 0.8),
        confidence: Math.max(50, 95 - (i * 15))
      });
    }
    
    return predictions;
    }
  },

  // Suggest pricing based on market data
  async suggestPricing(service, industry = 'technology') {
    try {
      const prompt = `What is the average market price for "${service}" in the ${industry} industry? Return JSON ONLY in this exact format:
      {
        "suggestedRate": number,
        "range": { "min": number, "max": number },
        "marketAverage": number,
        "confidence": "high" or "medium" or "low",
        "note": "short explanation"
      }`;
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });
      const data = await response.json();
      return JSON.parse(data.candidates[0].content.parts[0].text);
    } catch (e) {
      console.error("Gemini API error, using fallback:", e);

    const services = this.industryServices[industry] || this.industryServices.technology;
    const match = services.find(s => 
      s.description.toLowerCase().includes(service.toLowerCase()) ||
      service.toLowerCase().includes(s.description.toLowerCase().split(' ')[0])
    );
    
    if (!match) {
      return {
        suggestedRate: 100,
        range: { min: 75, max: 150 },
        marketAverage: 100,
        confidence: 'low',
        note: 'Limited market data available for this service'
      };
    }

    const variance = 0.2;
    return {
      suggestedRate: match.rate,
      range: {
        min: Math.round(match.rate * (1 - variance)),
        max: Math.round(match.rate * (1 + variance))
      },
      marketAverage: match.rate,
      confidence: 'high',
      note: `Based on ${industry} industry averages`
    };
    }
  },

  // Match expenses to invoices (simulated)
  async matchExpenses(expenses, invoices) {
    try {
      const expData = expenses.map(e => ({ id: e.id, description: e.description, amount: e.amount, date: e.date }));
      const invData = invoices.map(i => ({ id: i.id, number: i.invoiceNumber, amount: i.total, date: i.issueDate }));
      const prompt = `Match these expenses: ${JSON.stringify(expData)} to these invoices: ${JSON.stringify(invData)} based on similarity in description, amounts, and dates. Return JSON ONLY as an array of matches in this format: [{"expenseId": "id", "invoiceId": "id", "confidence": 0.9, "reason": "string"}]`;
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" }
        })
      });
      const data = await response.json();
      const geminiMatches = JSON.parse(data.candidates[0].content.parts[0].text);
      return geminiMatches.map(gm => ({
        expense: expenses.find(e => e.id === gm.expenseId),
        invoice: invoices.find(i => i.id === gm.invoiceId),
        confidence: gm.confidence,
        reason: gm.reason
      })).filter(m => m.expense && m.invoice);
    } catch (e) {
      console.error("Gemini API error, using fallback:", e);

    const matches = [];
    
    expenses.forEach(expense => {
      const bestMatch = invoices
        .map(inv => ({
          invoice: inv,
          score: this.calculateMatchScore(expense, inv)
        }))
        .sort((a, b) => b.score - a.score)[0];
      
      if (bestMatch && bestMatch.score > 0.5) {
        matches.push({
          expense,
          invoice: bestMatch.invoice,
          confidence: bestMatch.score,
          reason: this.getMatchReason(expense, bestMatch.invoice)
        });
      }
    });
    
    return matches;
    }
  },

  calculateMatchScore(expense, invoice) {
    let score = 0;
    
    // Amount similarity (within 20%)
    const amountDiff = Math.abs(expense.amount - invoice.total) / invoice.total;
    if (amountDiff < 0.2) score += 0.4;
    else if (amountDiff < 0.5) score += 0.2;
    
    // Date proximity (within 30 days)
    const expDate = new Date(expense.date);
    const invDate = new Date(invoice.issueDate);
    const daysDiff = Math.abs((expDate - invDate) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) score += 0.3;
    else if (daysDiff < 30) score += 0.15;
    
    // Description similarity
    const expWords = expense.description.toLowerCase().split(' ');
    const invWords = (invoice.notes || '').toLowerCase().split(' ');
    const commonWords = expWords.filter(w => invWords.includes(w));
    if (commonWords.length > 0) score += 0.3 * (commonWords.length / Math.max(expWords.length, invWords.length));
    
    return Math.min(score, 1);
  },

  getMatchReason(expense, invoice) {
    const reasons = [];
    
    const amountDiff = Math.abs(expense.amount - invoice.total) / invoice.total;
    if (amountDiff < 0.2) reasons.push('Amount matches closely');
    
    const expDate = new Date(expense.date);
    const invDate = new Date(invoice.issueDate);
    const daysDiff = Math.abs((expDate - invDate) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) reasons.push('Dates are very close');
    
    return reasons.join(', ') || 'Possible match based on patterns';
  },

  // Generate AI insights
  generateInsights(stats, invoices) {
    const insights = [];
    
    if (stats.collectionRate < 80) {
      insights.push({
        type: 'warning',
        title: 'Collection Rate Below Target',
        message: `Your collection rate is ${stats.collectionRate}%. Consider implementing automated reminders for overdue invoices.`,
        action: 'Set Up Reminders'
      });
    }
    
    if (stats.overdueCount > 0) {
      const oldestOverdue = invoices
        .filter(i => i.status === 'overdue')
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
      
      insights.push({
        type: 'danger',
        title: 'Overdue Invoices Need Attention',
        message: `You have ${stats.overdueCount} overdue invoice(s). The oldest is ${Math.abs(Utils.daysUntil(oldestOverdue.dueDate))} days past due.`,
        action: 'Send Reminders'
      });
    }
    
    if (stats.totalRevenue > 0) {
      const avgInvoice = stats.totalRevenue / (stats.paidCount + stats.pendingCount);
      insights.push({
        type: 'info',
        title: 'Revenue Insight',
        message: `Your average invoice value is ${Utils.formatCurrency(avgInvoice)}. Consider upselling services to increase this.`,
        action: 'View Pricing Guide'
      });
    }
    
    if (stats.clientCount < 5) {
      insights.push({
        type: 'success',
        title: 'Growth Opportunity',
        message: 'You have a small client base. Focus on client acquisition to diversify revenue.',
        action: 'Find Clients'
      });
    }
    
    return insights;
  },

  // Simulate AI processing with typing effect
  async processWithTyping(element, text, speed = 30) {
    element.textContent = '';
    element.classList.add('ai-typing');
    
    for (let i = 0; i < text.length; i++) {
      element.textContent += text[i];
      await new Promise(r => setTimeout(r, speed));
    }
    
    element.classList.remove('ai-typing');
  }
};
