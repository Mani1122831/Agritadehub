import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Search,
  Send,
  Mic,
  Image as ImageIcon,
  Bot,
  User,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { ProductCard } from '../components/common/ProductCard';
import { Product } from '../types';

export const AiInsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'assistant'; text: string; products?: Product[]; tool?: string }[]
  >([
    {
      role: 'assistant',
      text: 'Welcome to AgriTrade Grounded AI. I am strictly connected to our live product database, verified inventory, order logs, and regional mandi tools. I will never hallucinate or invent unverified prices or stock.',
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // AI Image Generation State
  const [imagePrompt, setImagePrompt] = useState('Fresh organic heirloom tomatoes in woven harvest basket at sunrise');
  const [generatedImage, setGeneratedImage] = useState<any>(null);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    apiRequest('/ai/insights')
      .then((res) => {
        if (res.success && res.insights) {
          setInsights(res.insights);
        }
      })
      .catch((err) => console.warn('AI insights error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSendMessage = async (msgText: string) => {
    if (!msgText.trim()) return;

    setChatMessages((prev) => [...prev, { role: 'user', text: msgText }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await apiRequest('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: msgText }),
      });

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.reply || "I don't have verified information for that right now.",
          products: res.productCards || [],
          tool: res.toolExecuted,
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "I don't have verified information for that right now.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim()) return;
    setImageLoading(true);

    try {
      const res = await apiRequest('/ai/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      if (res.success) {
        setGeneratedImage(res);
      }
    } catch (err: any) {
      alert(err.message || 'Image generation failed');
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-16">
      {/* Top Banner */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Multimodal Agricultural AI Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Agri AI Market Intelligence & Grounded Assistant
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Zero-hallucination marketplace intelligence. All price recommendations, supply forecasts, and voice queries are strictly verified against database records.
        </p>
      </div>

      {/* ========================================================= */}
      {/* 1. Demand & Price Forecast Grid                            */}
      {/* ========================================================= */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Regional Demand Forecasts & AI Price Range
          </h2>
          <span className="text-xs text-slate-400">
            Source: AgriTrade AI Demand Model v2.6 • Labelled as AI estimate
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {insights.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {item.demandStatus}
                  </span>
                  <span className="text-xs font-black text-emerald-600 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                    {item.trendPercentage}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3">{item.commodity}</h3>

                <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Marketplace Rate:</span>
                    <strong className="text-slate-900">₹{item.currentPrice}/kg</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>AI Target Range:</span>
                    <strong className="text-emerald-700">{item.recommendedRange}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span>Mandi APMC Benchmark:</span>
                    <span>₹{item.mandiBenchmark}/kg</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                  {item.explanation}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-900 bg-emerald-50/70 p-2.5 rounded-xl">
                💡 <span className="font-bold">AI Estimate Advice:</span> {item.recommendedAction}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. Interactive Grounded AI Assistant & Hallucination Test  */}
      {/* ========================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  🤖
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Grounded Agricultural AI Assistant
                  </h3>
                  <div className="text-[10px] text-emerald-700 font-semibold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Grounded Tool Retrieval: ZERO Hallucination Engine</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-400">SIH 2026 Aligned</span>
            </div>

            {/* Chat Stream */}
            <div className="py-4 space-y-3.5 max-h-[420px] overflow-y-auto">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-emerald-700 text-white rounded-br-none'
                        : 'bg-slate-50 text-slate-900 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.tool && (
                      <div className="text-[10px] text-emerald-700 font-bold mb-1 flex items-center space-x-1 border-b border-emerald-100 pb-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified Database Tool: {msg.tool}()</span>
                      </div>
                    )}
                    {msg.text}
                  </div>

                  {/* Render Product Cards inside chat */}
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

              {chatLoading && (
                <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-50 p-3 rounded-2xl w-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
                  <span>Executing verified database query...</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Grounded Prompts */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center space-x-2 overflow-x-auto text-[11px] pb-1">
              <span className="text-slate-400 font-bold shrink-0">Test Prompts:</span>
              <button
                onClick={() => handleSendMessage('Show tomatoes below ₹35')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 text-slate-700 rounded-full shrink-0"
              >
                🍅 Tomatoes under ₹35
              </button>
              <button
                onClick={() => handleSendMessage('Who has 500 kg onions?')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 text-slate-700 rounded-full shrink-0"
              >
                🧅 500kg Onions
              </button>
              <button
                onClick={() => handleSendMessage('Recommend a supplier near Guntur')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 text-slate-700 rounded-full shrink-0"
              >
                📍 Suppliers near Guntur
              </button>
              <button
                onClick={() => handleSendMessage('Do you have Martian Dragonfruits?')}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-full shrink-0 font-bold"
                title="Hallucination Test: Must refuse unverified products"
              >
                🧪 Hallucination Test
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(chatInput);
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder="Ask about live products, prices, stock, suppliers, or orders..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-100 px-4 py-2.5 rounded-full text-xs sm:text-sm border focus:outline-none focus:bg-white focus:border-emerald-600"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className="p-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full disabled:opacity-40 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* AI Concept Image Generation Panel */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <ImageIcon className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Concept Generator</h3>
              <div className="text-[10px] text-slate-400">Clearly labelled secondary concepts</div>
            </div>
          </div>

          <form onSubmit={handleGenerateImage} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Visual Prompt
              </label>
              <textarea
                rows={3}
                required
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 p-3 rounded-2xl text-xs border focus:outline-none focus:bg-white focus:border-emerald-600"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={imageLoading}
              className="w-full py-2.5 bg-slate-900 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              {imageLoading ? 'Generating Concept...' : 'Generate Promotional Concept'}
            </button>
          </form>

          {/* Generated Image Result */}
          {generatedImage && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200 shadow-sm">
                <img
                  src={generatedImage.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                  {generatedImage.badge}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed italic">
                "{generatedImage.note}"
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
