import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Sparkles, Film, ArrowDown, ShoppingBag, Mic, FolderUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FrameUploadModal } from '../admin/FrameUploadModal';
import { API_BASE } from '../../services/api';

export const CinematicScrollCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [frameUrls, setFrameUrls] = useState<string[]>([]);
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeFrame, setActiveFrame] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [lang, setLang] = useState<'en' | 'te' | 'ta' | 'hi'>('en');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  const currentFrameRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const animFrameIdRef = useRef<number>(0);
  const playIntervalRef = useRef<any>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  // 1. Fetch frames manifest from server / public directory
  const loadFramesManifest = useCallback(async () => {
    try {
      const res = await fetch(`/frames/manifest.json?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.frames) && data.frames.length > 0) {
          setFrameUrls(data.frames);
          return data.frames;
        }
      }
    } catch (e) {
      console.warn('Could not load frames/manifest.json directly, trying API...');
    }

    try {
      const apiRes = await fetch(`${API_BASE}/frames?t=${Date.now()}`);
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (Array.isArray(data.frames) && data.frames.length > 0) {
          setFrameUrls(data.frames);
          return data.frames;
        }
      }
    } catch (e) {
      console.warn('Could not fetch from /api/frames fallback.');
    }

    // Default fallback (300 frames)
    const fallback = Array.from({ length: 300 }, (_, i) => `/frames/frame_${String(i + 1).padStart(3, '0')}.jpg`);
    setFrameUrls(fallback);
    return fallback;
  }, []);

  // 2. Preload frames directly into imagesRef
  const startPreloading = useCallback((urls: string[]) => {
    if (!urls.length) return;

    setLoadedCount(0);
    imagesRef.current = new Array(urls.length);

    let count = 0;

    urls.forEach((url, index) => {
      const img = new Image();
      img.src = url;

      img.onload = () => {
        imagesRef.current[index] = img;
        count++;
        setLoadedCount(count);

        // Render first frame immediately as soon as index 0 is ready
        if (index === 0) {
          setIsLoaded(true);
          renderFrameImmediate(img);
        }

        if (count >= 5) {
          setIsLoaded(true);
        }
      };

      img.onerror = () => {
        // Fallback replacement if JPG/PNG mismatched
        const fallbackUrl = url.endsWith('.jpg') ? url.replace('.jpg', '.png') : url.replace('.png', '.jpg');
        const fallbackImg = new Image();
        fallbackImg.src = fallbackUrl;
        fallbackImg.onload = () => {
          imagesRef.current[index] = fallbackImg;
          count++;
          setLoadedCount(count);
          if (index === 0) {
            setIsLoaded(true);
            renderFrameImmediate(fallbackImg);
          }
          if (count >= 5) setIsLoaded(true);
        };
        fallbackImg.onerror = () => {
          count++;
          setLoadedCount(count);
          if (count >= 5) setIsLoaded(true);
        };
      };
    });
  }, []);

  useEffect(() => {
    loadFramesManifest().then((urls) => {
      if (urls && urls.length > 0) {
        startPreloading(urls);
      }
    });

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [loadFramesManifest, startPreloading]);

  // Helper to draw single image immediately
  const renderFrameImmediate = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = canvas.clientWidth || window.innerWidth;
    const displayHeight = canvas.clientHeight || window.innerHeight;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = displayWidth / displayHeight;

    let renderWidth = displayWidth;
    let renderHeight = displayHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      renderWidth = displayWidth;
      renderHeight = displayWidth / imgRatio;
      offsetY = (displayHeight - renderHeight) / 2;
    } else {
      renderHeight = displayHeight;
      renderWidth = displayHeight * imgRatio;
      offsetX = (displayWidth - renderWidth) / 2;
    }

    ctx.clearRect(0, 0, displayWidth, displayHeight);
    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
    ctx.restore();
  };

  // 3. Draw frame on canvas with aspect ratio cover
  const renderFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    const currentImgs = imagesRef.current;
    if (!canvas || !currentImgs.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const total = currentImgs.length;
    const clamped = Math.max(0, Math.min(total - 1, Math.round(frameIndex)));

    // Find the requested image or the nearest loaded neighbor
    let img = currentImgs[clamped];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let offset = 1; offset < total; offset++) {
        const left = clamped - offset;
        const right = clamped + offset;
        if (left >= 0 && currentImgs[left]?.complete && currentImgs[left]?.naturalWidth > 0) {
          img = currentImgs[left];
          break;
        }
        if (right < total && currentImgs[right]?.complete && currentImgs[right]?.naturalWidth > 0) {
          img = currentImgs[right];
          break;
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = canvas.clientWidth || window.innerWidth || 1280;
    const displayHeight = canvas.clientHeight || window.innerHeight || 720;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = displayWidth / displayHeight;

    let renderWidth = displayWidth;
    let renderHeight = displayHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      renderWidth = displayWidth;
      renderHeight = displayWidth / imgRatio;
      offsetY = (displayHeight - renderHeight) / 2;
    } else {
      renderHeight = displayHeight;
      renderWidth = displayHeight * imgRatio;
      offsetX = (displayWidth - renderWidth) / 2;
    }

    ctx.clearRect(0, 0, displayWidth, displayHeight);
    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
    ctx.restore();

    setActiveFrame(clamped);
  };

  // 4. Smooth animation loop for scroll interpolation
  useEffect(() => {
    if (!isLoaded) return;

    const tick = () => {
      if (!isPlaying) {
        const diff = targetFrameRef.current - currentFrameRef.current;
        if (Math.abs(diff) > 0.05) {
          currentFrameRef.current += diff * 0.2;
          renderFrame(currentFrameRef.current);
        }
      }
      animFrameIdRef.current = requestAnimationFrame(tick);
    };

    animFrameIdRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameIdRef.current);
  }, [isLoaded, isPlaying]);

  // Initial draw
  useEffect(() => {
    if (isLoaded && imagesRef.current.length > 0) {
      renderFrame(0);
    }
  }, [isLoaded]);

  // 5. Handle Window Scroll Event
  useEffect(() => {
    const handleScroll = () => {
      if (isPlaying || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollable = rect.height - windowHeight;

      if (totalScrollable <= 0) return;

      const progress = Math.min(Math.max(-rect.top / totalScrollable, 0), 1);
      setScrollProgress(progress);

      const total = frameUrls.length || imagesRef.current.length || 300;
      const target = progress * Math.max(0, total - 1);
      targetFrameRef.current = target;
      renderFrame(target);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isPlaying, frameUrls]);

  // 6. Autoplay Video Toggle
  const togglePlay = () => {
    const total = frameUrls.length || imagesRef.current.length || 300;
    if (isPlaying) {
      setIsPlaying(false);
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    } else {
      setIsPlaying(true);
      playIntervalRef.current = setInterval(() => {
        currentFrameRef.current = (currentFrameRef.current + 1) % total;
        renderFrame(currentFrameRef.current);
      }, 33); // High framerate smooth playback (~30fps for 300 frames)
    }
  };

  const resetAnimation = () => {
    if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    setIsPlaying(false);
    currentFrameRef.current = 0;
    targetFrameRef.current = 0;
    renderFrame(0);
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Reload handler when new frames are uploaded
  const handleReloadFrames = async () => {
    const urls = await loadFramesManifest();
    if (urls && urls.length > 0) {
      startPreloading(urls);
    }
    setIsUploadModalOpen(false);
  };

  const totalFramesCount = frameUrls.length || 1;

  return (
    <section ref={containerRef} className="relative w-full h-[220vh] bg-slate-950">
      {/* Sticky Fullscreen Canvas Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Instant Fallback & Background Poster (Guarantees zero black screen at all times) */}
        <img
          src="/frames/ezgif-frame-001.jpg"
          alt="Agricultural Cinematic Scene"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* The Cinematic Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-10"
          style={{ opacity: isLoaded ? 1 : 0 }}
        />

        {/* Cinematic Vignette & Ambient Gradient Overlays - Subtle for high video clarity and quality */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20 pointer-events-none z-10" />

        {/* Loading Indicator (No frame counts displayed anywhere!) */}
        {!isLoaded && (
          <div className="relative z-30 flex flex-col items-center justify-center text-center p-8 bg-slate-900/80 backdrop-blur-md rounded-3xl border border-emerald-500/30 shadow-2xl">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-white font-bold text-lg mb-1 flex items-center space-x-2">
              <Film className="w-5 h-5 text-emerald-400" />
              <span>Loading Cinematic Experience...</span>
            </div>
            <p className="text-slate-400 text-xs mb-3">Initializing high-definition visual sequence into GPU memory</p>
            <div className="w-56 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-200"
                style={{ width: `${(loadedCount / totalFramesCount) * 100}%` }}
              />
            </div>
            <span className="text-emerald-400 text-xs font-mono mt-2">
              Optimizing Visual Sequence...
            </span>
          </div>
        )}

        {/* ========================================================= */}
        {/* STORY CHAPTER 1: 0% - 35% Progress                       */}
        {/* ========================================================= */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto z-20 pointer-events-none transition-all duration-700 ${
            scrollProgress < 0.35 && isLoaded
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 -translate-y-8 scale-95'
          }`}
        >
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md shadow-lg shadow-emerald-950/60">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>
              {lang === 'te'
                ? 'సినిమాటిక్ విజువల్ స్క్రోల్ • SIH26033'
                : lang === 'ta'
                ? 'சினிமாடிக் விஷுவல் ஸ்க்ரோல் • SIH26033'
                : lang === 'hi'
                ? 'सिनेमैटिक विजुअल स्क्रॉल • SIH26033'
                : 'Cinematic Visual Scroll • SIH26033'}
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6 drop-shadow-2xl">
            {lang === 'te' ? (
              <>
                రైతులకు సాధికారత. <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  ఒకే ఒక్క స్మార్ట్ టచ్‌తో.
                </span>
              </>
            ) : lang === 'ta' ? (
              <>
                விவசாயிகளுக்கு அதிகாரம். <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  ஒரே ஒரு ஸ்மார்ட் தொடுதலில்.
                </span>
              </>
            ) : lang === 'hi' ? (
              <>
                किसानों का सशक्तिकरण। <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  सिर्फ एक स्मार्ट स्पर्श से।
                </span>
              </>
            ) : (
              <>
                Empowering Farmers. <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  One Smart Touch At A Time.
                </span>
              </>
            )}
          </h2>

          <p className="text-base sm:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md mb-8">
            {lang === 'te'
              ? 'గ్రామీణ భారతదేశం ఆధునిక డిజిటల్ వ్యవసాయాన్ని స్వీకరిస్తున్న వేళ, రైతులు 0% దళారీ కమీషన్‌తో నేరుగా రాష్ట్ర మండిలు మరియు బల్క్ కొనుగోలుదారులతో కనెక్ట్ అవుతున్నారు.'
              : lang === 'ta'
              ? 'கிராமப்புற இந்தியா டிஜிட்டல் விவசாயத்தை ஏற்கும் போது, விவசாயிகள் 0% தரகு கட்டணத்துடன் மாநில மண்டிகள் மற்றும் நேரடி வாங்குபவர்களுடன் இணைகிறார்கள்.'
              : lang === 'hi'
              ? 'जैसे-जैसे ग्रामीण भारत आधुनिक डिजिटल ई-कॉमर्स अपना रहा है, किसान 0% दलाली कमीशन के साथ सीधे राज्य मंडियों और थोक खरीदारों से जुड़ रहे हैं।'
              : 'As rural India adopts intelligent e-commerce, Indian farmers connect directly to state mandis and institutional buyers with 0% middleman deduction.'}
          </p>

          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-300 bg-slate-950/50 border border-emerald-500/30 px-4 py-2 rounded-full backdrop-blur-md animate-bounce">
            <ArrowDown className="w-4 h-4 text-emerald-400" />
            <span>
              {lang === 'te'
                ? 'వీడియో చూడటానికి క్రిందికి స్క్రోల్ చేయండి • లేదా ప్లే నొక్కండి'
                : lang === 'ta'
                ? 'வீடியோ பார்க்க கீழே உருட்டவும் • அல்லது ப்ளே அழுத்தவும்'
                : lang === 'hi'
                ? 'वीडियो देखने के लिए नीचे स्क्रॉल करें • या प्ले दबाएं'
                : 'Scroll Down to Scrub Video • Or Press Play'}
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STORY CHAPTER 2: 35% - 72% Progress                      */}
        {/* ========================================================= */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto z-20 pointer-events-none transition-all duration-700 ${
            scrollProgress >= 0.35 && scrollProgress < 0.72 && isLoaded
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-8 scale-95'
          }`}
        >
          {/* Matter Dashboard with 50% Transparency for Video Clarity */}
          <div className="bg-slate-950/50 border border-emerald-400/30 p-6 sm:p-10 rounded-3xl backdrop-blur-md shadow-2xl text-center max-w-2xl w-full">
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-400 mb-2 block">
              {lang === 'te'
                ? 'ధృవీకరించబడిన మండి డేటా'
                : lang === 'ta'
                ? 'சரிபார்க்கப்பட்ட மண்டி தரவு'
                : lang === 'hi'
                ? 'सत्यापित मंडी डेटा'
                : 'Grounded Mandi Discovery'}
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 drop-shadow-md">
              {lang === 'te'
                ? 'నిజ-సమయ AI మార్కెట్ ధరలు'
                : lang === 'ta'
                ? 'நிகழ்நேர AI சந்தை விலைகள்'
                : lang === 'hi'
                ? 'रीयल-टाइम AI मंडी भाव'
                : 'Real-Time AI Market Pricing'}
            </h3>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-6 drop-shadow-sm font-medium">
              {lang === 'te'
                ? '500+ APMC మార్కెట్‌లలో ధృవీకరించబడిన మండి ధరలతో రైతులకు సాధికారత. సరుకు రవాణాకు ముందే బ్యాంక్ ఎస్క్రో బదిలీలు పూర్తి భద్రతను అందిస్తాయి.'
                : lang === 'ta'
                ? '500+ APMC சந்தைகளில் சரிபார்க்கப்பட்ட மண்டி விலைகளுடன் விவசாயிகளுக்கு அதிகாரம். சரக்கு அனுப்பும் முன் வங்கி எஸ்க்ரோ பரிமாற்றம் முழு பாதுகாப்பை உறுதி செய்கிறது.'
                : lang === 'hi'
                ? '500+ APMC मंडियों में सत्यापित मंडी भावों के साथ किसानों को सशक्त बनाना। माल भेजने से पहले बैंक एस्क्रो ट्रांसफर पूर्ण सुरक्षा सुनिश्चित करता है।'
                : 'Empowering farmers with verified mandi benchmarks across 500+ APMC markets. Direct bank escrow transfers ensure complete security before cargo dispatch.'}
            </p>

            <div className="grid grid-cols-3 gap-3 border-t border-white/15 pt-5">
              <div>
                <p className="text-xl sm:text-2xl font-black text-emerald-400 drop-shadow">100K+</p>
                <p className="text-xs text-slate-300 font-medium">
                  {lang === 'te'
                    ? 'ధృవీకరించబడిన రైతులు'
                    : lang === 'ta'
                    ? 'சரிபார்க்கப்பட்ட விவசாயிகள்'
                    : lang === 'hi'
                    ? 'सत्यापित किसान'
                    : 'Verified Farmers'}
                </p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-amber-400 drop-shadow">₹0</p>
                <p className="text-xs text-slate-300 font-medium">
                  {lang === 'te'
                    ? 'దళారీ కమీషన్'
                    : lang === 'ta'
                    ? 'தரகு கட்டணம்'
                    : lang === 'hi'
                    ? 'बिचौलिया शुल्क'
                    : 'Middleman Fee'}
                </p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-teal-400 drop-shadow">
                  {lang === 'te'
                    ? '24 గంటలు'
                    : lang === 'ta'
                    ? '24 மணிநேரம்'
                    : lang === 'hi'
                    ? '24 घंटे'
                    : '24 Hrs'}
                </p>
                <p className="text-xs text-slate-300 font-medium">
                  {lang === 'te'
                    ? 'ఎస్క్రో సెటిల్మెంట్'
                    : lang === 'ta'
                    ? 'எஸ்க்ரோ தீர்வு'
                    : lang === 'hi'
                    ? 'एस्क्रो निपटान'
                    : 'Escrow Settlement'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* STORY CHAPTER 3: 72% - 100% Progress                     */}
        {/* ========================================================= */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto z-20 transition-all duration-700 ${
            scrollProgress >= 0.72 && isLoaded
              ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
              : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
          }`}
        >
          {/* Matter Dashboard with 50% Transparency for Video Clarity */}
          <div className="bg-slate-950/50 border border-emerald-400/30 p-8 sm:p-12 rounded-3xl backdrop-blur-md shadow-2xl max-w-2xl w-full">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {lang === 'te'
                  ? 'వ్యాపారం చేయడానికి సిద్ధమా?'
                  : lang === 'ta'
                  ? 'வர்த்தகம் செய்ய தயாரா?'
                  : lang === 'hi'
                  ? 'व्यापार के लिए तैयार?'
                  : 'Ready to Trade?'}
              </span>
            </div>
            <h3 className="text-3xl sm:text-5xl font-black text-white mb-4">
              {lang === 'te'
                ? 'వ్యవసాయ భవిష్యత్తును అనుభవించండి'
                : lang === 'ta'
                ? 'விவசாயத்தின் எதிர்காலத்தை உணருங்கள்'
                : lang === 'hi'
                ? 'कृषि के भविष्य का अनुभव करें'
                : 'Experience the Future of Agriculture'}
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
              {lang === 'te'
                ? '37+ ధృవీకరించబడిన ఉత్పత్తులను అన్వేషించండి లేదా మా జెమిని వాయిస్ ఏజెంట్‌తో మీ మాతృభాష తెలుగులో మాట్లాడండి.'
                : lang === 'ta'
                ? '37+ சரிபார்க்கப்பட்ட விளைபொருட்களை ஆராயுங்கள் அல்லது உங்கள் தாய்மொழியான தமிழில் எங்கள் ஜெமினி வாய்స్ ஏஜெண்டுடன் பேசுங்கள்.'
                : lang === 'hi'
                ? '37+ सत्यापित कृषि उपज देखें या अपनी मातृभाषा हिंदी में हमारे जेमिनी वॉयस असिस्टेंट से बात करें।'
                : 'Explore 37+ verified produce commodities or speak in your native language with our Gemini Voice Assistant.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/marketplace"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/50 hover:scale-105 transition-all flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {lang === 'te'
                    ? 'మార్కెట్‌ప్లేస్ చూడండి'
                    : lang === 'ta'
                    ? 'சந்தைப்பகுதியை காண்க'
                    : lang === 'hi'
                    ? 'मार्केटप्लेस देखें'
                    : 'Explore Marketplace'}
                </span>
              </Link>
              <Link
                to="/voice-agent"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-sm shadow-lg hover:scale-105 transition-all flex items-center justify-center space-x-2"
              >
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>
                  {lang === 'te'
                    ? 'జెమిని వాయిస్ ఏజెంట్ (తెలుగు)'
                    : lang === 'ta'
                    ? 'ஜெமினி வாய்ஸ் ஏஜெண்ட் (தமிழ்)'
                    : lang === 'hi'
                    ? 'जेमिनी वॉयस असिस्टेंट (हिंदी)'
                    : 'Gemini Voice Agent'}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FLOATING INTERACTIVE CONTROLS (Bottom Bar)               */}
        {/* ========================================================= */}
        <div className="absolute bottom-6 right-6 z-30 flex items-center space-x-3 bg-slate-950/50 border border-emerald-400/30 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl">
          {/* Video Language Switcher Toggle */}
          <div className="flex items-center space-x-1 bg-slate-900/50 p-1 rounded-xl border border-white/15">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === 'en' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('hi')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === 'hi' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Hindi (हिंदी)"
            >
              हिं
            </button>
            <button
              type="button"
              onClick={() => setLang('te')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === 'te' ? 'bg-emerald-600 text-white shadow ring-1 ring-amber-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Telugu (తెలుగు)"
            >
              తెలుగు
            </button>
            <button
              type="button"
              onClick={() => setLang('ta')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === 'ta' ? 'bg-emerald-600 text-white shadow ring-1 ring-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Tamil (தமிழ்)"
            >
              தமிழ்
            </button>
          </div>

          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
            title={isPlaying ? 'Pause Autoplay' : 'Play Cinematic Video'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>
                  {lang === 'te'
                    ? 'పాజ్'
                    : lang === 'ta'
                    ? 'இடைநிறுத்து'
                    : lang === 'hi'
                    ? 'रोकें'
                    : 'Pause'}
                </span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>
                  {lang === 'te'
                    ? 'ప్లే వీడియో'
                    : lang === 'ta'
                    ? 'ப்ளே வீடியோ'
                    : lang === 'hi'
                    ? 'प्ले वीडियो'
                    : 'Play Video'}
                </span>
              </>
            )}
          </button>

          {/* Reset Button */}
          <button
            type="button"
            onClick={resetAnimation}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
            title="Reset to Beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Replace / Upload Frames Button */}
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-all border border-slate-700/50"
            title="Upload New Frames Folder / Archive (Replaces previous frames)"
          >
            <FolderUp className="w-3.5 h-3.5" />
          </button>

          {/* Sleek Scrub Timeline Progress Bar (NO Frame Numbers Shown!) */}
          <div className="hidden sm:flex flex-col items-end pl-2 border-l border-slate-700">
            <span className="text-[10px] text-slate-400 font-medium">
              Cinematic Scrub
            </span>
            <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-emerald-500 transition-all duration-75"
                style={{ width: `${((activeFrame + 1) / totalFramesCount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Frame Upload Modal */}
      <FrameUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onFramesUpdated={handleReloadFrames}
      />
    </section>
  );
};
export default CinematicScrollCanvas;
