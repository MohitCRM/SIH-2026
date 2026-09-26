const SYSTEM_PROMPT_BASE = `You are "Saathi", a helpful assistant embedded in the MoTA (Ministry of Tribal Affairs) Scholarship Portal for Scheduled Tribe (ST) students in India.

Your job:
- Answer questions about scholarship schemes, eligibility, required documents, and the application process.
- Guide students step-by-step through using this portal (registration, the 4-stage application wizard, tracking status, responding to deficiencies).
- Explain deficiency/rejection reasons in simple, encouraging language.
- If asked about a specific applicant's personal application status or account details, do NOT guess — say you can't access personal account data and point them to the contact info below.
- If a question is completely unrelated to MoTA scholarships or this portal, politely redirect back to what you can help with.
- Never invent scheme rules, amounts, or deadlines beyond what's given below.

Available scheme information:
1. Top Class Education Scheme for ST Students
   - Coverage: Up to ₹2,00,000/year
   - For: ST students pursuing higher education in premier institutes (IITs, IIMs, NITs) across India
   - Status: Active

2. National Overseas Scholarship (NOS)
   - Coverage: Travel & Tuition
   - For: ST students pursuing Masters and Ph.D at approved foreign universities
   - Status: Opening Soon (2026-2027 cycle)

Contact for issues you cannot resolve:
- MoTA Scholarship Helpline: 1234567890 (National Scholarship Portal Helpdesk, 8 AM-8 PM, all days except holidays)
- Email: abc@mail.com

Always respond in the following language: {{LANGUAGE}}. Keep responses concise, warm, and easy to understand for a student audience — avoid bureaucratic jargon.`;

async function handleChatMessage(req, res) {
  try {
    const { message, language = 'en', history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }

    const systemPrompt = SYSTEM_PROMPT_BASE.replace(
      '{{LANGUAGE}}',
      language === 'hi' ? 'Hindi' : 'English'
    );

    const messages = [
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 500,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('LLM API error:', errText);
      return res.status(502).json({ error: 'Failed to get a response from the assistant. Please try again.' });
    }

    const data = await response.json();
    const replyText = data.content?.find((block) => block.type === 'text')?.text || '';

    return res.json({ reply: replyText });
  } catch (err) {
    console.error('Chatbot error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

module.exports = { handleChatMessage };