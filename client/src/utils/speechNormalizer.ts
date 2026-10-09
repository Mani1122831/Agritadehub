/**
 * AgriTrade Hub - Spoken Language & TTS Normalizer
 * Prepares responses for Web Speech Synthesis so numbers, currencies, agricultural units,
 * and scientific names sound natural and native across Telugu, Tamil, Hindi, and English.
 */

export function normalizeTextForSpeech(text: string, lang: string): string {
  if (!text) return '';

  // 1. Remove markdown formatting (bold, italic, code blocks, headers, bullet points)
  let clean = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/^[*-]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '');

  if (lang === 'te-IN' || lang.startsWith('te')) {
    // Currency & Unit conversions for Telugu
    clean = clean
      // Range prices: ₹190 - ₹240 / kg
      .replace(/₹\s*(\d+)\s*[-–—]\s*₹?\s*(\d+)\s*\/\s*(?:kg|కిలో)/gi, '$1 నుండి $2 రూపాయలు ప్రతి కిలోకు')
      .replace(/₹\s*([\d,]+)\s*[-–—]\s*₹?\s*([\d,]+)\s*\/\s*(?:qtl|క్వింటా|క్వింటాలు)/gi, '$1 నుండి $2 రూపాయలు ప్రతి క్వింటాలుకు')
      // Single price with unit: ₹32/kg or ₹32 / kg
      .replace(/₹\s*(\d+)\s*\/\s*(?:kg|కిలో)/gi, '$1 రూపాయలు ప్రతి కిలోకు')
      .replace(/₹\s*([\d,]+)\s*\/\s*(?:qtl|క్వింటా|క్వింటాలు)/gi, '$1 రూపాయలు ప్రతి క్వింటాలుకు')
      // Bare currency: ₹32 or ₹7,121
      .replace(/₹\s*([\d,]+)/g, '$1 రూపాయలు')
      .replace(/rs\.?\s*([\d,]+)/gi, '$1 రూపాయలు')
      // Units
      .replace(/\/kg/gi, ' ప్రతి కిలోకు ')
      .replace(/\/qtl/gi, ' ప్రతి క్వింటాలుకు ')
      .replace(/\bqtl\b/gi, 'క్వింటాల్')
      .replace(/\bkg\b/gi, 'కిలో')
      // Agricultural acronyms
      .replace(/\bMSP\b/g, 'కనీస మద్దతు ధర')
      .replace(/\bICAR\b/g, 'ఐ.సి.ఎ.ఆర్')
      .replace(/\bANGRAU\b/g, 'ఆచార్య ఎన్.జి. రంగా విశ్వవిద్యాలయం')
      .replace(/\bFPO\b/g, 'రైతు ఉత్పత్తి సంఘం')
      .replace(/\bAPMC\b/g, 'వ్యవసాయ మార్కెట్ యార్డ్')
      .replace(/\bppm\b/gi, 'పి.పి.ఎం')
      // Common Latin scientific names in brackets replaced smoothly
      .replace(/\(Thrips parvispinus\)/gi, '')
      .replace(/\(BPH\)/gi, '')
      .replace(/\(AWD\)/gi, '')
      .replace(/\(GI Tag[^)]*\)/gi, 'భౌగోళిక గుర్తింపు పొందిన')
      // English words often read awkwardly by Telugu TTS
      .replace(/\bHybrid\b/gi, 'హైబ్రిడ్')
      .replace(/\bBenchmark\b/gi, 'ప్రామాణిక')
      .replace(/\bStable\b/gi, 'స్థిరమైన')
      .replace(/\brange\b/gi, 'పరిధి');
  } else if (lang === 'ta-IN' || lang.startsWith('ta')) {
    clean = clean
      .replace(/₹\s*(\d+)\s*[-–—]\s*₹?\s*(\d+)\s*\/\s*(?:kg|கிலோ)/gi, '$1 முதல் $2 ரூபாய் ஒரு கிலோவிற்கு')
      .replace(/₹\s*(\d+)\s*\/\s*(?:kg|கிலோ)/gi, '$1 ரூபாய் ஒரு கிலோவிற்கு')
      .replace(/₹\s*([\d,]+)/g, '$1 ரூபாய்')
      .replace(/\/kg/gi, ' ஒரு கிலோவிற்கு ')
      .replace(/\bMSP\b/g, 'குறைந்தபட்ச ஆதரவு விலை')
      .replace(/\bFPO\b/g, 'உழவர் உற்பத்தியாளர் நிறுவனம்');
  } else if (lang === 'hi-IN' || lang.startsWith('hi')) {
    clean = clean
      .replace(/₹\s*(\d+)\s*[-–—]\s*₹?\s*(\d+)\s*\/\s*(?:kg|किलो)/gi, '$1 से $2 रुपये प्रति किलो')
      .replace(/₹\s*(\d+)\s*\/\s*(?:kg|किलो)/gi, '$1 रुपये प्रति किलो')
      .replace(/₹\s*([\d,]+)/g, '$1 रुपये')
      .replace(/\/kg/gi, ' प्रति किलो ')
      .replace(/\bMSP\b/g, 'न्यूनतम समर्थन मूल्य')
      .replace(/\bFPO\b/g, 'किसान उत्पादक संगठन');
  } else {
    // English normalization
    clean = clean
      .replace(/₹\s*([\d,]+)/g, 'Rupees $1')
      .replace(/\/kg/gi, ' per kilogram ')
      .replace(/\/qtl/gi, ' per quintal ')
      .replace(/\bMSP\b/g, 'Minimum Support Price')
      .replace(/\bFPO\b/g, 'Farmer Producer Organisation');
  }

  // Remove excess whitespace and newlines for smooth TTS flow
  return clean.replace(/\n+/g, '. ').replace(/\s{2,}/g, ' ').trim();
}
