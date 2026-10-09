import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
import dotenv from 'dotenv';
dotenv.config();

const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-2.0-flash-exp',
  'gemini-1.5-pro',
  'gemini-flash-latest',
  'gemini-3.5-flash'
];

import { getRealWorldContextSummary } from './agriIntelligenceService.js';

/**
 * Call Google Gemini Flash API with multi-model cascade, generateContent, and interactions fallback
 */
export async function callGeminiFlash(prompt, systemInstruction = '') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, reason: 'NO_API_KEY' };
  }

  const realWorldContext = getRealWorldContextSummary();

  const sysInstruction = systemInstruction || 
    `You are AgriTrade Hub AI, an advanced agricultural intelligence assistant for Indian farmers, FPOs, traders, and mandi buyers.
Provide concise, expert, practical, and verified advice (max 3-4 sentences).

Grounding Benchmarks:
${realWorldContext}

Language & Persona Rules:
1. Telugu (తెలుగు): If the user speaks/types in Telugu script (తెలుగు లిపి) OR Romanized Telugu / Tenglish (e.g. "tamata rate entha", "mirapa lo purugu mandu", "vari aggi tegulu nivarana"), ALWAYS respond in polite, respectful, natural Telugu script (తెలుగు లిపి) starting with "రైతు సోదరులకు నమస్కారం!". Include specific APMC mandi names, prices (₹/కిలో or ₹/క్వింటా), and university dosages (లీటరు నీటికి 2 మి.లీ).
2. Hindi (हिंदी): If asked in Hindi, respond respectfully in Hindi (हिंदी लिपि) starting with "नमस्ते किसान भाई!".
3. Tamil (தமிழ்): If asked in Tamil, respond respectfully in Tamil (தமிழ் எழுத்துக்கள்) starting with "வணக்கம் விவசாய நண்பரே!".
4. English: If asked in English, provide structured, professional real-world mandi numbers and ICAR agronomy recommendations.`;

  for (const model of CANDIDATE_MODELS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      // Primary: Standard Google Gemini generateContent API
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: sysInstruction }] }
        })
      });

      clearTimeout(timeout);

      if (res.status === 200) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          return {
            success: true,
            model,
            reply: text.trim(),
            raw: data
          };
        }
      }

      // Fallback: Check if Interactions endpoint works for this model
      if (res.status !== 200) {
        const iController = new AbortController();
        const iTimeout = setTimeout(() => iController.abort(), 4000);
        const iRes = await fetch(`https://generativelanguage.googleapis.com/v1/interactions?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: iController.signal,
          body: JSON.stringify({
            model,
            input: prompt,
            system_instruction: sysInstruction
          })
        });
        clearTimeout(iTimeout);
        if (iRes.status === 200) {
          const iData = await iRes.json();
          let iReply = iData.output_text || '';
          if (!iReply && Array.isArray(iData.outputs)) {
            const textPart = iData.outputs.find(o => o.type === 'text' || o.text);
            iReply = textPart?.text || textPart?.content || '';
          }
          if (iReply && iReply.trim()) {
            return {
              success: true,
              model,
              reply: iReply.trim(),
              raw: iData
            };
          }
        }
      }
    } catch (err) {
      // Continue to next fallback model
    }
  }

  return { success: false, reason: 'SERVICE_UNAVAILABLE' };
}

