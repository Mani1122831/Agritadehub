import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  ShoppingBag,
  Send,
  RefreshCw,
  TrendingUp,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { ProductCard } from '../components/common/ProductCard';
import { Product } from '../types';
import { normalizeTextForSpeech } from '../utils/speechNormalizer';

export type VoiceLang = 'en-IN' | 'hi-IN' | 'te-IN' | 'ta-IN';

export const VoiceAgentPage: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState<VoiceLang>('en-IN');
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; products?: Product[]; tool?: string; timestamp: Date }[]
  >([
    {
      role: 'assistant',
      text: 'Namaste! I am your AgriTrade Gemini Voice Assistant. Click the microphone below or choose a suggestion to ask about produce prices, mandi stock, supplier contacts, or order tracking.',
      timestamp: new Date(),
    },
  ]);
  const [isMuted, setIsMuted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat container ONLY, NEVER scrolling the main window or page
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Initialize Speech Recognition when language changes
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        setStatus('listening');
      };

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        transcriptRef.current = current;
        setTranscript(current);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech error:', event.error);
        setStatus('idle');
      };

      recognition.onend = () => {
        const textToSend = transcriptRef.current.trim();
        if (textToSend) {
          handleSendMessage(textToSend);
          transcriptRef.current = '';
          setTranscript('');
        } else {
          setStatus('idle');
        }
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. You can type your query in the input box below.');
      return;
    }

    if (status === 'listening') {
      recognitionRef.current.stop();
      setStatus('idle');
    } else {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      transcriptRef.current = '';
      setTranscript('');
      setStatus('listening');
      try {
        recognitionRef.current.start();
      } catch (e) {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 200);
      }
    }
  };

  const speakText = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) {
      setStatus('idle');
      return;
    }

    window.speechSynthesis.cancel();
    const spokenText = normalizeTextForSpeech(text, language);
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = language;

    if ('speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      if (language === 'te-IN') {
        const teVoice = voices.find(
          (v) => v.lang.startsWith('te') || v.name.toLowerCase().includes('telugu')
        );
        if (teVoice) utterance.voice = teVoice;
      } else if (language === 'hi-IN') {
        const hiVoice = voices.find(
          (v) => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')
        );
        if (hiVoice) utterance.voice = hiVoice;
      } else if (language === 'ta-IN') {
        const taVoice = voices.find(
          (v) => v.lang.startsWith('ta') || v.name.toLowerCase().includes('tamil')
        );
        if (taVoice) utterance.voice = taVoice;
      }
    }

    utterance.onstart = () => setStatus('speaking');
    utterance.onend = () => setStatus('idle');
    utterance.onerror = () => setStatus('idle');

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setStatus('idle');
  };

  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: queryText, timestamp: new Date() },
    ]);
    setInputText('');
    setStatus('thinking');

    try {
      const res = await apiRequest('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: queryText }),
      });

      const reply = res.reply || "I don't have verified information for that right now.";
      const productCards = res.productCards || [];

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: reply,
          products: productCards,
          tool: res.toolExecuted,
          timestamp: new Date(),
        },
      ]);

      speakText(reply);
    } catch (err: any) {
      const errorMsg = "I couldn't reach the agricultural knowledge base right now. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: errorMsg, timestamp: new Date() },
      ]);
      setStatus('idle');
    }
  };

  const greetingsByLang: Record<VoiceLang, string> = {
    'en-IN':
      'Namaste! I am your AgriTrade Gemini Voice Assistant. Click the microphone below or choose a suggestion to ask about produce prices, mandi stock, supplier contacts, or order tracking.',
    'hi-IN':
      'नमस्ते! मैं आपका एग्रीट्रेड जेमिनी वॉयस असिस्टेंट हूँ। फसलों के भाव, मंडी स्टॉक, सप्लायर संपर्क या ऑर्डर ट्रैकिंग के लिए नीचे दिए गए माइक्रोफ़ोन पर क्लिक करें।',
    'te-IN':
      'రైతు సోదరులకు నమస్కారం! నేను మీ అగ్రిట్రేడ్ జెమిని వాయిస్ అసిస్టెంట్‌ని. 50+ పంటల తాజా మార్కెట్ ధరలు, ప్రభుత్వ మద్దతు ధర (MSP), నల్ల తామర వంటి చీడపీడల నివారణ లేదా ఆర్డర్ వివరాల కోసం క్రింది మైక్రోఫోన్‌పై క్లిక్ చేయండి.',
    'ta-IN':
      'வணக்கம்! நான் உங்கள் அக்ரிடிரேட் ஜெமினி வாய்ஸ் அசிஸ்டண்ட். விளைபொருள் விலைகள், மண்டி இருப்பு, விவசாயிகளின் தொடர்பு அல்லது ஆர்டர் டிராக்கிங் பற்றி அறிய கீழே உள்ள மைக்ரோஃபோனைக் கிளிக் செய்யவும்.',
  };

  const promptsByLang: Record<VoiceLang, string[]> = {
    'en-IN': [
      'What is the price of tomatoes in Madanapalle?',
      'How to manage Black Thrips in chilli crop?',
      'What is the MSP for Red Gram and Cotton?',
      'What is the current mandi rate for Nizamabad turmeric?',
      'Who has 500 kg onions in Maharashtra?',
      'Recommend top certified FPOs near Andhra Pradesh',
    ],
    'hi-IN': [
      'मदनपल्ले में टमाटर का ताजा भाव क्या है?',
      'मिर्च में काली थ्रिप्स (काले कीड़े) का नियंत्रण कैसे करें?',
      'अरहर और कपास का न्यूनतम समर्थन मूल्य (MSP) क्या है?',
      'निजामाबाद हल्दी का मंडी भाव क्या है?',
      'महाराष्ट्र में 500 किलो प्याज किसके पास है?',
    ],
    'te-IN': [
      'మదనపల్లెలో టమాటా ధర ఎంత?',
      'మిరప తోటలో నల్ల తామర పురుగు నివారణ ఏమిటి?',
      'బొప్పాయి మరియు నిమ్మ తాజా మార్కెట్ రేటు ఎంత?',
      'కందులకు ప్రభుత్వం మద్దతు ధర (MSP) ఎంత?',
      'వరిలో అగ్గి తెగులు నివారణ మందులు ఏమిటి?',
      'బంగినపల్లి మామిడికాయల ప్రస్తుత మార్కెట్ ధర ఎంత?',
      '500 కిలోల ఉల్లిపాయలు ఎవరి వద్ద ఉన్నాయి?',
    ],
    'ta-IN': [
      'கோயம்புத்தூரில் தக்காளி விலை என்ன?',
      'மிளகாய் பயிரில் பூச்சி தாக்குதலை கட்டுப்படுத்துவது எப்படி?',
      'மஞ்சள் தற்போதைய சந்தை விலை என்ன?',
      'தமிழ்நாட்டில் 500 கிலோ வெங்காயம் யாரிடம் உள்ளது?',
      'சான்றளிக்கப்பட்ட உழவர் உற்பத்தியாளர் நிறுவனங்களை (FPO) பரிந்துரைக்கவும்',
    ],
  };

  const handleLanguageChange = (newLang: VoiceLang) => {
    setLanguage(newLang);
    // If only the initial welcome message is shown, update it to the selected language
    if (messages.length <= 1) {
      setMessages([
        {
          role: 'assistant',
          text: greetingsByLang[newLang],
          timestamp: new Date(),
        },
      ]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Gemini Flash Multilingual Voice AI (English • हिंदी • తెలుగు • தமிழ்)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          AgriTrade Voice & Speech Agent
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Speak in natural voice to search commodities, check real-time APMC mandi prices, track dispatches, and verify bulk farmer lot inventory.
        </p>

        {/* Language selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <span className="text-xs font-bold text-slate-600">Voice Language:</span>
          <button
            onClick={() => handleLanguageChange('en-IN')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              language === 'en-IN' ? 'bg-emerald-700 text-white shadow' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            English (India)
          </button>
          <button
            onClick={() => handleLanguageChange('hi-IN')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              language === 'hi-IN' ? 'bg-emerald-700 text-white shadow' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            हिंदी (Hindi)
          </button>
          <button
            onClick={() => handleLanguageChange('te-IN')}
            className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${
              language === 'te-IN' ? 'bg-emerald-700 text-white shadow ring-2 ring-emerald-500/30' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>తెలుగు (Telugu)</span>
          </button>
          <button
            onClick={() => handleLanguageChange('ta-IN')}
            className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${
              language === 'ta-IN' ? 'bg-emerald-700 text-white shadow ring-2 ring-emerald-500/30' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-teal-300"></span>
            <span>தமிழ் (Tamil)</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Mic Center */}
      <div className="bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl border border-emerald-800/40 text-center mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          {/* Animated Microphone Circle */}
          <div className="relative mb-6">
            {status === 'listening' && (
              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30 scale-125 pointer-events-none"></div>
            )}
            {status === 'speaking' && (
              <div className="absolute inset-0 rounded-full bg-amber-400 animate-pulse opacity-40 scale-125 pointer-events-none"></div>
            )}
            {status === 'thinking' && (
              <div className="absolute inset-0 rounded-full bg-emerald-400 animate-spin opacity-40 scale-125 pointer-events-none"></div>
            )}

            <button
              onClick={toggleListening}
              className={`w-28 h-28 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                status === 'listening'
                  ? 'bg-red-600 ring-8 ring-red-400/40'
                  : status === 'speaking'
                  ? 'bg-amber-600 ring-8 ring-amber-400/40'
                  : status === 'thinking'
                  ? 'bg-emerald-600 ring-8 ring-emerald-400/40'
                  : 'bg-emerald-700 hover:bg-emerald-600 ring-8 ring-emerald-900/60'
              }`}
              title="Click to Speak"
            >
              <Mic className="w-12 h-12" />
            </button>
          </div>

          {/* Status Label */}
          <div className="text-sm font-bold tracking-wide uppercase mb-2">
            {status === 'listening' ? (
              <span className="text-red-400 animate-pulse">
                {language === 'te-IN'
                  ? '🔴 వింటున్నాను... మాట్లాడండి'
                  : language === 'hi-IN'
                  ? '🔴 सुन रहा हूँ... बोलिए'
                  : language === 'ta-IN'
                  ? '🔴 கேட்கிறேன்... பேசுங்கள்'
                  : '🔴 Listening... Speak Now'}
              </span>
            ) : status === 'thinking' ? (
              <span className="text-emerald-300 flex items-center justify-center space-x-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
                {language === 'te-IN'
                  ? 'జెమిని ఫ్లాష్‌తో ఆలోచిస్తోంది...'
                  : language === 'ta-IN'
                  ? 'ஜெமினி ஃபிளாஷ் மூலம் சிந்திக்கிறது...'
                  : language === 'hi-IN'
                  ? 'जेमिनी फ्लैश के साथ सोच रहा है...'
                  : 'Thinking with Gemini Flash...'}
              </span>
            ) : status === 'speaking' ? (
              <div className="flex items-center space-x-2">
                <span className="text-amber-300">
                  {language === 'te-IN'
                    ? '🔊 సమాధానం చెబుతున్నాను...'
                    : language === 'ta-IN'
                    ? '🔊 பதில் கூறுகிறது...'
                    : language === 'hi-IN'
                    ? '🔊 उत्तर दे रहा हूँ...'
                    : '🔊 Speaking Response...'}
                </span>
                <button
                  onClick={stopSpeaking}
                  className="px-2 py-0.5 rounded bg-black/40 text-xs text-white border border-white/20 hover:bg-black/60"
                >
                  Stop
                </button>
              </div>
            ) : (
              <span className="text-slate-300">
                {language === 'te-IN'
                  ? 'మాట్లాడటానికి మైక్రోఫోన్‌పై నొక్కండి'
                  : language === 'hi-IN'
                  ? 'बोलने के लिए माइक दबाएं'
                  : language === 'ta-IN'
                  ? 'பேச மைக்ரோஃபோனை அழுத்தவும்'
                  : 'Tap Microphone to Speak'}
              </span>
            )}
          </div>

          {/* Live Transcript Bubble */}
          {transcript && (
            <div className="mt-4 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 text-sm max-w-lg italic">
              "{transcript}"
            </div>
          )}

          {/* Mute TTS Control */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="mt-6 inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'Voice Audio Muted' : 'Voice Audio Enabled'}</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="mb-8">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          {language === 'te-IN'
            ? 'సూచించిన వాయిస్ ప్రశ్నలు (Telugu Prompts)'
            : language === 'hi-IN'
            ? 'सुझाए गए वॉयस प्रश्न'
            : language === 'ta-IN'
            ? 'பரிந்துரைக்கப்பட்ட குரல் கேள்விகள் (Tamil Prompts)'
            : 'Suggested Voice Prompts'}
        </div>
        <div className="flex flex-wrap gap-2">
          {promptsByLang[language].map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 text-xs font-semibold text-slate-700 shadow-sm transition-all text-left"
            >
              🎤 "{p}"
            </button>
          ))}
        </div>
      </div>

      {/* Conversation History & Recommendations */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[500px]">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">
              Live Interaction Feed ({messages.length} exchanges)
            </span>
          </div>
          <button
            onClick={() =>
              setMessages([
                {
                  role: 'assistant',
                  text: greetingsByLang[language],
                  timestamp: new Date(),
                },
              ])
            }
            className="text-xs text-slate-500 hover:text-red-600 font-semibold"
          >
            Clear Feed
          </button>
        </div>

        {/* Message Stream with ref for container-level scrolling */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-2xl rounded-2xl p-4 text-sm ${
                  m.role === 'user'
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'bg-slate-100 text-slate-900 border border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1 opacity-75 text-[11px] font-bold">
                  {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{m.role === 'user' ? 'You (Voice/Text)' : 'AgriTrade AI'}</span>
                </div>
                <p className="leading-relaxed whitespace-pre-line">{m.text}</p>

                {m.tool && (
                  <div className="mt-2 text-[10px] font-bold px-2 py-0.5 bg-black/10 rounded inline-block text-emerald-800">
                    Tool Executed: {m.tool}
                  </div>
                )}
              </div>

              {/* Render Product Cards in Voice stream */}
              {m.products && m.products.length > 0 && (
                <div className="mt-4 w-full">
                  <div className="text-xs font-bold text-slate-500 mb-2">
                    📦 Recommended Verified Produce Lots ({m.products.length}):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {m.products.map((prod) => (
                      <ProductCard key={prod._id} product={prod} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Text Input Fallback Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="p-3 bg-slate-50 border-t border-slate-200 flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder={
              language === 'te-IN'
                ? 'మైక్రోఫోన్ ఉపయోగించకపోతే మీ వ్యవసాయ ప్రశ్నను ఇక్కడ టైప్ చేయండి...'
                : language === 'hi-IN'
                ? 'यदि माइक का उपयोग नहीं कर रहे हैं तो प्रश्न टाइप करें...'
                : language === 'ta-IN'
                ? 'மைக்ரோஃபோன் பயன்படுத்தவில்லை என்றால் விவசாயக் கேள்வியை இங்கே தட்டச்சு செய்யவும்...'
                : 'Type your agricultural question if not using microphone...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || status === 'thinking'}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-1.5 shadow"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
