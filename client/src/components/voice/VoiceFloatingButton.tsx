import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, X, Send, Bot, User, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { ProductCard } from '../common/ProductCard';
import { Product } from '../../types';
import { normalizeTextForSpeech } from '../../utils/speechNormalizer';

export type VoiceLang = 'en-IN' | 'hi-IN' | 'te-IN' | 'ta-IN';

export const VoiceFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState<VoiceLang>('en-IN');
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; products?: Product[]; tool?: string }[]
  >([
    {
      role: 'assistant',
      text: 'Namaste! I am AgriTrade Voice Assistant. You can speak to me or type your question. Try: "Show tomatoes below ₹35", "Who has 500 kg onions?", or "What is the price of tomatoes?"',
    },
  ]);
  const [isMuted, setIsMuted] = useState(false);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll ONLY inside the modal's message stream container, NEVER the window/body
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Initialize Web Speech Recognition
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
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        transcriptRef.current = currentTranscript;
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
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
      alert('Speech Recognition is not supported in this browser. Please type your message below.');
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
        // restart
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
    const cleanText = normalizeTextForSpeech(text, language);
    const utterance = new SpeechSynthesisUtterance(cleanText);
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

  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', text: queryText }]);
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
        },
      ]);

      speakText(reply);
    } catch (err: any) {
      const errorMsg = "I couldn't reach the agricultural knowledge base right now.";
      setMessages((prev) => [...prev, { role: 'assistant', text: errorMsg }]);
      setStatus('idle');
    }
  };

  const cancelSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setStatus('idle');
  };

  return (
    <>
      {/* Floating Microphone Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3">
        {!isOpen && (
          <div className="hidden sm:flex items-center space-x-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full border border-emerald-300 shadow-lg text-xs font-bold text-emerald-900 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Ask Agri AI (Voice)</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform hover:scale-110 ${
            status === 'listening'
              ? 'bg-red-600 ring-8 ring-red-300 animate-pulse'
              : status === 'speaking'
              ? 'bg-amber-600 ring-4 ring-amber-300'
              : 'bg-emerald-700 hover:bg-emerald-800 ring-4 ring-emerald-500/20'
          }`}
          title="AgriTrade Voice & AI Assistant"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
      </div>

      {/* Voice Assistant Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[92vw] sm:w-[420px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-700/60 flex items-center justify-center border border-emerald-500/30">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">AgriTrade Grounded Voice AI</h3>
                <div className="text-[10px] text-emerald-300 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Zero Hallucination • Mandi Data</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Language Pills */}
              <div className="flex items-center space-x-1 bg-emerald-950/70 p-0.5 rounded-lg border border-emerald-500/30 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setLanguage('en-IN')}
                  className={`px-1.5 py-0.5 rounded transition-all ${
                    language === 'en-IN' ? 'bg-emerald-600 text-white shadow' : 'text-emerald-200 hover:text-white'
                  }`}
                  title="English (India)"
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi-IN')}
                  className={`px-1.5 py-0.5 rounded transition-all ${
                    language === 'hi-IN' ? 'bg-emerald-600 text-white shadow' : 'text-emerald-200 hover:text-white'
                  }`}
                  title="Hindi (हिंदी)"
                >
                  हिं
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('te-IN')}
                  className={`px-2 py-0.5 rounded transition-all font-semibold ${
                    language === 'te-IN' ? 'bg-emerald-600 text-white shadow ring-1 ring-amber-400' : 'text-emerald-200 hover:text-white'
                  }`}
                  title="Telugu (తెలుగు)"
                >
                  తెలుగు
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('ta-IN')}
                  className={`px-2 py-0.5 rounded transition-all font-semibold ${
                    language === 'ta-IN' ? 'bg-emerald-600 text-white shadow ring-1 ring-emerald-400' : 'text-emerald-200 hover:text-white'
                  }`}
                  title="Tamil (தமிழ்)"
                >
                  தமிழ்
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 hover:bg-emerald-700 rounded-lg text-emerald-200 hover:text-white transition-colors"
                title={isMuted ? 'Unmute Speech' : 'Mute Speech'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-emerald-700 rounded-lg text-emerald-200 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Voice State Indicator Bar */}
          {status !== 'idle' && (
            <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center justify-between text-xs font-semibold text-emerald-800">
              <div className="flex items-center space-x-2">
                {status === 'listening' && (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                    <span className="text-red-700 font-bold">
                      {language === 'te-IN'
                        ? 'వింటున్నాను... మాట్లాడండి!'
                        : language === 'hi-IN'
                        ? 'सुन रहा हूँ... बोलिए!'
                        : language === 'ta-IN'
                        ? 'கேட்கிறேன்... பேசுங்கள்!'
                        : 'Listening to you... Speak now!'}
                    </span>
                  </>
                )}
                {status === 'thinking' && (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-spin"></span>
                    <span>
                      {language === 'te-IN'
                        ? 'జెమిని ఫ్లాష్‌తో వెతుకుతోంది...'
                        : language === 'ta-IN'
                        ? 'ஜெமினி ஃபிளாஷ் மூலம் தேடுகிறது...'
                        : language === 'hi-IN'
                        ? 'जेमिनी फ्लैश के साथ खोज रहा है...'
                        : 'Querying verified database & mandi tools...'}
                    </span>
                  </>
                )}
                {status === 'speaking' && (
                  <>
                    <div className="flex items-end space-x-0.5 h-3">
                      <span className="w-1 bg-emerald-600 voice-bar h-2"></span>
                      <span className="w-1 bg-emerald-600 voice-bar h-3"></span>
                      <span className="w-1 bg-emerald-600 voice-bar h-1"></span>
                    </div>
                    <span>
                      {language === 'te-IN'
                        ? 'సమాధానం చెబుతున్నాను...'
                        : language === 'ta-IN'
                        ? 'பதில் கூறுகிறது...'
                        : language === 'hi-IN'
                        ? 'उत्तर दे रहा हूँ...'
                        : 'Speaking verified answer...'}
                    </span>
                  </>
                )}
              </div>

              {status === 'speaking' && (
                <button
                  onClick={cancelSpeaking}
                  className="text-[10px] text-red-600 font-bold hover:underline"
                >
                  Stop Audio
                </button>
              )}
            </div>
          )}

          {/* Messages Stream - Container with ref to scroll internally without moving the webpage */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[380px] bg-slate-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-emerald-700 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.tool && (
                    <div className="text-[10px] text-emerald-700 font-bold mb-1 flex items-center space-x-1 border-b border-emerald-100 pb-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified via {msg.tool}()</span>
                    </div>
                  )}
                  {msg.text}
                </div>

                {/* Render product cards inside chat if returned */}
                {msg.products && msg.products.length > 0 && (
                  <div className="w-full mt-2 grid grid-cols-2 gap-2">
                    {msg.products.slice(0, 2).map((prod) => (
                      <div key={prod._id} className="scale-90 origin-top">
                        <ProductCard product={prod} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="bg-white px-3 py-1.5 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto text-[11px] text-slate-600">
            {language === 'ta-IN' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSendMessage('தக்காளி விலை என்ன?')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shrink-0 transition-colors"
                >
                  🍅 தக்காளி விலை
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('500 கிலோ வெங்காயம் யாரிடம் உள்ளது?')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shrink-0 transition-colors"
                >
                  🧅 500kg வெங்காயம்
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('என் ஆர்டர் எங்கே உள்ளது?')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shrink-0 transition-colors"
                >
                  📦 ஆர்டர் டிராக்
                </button>
              </>
            ) : language === 'te-IN' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSendMessage('మదనపల్లెలో టమాటా ధర ఎంత?')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shrink-0 transition-colors"
                >
                  🍅 టమాటా ధర
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('మిరప తోటలో నల్ల తామర పురుగు నివారణ ఏమిటి?')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shrink-0 transition-colors"
                >
                  🌶️ మిరప తామర పురుగు
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('కందులకు ప్రభుత్వం మద్దతు ధర ఎంత?')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shrink-0 transition-colors"
                >
                  🟡 కందుల MSP
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('నిమ్మకాయ మార్కెట్ రేటు ఎంత?')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shrink-0 transition-colors"
                >
                  🍋 నిమ్మకాయ ధర
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('వరిలో అగ్గి తెగులు నివారణ చర్యలు ఏమిటి?')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shrink-0 transition-colors"
                >
                  🌾 వరి అగ్గి తెగులు
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('500 కిలోల ఉల్లిపాయలు ఎవరి వద్ద ఉన్నాయి?')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shrink-0 transition-colors"
                >
                  🧅 500kg ఉల్లిపాయలు
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('నా ఆర్డర్ ఎక్కడ ఉంది?')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shrink-0 transition-colors"
                >
                  📦 ఆర్డర్ ట్రాక్
                </button>
              </>
            ) : language === 'hi-IN' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSendMessage('गुंटूर में टमाटर का भाव क्या है?')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shrink-0 transition-colors"
                >
                  🍅 टमाटर भाव
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('500 किलो प्याज किसके पास है?')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shrink-0 transition-colors"
                >
                  🧅 500kg प्याज
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('मेरा ऑर्डर कहाँ है?')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shrink-0 transition-colors"
                >
                  📦 ऑर्डर ट्रैक
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Show tomatoes below ₹35')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shrink-0 transition-colors"
                >
                  🍅 Tomatoes under ₹35
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Who has 500 kg onions?')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shrink-0 transition-colors"
                >
                  🧅 500kg Onions
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Where is my order?')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shrink-0 transition-colors"
                >
                  📦 Track Order
                </button>
              </>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-full text-white transition-all ${
                status === 'listening'
                  ? 'bg-red-600 ring-4 ring-red-200 animate-pulse'
                  : 'bg-emerald-700 hover:bg-emerald-800'
              }`}
              title={status === 'listening' ? 'Stop Listening' : 'Tap to Speak'}
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder={
                status === 'listening'
                  ? language === 'te-IN'
                    ? 'వింటున్నాను...'
                    : language === 'ta-IN'
                    ? 'கேட்கிறேன்...'
                    : language === 'hi-IN'
                    ? 'सुन रहा हूँ...'
                    : 'Listening...'
                  : language === 'te-IN'
                  ? 'మాట్లాడండి లేదా టైప్ చేయండి...'
                  : language === 'ta-IN'
                  ? 'பேசவும் அல்லது தட்டச்சு செய்யவும்...'
                  : language === 'hi-IN'
                  ? 'बोलिए या टाइप करें...'
                  : 'Type or speak your request...'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
              className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-4 py-2 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-emerald-600"
            />

            <button
              type="button"
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim()}
              className="p-2.5 rounded-full bg-slate-900 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
