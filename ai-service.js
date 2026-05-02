// AI يفهم النص ويعمل فاتورة باستخدام Google Gemini
async function createInvoiceFromText(text) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: `Extract invoice data from this text and return JSON ONLY in this exact format:
{
  "company_name": "string",
  "client_name": "string",
  "amount": number,
  "description": "string",
  "due_days": number
}

Text: "${text}"`
          }]
        }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    }
  );

  const data = await response.json();
  
  // Gemini بيرجع النتيجة في text جوه parts
  const resultText = data.candidates[0].content.parts[0].text;
  const result = JSON.parse(resultText);
  
  console.log('Gemini Result:', result);
  return result;
}

// اقتراح سعر ذكي
async function getPricingSuggestion(service, market) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: `What is the average market price for "${service}" in ${market}? Return JSON only: {"min_price": number, "max_price": number, "currency": "USD", "suggestion": "string"}`
          }]
        }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    }
  );

  const data = await response.json();
  const resultText = data.candidates[0].content.parts[0].text;
  return JSON.parse(resultText);
}

// كتابة إيميل متابعة
async function generateFollowUpEmail(clientName, amount, dueDate) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: `Write a polite payment reminder email to ${clientName} for invoice amount $${amount} due on ${dueDate}. Return JSON: {"subject": "string", "body": "string"}`
          }]
        }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    }
  );

  const data = await response.json();
  const resultText = data.candidates[0].content.parts[0].text;
  return JSON.parse(resultText);
}
