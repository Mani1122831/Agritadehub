import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface BackgroundRevealVideoProps {
  src: string;
  poster: string;
  badgeText: string;
  className?: string;
  overlayOpacity?: string;
  children: React.ReactNode;
}

export const BackgroundRevealVideo: React.FC<BackgroundRevealVideoProps> = ({
  src,
  poster,
  badgeText,
  className = '',
  overlayOpacity = 'bg-slate-950/80',
  children,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Fallback if browser requires touch/click gesture
          setIsPlaying(false);
        });
    }

    // Intersection observer to play when scrolled into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasError) {
            video.play().then(() => setIsPlaying(true)).catch(() => {});
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [src, hasError]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl border border-emerald-900/30 ${className}`}
    >
      {/* Background Video Layer with Parallax / Reveal feel */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={poster}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover filter brightness-90 scale-105 transition-transform duration-1000"
        >
          <source src={src} type="video/mp4" />
        </video>

        {/* Gradient Scrim for high contrast readability */}
        <div className={`absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/60 ${overlayOpacity}`}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50"></div>
      </div>

      {/* Floating Badge (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
        <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5 shadow-lg">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
          <span>{badgeText}</span>
        </div>

        {/* Video Play / Pause Toggle Button */}
        <button
          onClick={togglePlay}
          type="button"
          className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white transition-all shadow-lg"
          title={isPlaying ? 'Pause Background Video' : 'Play Background Video'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
        </button>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
